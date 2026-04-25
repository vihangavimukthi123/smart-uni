import { useState, useEffect } from "react";
import "./FindPeers.css";
import api from "../../../api/axios";


// --- HELPERS ---
const getInitial = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  // Get first letter of 2nd name if it exists, otherwise 1st name
  if (parts.length > 1) return parts[1].charAt(0).toUpperCase();
  return parts[0].charAt(0).toUpperCase();
};

const getAvatarColor = (name) => {
  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const formatLastSeen = (timestamp) => {
  if (!timestamp) return "Never seen";
  const ts = new Date(timestamp).getTime();
  if (Number.isNaN(ts)) return "Last seen recently";

  const now = new Date();
  const diffMs = now.getTime() - ts;
  
  if (diffMs < 2 * 60 * 1000) return "Active now";

  const mins = Math.floor(diffMs / (60 * 1000));
  if (mins < 60) return `Last seen ${mins} min${mins !== 1 ? 's' : ''} ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    const tsDate = new Date(ts);
    if (tsDate.getDate() !== now.getDate()) {
      return "Last seen yesterday";
    }
    return `Last seen ${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days === 1) return "Last seen yesterday";
  if (days < 7) return `Last seen ${days} days ago`;

  return `Last seen on ${new Date(ts).toLocaleDateString()}`;
};

const toUiPeer = (peer) => ({
  ...peer,
  degree: peer.degree || `BSc IT - Year ${peer.year || 1}`,
  skills: Array.isArray(peer.skills) ? peer.skills : [],
  modules: Array.isArray(peer.modules) ? peer.modules : [],
  lastSeen: formatLastSeen(peer.lastActiveAt || peer.updatedAt),
  isOnlineNow: Date.now() - new Date(peer.lastActiveAt || peer.updatedAt || 0).getTime() < 2 * 60 * 1000,
  reviews: Number(peer.reviewCount) || 0,
  rating: Number(peer.rating) || 0,
});

function PeerAvatar({ peer }) {
  const name = peer?.name || "Student";
  const initial = getInitial(name);
  const bgColor = getAvatarColor(name);

  return (
    <div className="peer-avatar" style={{ backgroundColor: bgColor }}>
      {initial}
    </div>
  );
}

// --- CARD ---
function PeerCard({ peer, onRequest, onReadReviews, recommendedSkill, matchBadge }) {
  return (
    <div className="peer-card">
      {matchBadge && (
        <div className="recommendation-badge">{matchBadge}</div>
      )}

      <div className="peer-header">
        <PeerAvatar peer={peer} />
        <div className="peer-info">
          <h3 className="peer-name">{peer.name}</h3>
          <p className="degree">{peer.degree}</p>
          <p className="peer-last-seen">{peer.lastSeen}</p>
        </div>
        <div className="rating-badge">
          <span className="rating-star">⭐</span>
          <span className="rating-value">{peer.rating > 0 ? Number(peer.rating).toFixed(1) : "N/A"}</span>
        </div>
      </div>

      <div className="skills">
        <span className="skills-label">Skills</span>
        <div className="tags">
          {peer.skills.map((s) => (
            <span key={s} className={`tag ${recommendedSkill === s ? "highlight-tag" : ""}`}>{s}</span>
          ))}
        </div>
      </div>

      <div className="status">
        <span className="review-count">
          <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '3px' }}>reviews</span>
          {peer.reviews} review{peer.reviews !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="card-actions">
        <button className="btn-secondary">View Profile</button>
        <button className="btn-secondary" onClick={() => onReadReviews(peer)}>Read Reviews</button>
      </div>

      <button className="btn-primary" onClick={() => onRequest(peer)}>
        Request Help
      </button>
    </div>
  );
}

// --- TABLE ROW ---
function PeerTableRow({ peer, onRequest }) {
  return (
    <tr>
      <td>
        <div className="student-col">
          <PeerAvatar peer={peer} />
          <div className="student-info">
            <h4>{peer.name}</h4>
            <p>{peer.degree}</p>
            <p className="table-last-seen">{peer.lastSeen}</p>
          </div>
        </div>
      </td>
      <td>
        <div className="tags">
          {peer.skills.map((s) => (
            <span key={s} className="tag">{s}</span>
          ))}
        </div>
      </td>
      <td>
        <span className="table-rating">⭐ {peer.rating}</span>
      </td>
      <td>
        <span className={`table-status ${peer.isOnlineNow ? "online-now" : ""}`}>
          {peer.lastSeen}
        </span>
      </td>
      <td>
        <div className="table-actions">
          <button className="btn-secondary btn-small">View</button>
          <button className="btn-primary btn-small" onClick={() => onRequest(peer)}>
            Request Help
          </button>
        </div>
      </td>
    </tr>
  );
}

// --- MAIN ---
export default function FindPeers() {
  const [showModal, setShowModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [reviewPeer, setReviewPeer] = useState(null);
  const [skill, setSkill] = useState("");
  const [msg, setMsg] = useState("");
  const [date, setDate] = useState("");
  const [peerReviews, setPeerReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ avgRating: 0, reviewCount: 0 });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [dbPeers, setDbPeers] = useState([]);
  const [loadingPeers, setLoadingPeers] = useState(true);

  // Module to Skill Mapping for Advanced Recommendation
  const moduleSkillMapping = {
    "Introduction to Programming": ["Python", "Java", "C++", "Logic", "Coding", "Programming"],
    "Mathematics for Computing": ["Math", "Discrete Math", "Logic", "Calculus"],
    "Object Oriented Concepts": ["Java", "OOP", "Design Patterns", "C++"],
    "Information Systems & Data Modeling": ["SQL", "Database", "ER Diagrams", "Data Modeling"],
    "Internet & Web Technologies": ["HTML", "CSS", "JavaScript", "React", "Web Design", "Frontend"],
    "English for Academic Purposes": ["Writing", "Communication", "Research", "English"],
    "Software Process Modeling": ["Agile", "Scrum", "SDLC", "UML", "Software Engineering"],
    "Computer Networks": ["Networking", "TCP/IP", "Cisco", "Network Configuration"],
    "Operating Systems": ["Linux", "Shell Scripting", "C", "Unix", "Kernel"],
    "Probability & Statistics": ["Statistics", "R", "Probability", "Data Analysis"],
    "Data Structures & Algorithms": ["Algorithms", "Data Structures", "LeetCode", "C++", "Java", "Python"],
    "Mobile Application Development": ["Android", "Flutter", "React Native", "Swift", "Mobile App"],
    "IT Project": ["Project Management", "Teamwork", "Problem Solving", "Collaboration"],
    "Human Computer Interaction": ["UI/UX", "Figma", "User Research", "Adobe XD", "Design"],
    "Business Management for IT": ["Business", "Management", "Entrepreneurship", "Economics"],
    "Information Assurance & Security": ["Cybersecurity", "Network Security", "Cryptography", "Security"],
    "Data Science & Analytics": ["Python", "Pandas", "Machine Learning", "Data Analysis", "NumPy"],
    "Programming Applications and Frameworks": ["React", "Node.js", "Spring Boot", "Django", "Angular", "Vue"],
    "IT Project Management": ["Jira", "Project Management", "Agile", "Trello", "Scrum"],
    "Network Design and Management": ["Cisco", "Network Design", "LAN", "WAN", "Firewall"],
    "Database Systems": ["SQL", "NoSQL", "MongoDB", "Database Design", "PostgreSQL", "MySQL"],
    "Artificial Intelligence": ["Machine Learning", "Neural Networks", "Python", "Deep Learning", "AI"],
    "Cyber Security": ["Hacking", "Penetration Testing", "Security", "Ethical Hacking"],
  };

  // Get user profile
  const getProfile = () => {
    const saved = localStorage.getItem("studentProfile");
    const profile = saved ? JSON.parse(saved) : {};
    return {
      name: profile.name || "",
      email: profile.email || "",
      skills: profile.skills || [],
      selectedModules: profile.selectedModules || [],
      moduleLabels: profile.moduleLabels || [],
      selectedYear: profile.selectedYear || "",
      selectedSemester: profile.selectedSemester || "",
    };
  };

  const currentProfile = getProfile();

  useEffect(() => {
    setFilterYear(currentProfile.selectedYear ? String(currentProfile.selectedYear) : "");
    setFilterSemester(currentProfile.selectedSemester ? String(currentProfile.selectedSemester) : "");
  }, [currentProfile.selectedYear, currentProfile.selectedSemester]);

  useEffect(() => {
    const fetchPeers = async () => {
      try {
        const params = new URLSearchParams();
        if (currentProfile.email) params.append("excludeEmail", currentProfile.email);

        const query = params.toString();
        const res = await api.get(`/learning/peers${query ? `?${query}` : ""}`);
        setDbPeers((res.data || []).map(toUiPeer));
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoadingPeers(false);
      }
    };
    fetchPeers();
  }, [currentProfile.email]);

  const allPeers = dbPeers.filter((p) => !!p);
  const [filteredPeers, setFilteredPeers] = useState([]);

  // Modified Recommendation logic: Match user's modules with others' skills
  // We now use allPeers instead of only ratedPeers so new students without reviews can be recommended
  const recommendedPeers = allPeers
    .map(p => {
      if (!p) return null;
      const peerSkills = (p.skills || []).map(s => s.toLowerCase());
      const userModules = currentProfile.moduleLabels || [];

      let bestMatch = null;
      let matchType = "";

      // Check each user module for matching peer skills
      for (const moduleLabel of userModules) {
        // Direct match: peer has a skill that is exactly the module name
        const directMatch = p.skills.find(s => s.toLowerCase() === moduleLabel.toLowerCase());
        if (directMatch) {
          bestMatch = directMatch;
          matchType = "EXPERT IN " + moduleLabel.toUpperCase();
          break;
        }

        // Indirect match: peer has a skill mapping to this module
        const relatedSkills = moduleSkillMapping[moduleLabel] || [];
        const foundRelated = p.skills.find(s =>
          relatedSkills.some(rs => rs.toLowerCase() === s.toLowerCase())
        );
        if (foundRelated) {
          bestMatch = foundRelated;
          matchType = `SKILLED IN ${foundRelated.toUpperCase()} (FOR ${moduleLabel.toUpperCase()})`;
          break;
        }
      }

      if (bestMatch) {
        return { ...p, matchedBy: matchType, recommendedSkill: bestMatch };
      }
      return null;
    })
    .filter(Boolean)
    // Sort by rating descending (User requirement: high ratings on that relevant skill)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  // Get unique modules and skills for dropdowns
  const modulesList = [...new Set(allPeers.flatMap(p => p?.modules || []))];
  const skillsList = [...new Set(allPeers.flatMap(p => p?.skills || []))];

  // Filter peers based on search & filters
  useEffect(() => {
    let temp = allPeers.filter(p => {
      if (!p) return false;
      const nameMatch = (p.name || "").toLowerCase().includes((searchName || "").toLowerCase());
      const moduleMatch = filterModule ? (p.modules || []).some(m => m && m.includes(filterModule)) : true;
      const skillMatch = filterSkill ? (p.skills || []).some(s => s && s.includes(filterSkill)) : true;
      const yearMatch = filterYear ? String(p.year) === String(filterYear) : true;
      const semMatch = filterSemester ? String(p.semester) === String(filterSemester) : true;
      return nameMatch && moduleMatch && skillMatch && yearMatch && semMatch;
    });
    setFilteredPeers(temp);
  }, [searchName, filterModule, filterSkill, filterYear, filterSemester, dbPeers]);

  // Get current datetime for min attribute
  const nowISO = new Date().toISOString().slice(0, 16);

  const openReviewsModal = async (peer) => {
    if (!peer?.email) {
      alert("No review profile available for this peer.");
      return;
    }

    setReviewPeer(peer);
    setShowReviewsModal(true);
    setLoadingReviews(true);
    setPeerReviews([]);

    try {
      const res = await api.get(`/learning/peerreviews/peer/${encodeURIComponent(peer.email)}`);
      setPeerReviews(Array.isArray(res.data.reviews) ? res.data.reviews : []);
      setReviewSummary(res.data.summary || { avgRating: 0, reviewCount: 0 });
    } catch (err) {
      console.error(err);
      alert("Failed to load reviews.");
    } finally {
      setLoadingReviews(false);
    }
  };

  return (
    <>
      <main className="peers-content">
        {/* TOPBAR */}
        <div className="topbar">
          <h1>Find Peers</h1>
        </div>

        {/* FILTER */}
        <div className="filter">
          <input
            placeholder="Search by student name..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
          <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
            <option value="">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
          <select value={filterModule} onChange={e => setFilterModule(e.target.value)}>
            <option value="">Select Module</option>
            {modulesList.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}>
            <option value="">Select Skill</option>
            {skillsList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-primary" onClick={() => { }}>Search</button>
        </div>

        {/* AI RECOMMENDED PEERS */}
        {!searchName && !filterModule && !filterSkill && !filterYear && !filterSemester && recommendedPeers.length > 0 && (
          <div className="recommendations-section">
            <div className="recommendation-header">
              <span className="material-symbols-outlined ai-icon">auto_awesome</span>
              <h2>Recommended Mentors for You</h2>
            </div>
            <div className="recommendation-grid">
              {recommendedPeers.map(p => (
                <div key={`rec-${p.id || p._id}`} className="recommended-card-wrapper">
                  <PeerCard
                    peer={p}
                    matchBadge={`MATCHED TO ${p.matchedBy.toUpperCase()}`}
                    onReadReviews={openReviewsModal}
                    recommendedSkill={p.recommendedSkill}
                    onRequest={(peer) => {
                      setSelectedPeer(peer);
                      setSkill("");
                      setMsg("");
                      setDate("");
                      setShowModal(true);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIST TABLE SECTION */}
        <div className="peers-list-section">
          <h2>All Available Peers</h2>
          <div className="peer-table-container">
            <table className="peer-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Skills</th>
                  <th>Rating</th>
                  <th>Last Seen</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPeers.map((p) => (
                  <PeerTableRow
                    key={p.id || p._id}
                    peer={p}
                    onRequest={(peer) => {
                      setSelectedPeer(peer);
                      setSkill("");
                      setMsg("");
                      setDate("");
                      setShowModal(true);
                    }}
                  />
                ))}
              </tbody>
            </table>
            {filteredPeers.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                No peers found matching your filters.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL */}
      {showModal && selectedPeer && (
        <div className="modal-bg">
          <div className="modal">
            <h2>Request Help - {selectedPeer.name}</h2>

            <select value={skill} onChange={(e) => setSkill(e.target.value)}>
              <option value="">Select Skill</option>
              {selectedPeer.skills.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <textarea
              placeholder="Describe your problem..."
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />

            <input
              type="datetime-local"
              value={date}
              min={nowISO} // prevent past date selection
              onChange={(e) => setDate(e.target.value)}
            />

            <div className="actions">
              <button
                className="btn-primary"
                onClick={async () => {
                  if (!skill || !msg || !date) {
                    alert("Fill all fields");
                    return;
                  }

                  try {
                    await api.post("/learning/requests", {
                      senderName: currentProfile.name || "Student",
                      senderEmail: currentProfile.email || "",
                      receiverName: selectedPeer.name,
                      receiverEmail: selectedPeer.email || "",
                      skill: skill,
                      message: msg,
                      date: date,
                    });

                    alert(`Request Sent to ${selectedPeer.name}!`);
                    setShowModal(false);
                  } catch (err) {
                    console.error(err);
                    alert("Error sending request");
                  }
                }}
              >
                Send
              </button>

              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEWS MODAL */}
      {showReviewsModal && reviewPeer && (
        <div className="modal-bg" onClick={() => setShowReviewsModal(false)}>
          <div className="modal reviews-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Reviews - {reviewPeer.name}</h2>
            <p className="reviews-summary">
              ⭐ {Number(reviewSummary.avgRating || 0).toFixed(1)} average from {reviewSummary.reviewCount || 0} review(s)
            </p>

            {loadingReviews ? (
              <p>Loading reviews...</p>
            ) : peerReviews.length === 0 ? (
              <p>No reviews yet for this peer.</p>
            ) : (
              <div className="reviews-list">
                {peerReviews.map((r) => (
                  <div className="review-item" key={r._id}>
                    <div className="review-item-top">
                      <strong>{r.reviewerName}</strong>
                      <span>⭐ {r.rating}</span>
                    </div>
                    <p>{r.comment || "No comment provided."}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="actions">
              <button className="btn-primary" onClick={() => setShowReviewsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

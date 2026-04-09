import React, { useState, useEffect, useRef } from "react";
import "./Dashboard.css";
import { Link } from "react-router-dom";
import api from "../../../api/axios";

// --- Feature Cards Data ---
const features = [
  {
    id: 1,
    icon: "group",
    title: "Peer Skill Sharing",
    description:
      "Find students with specialized skills that match your current learning needs and projects.",
    linkLabel: "Explore Peers",
    link: "/peers",
  },
  {
    id: 2,
    icon: "assignment",
    title: "Micro Academic Tasks",
    description:
      "Post or collaborate on small academic tasks, problem sets, and quick feedback loops.",
    linkLabel: "View Tasks",
    link: "/tasks",
  },
  {
    id: 3,
    icon: "menu_book",
    title: "Resource Sharing Hub",
    description:
      "Access and share high-quality study materials, lecture notes, and research papers.",
    linkLabel: "Browse Resources",
    link: "/resources",
  },
];

// --- Year and Semester Options ---
const YEAR_OPTIONS = [
  { value: 1, label: "Year 1" },
  { value: 2, label: "Year 2" },
  { value: 3, label: "Year 3" },
  { value: 4, label: "Year 4" },
];

const SEMESTER_OPTIONS = [
  { value: 1, label: "Semester 1" },
  { value: 2, label: "Semester 2" },
];

const SPECIALIZATION_OPTIONS = [
  { value: "IT", label: "Information Technology (IT)" },
  { value: "SE", label: "Software Engineering (SE)" },
  { value: "DS", label: "Data Science (DS)" },
  { value: "CS", label: "Computer Science (CS)" },
];

// --- Module options ---
const MODULE_OPTIONS = [
  // Year 1 - Semester 1
  { value: "IT1010", label: "Introduction to Programming", icon: "computer", color: "#4f46e5", year: 1, semester: 1 },
  { value: "IT1030", label: "Mathematics for Computing", icon: "calculate", color: "#ea580c", year: 1, semester: 1 },
  { value: "IT1050", label: "Object Oriented Concepts", icon: "code", color: "#0891b2", year: 1, semester: 1 },
  { value: "IT1090", label: "Information Systems & Data Modeling", icon: "storage", color: "#7c3aed", year: 1, semester: 1 },

  // Year 1 - Semester 2
  { value: "IT1100", label: "Internet & Web Technologies", icon: "language", color: "#db2777", year: 1, semester: 2 },
  { value: "IT1080", label: "English for Academic Purposes", icon: "menu_book", color: "#ea580c", year: 1, semester: 2 },
  { value: "IT1060", label: "Software Process Modeling", icon: "developer_mode", color: "#0891b2", year: 1, semester: 2 },

  // Year 2 - Semester 1
  { value: "IT2050", label: "Computer Networks", icon: "lan", color: "#4f46e5", year: 2, semester: 1 },
  { value: "OS201", label: "Operating Systems", icon: "settings", color: "#ea580c", year: 2, semester: 1 },

  // Year 2 - Semester 2
  { value: "IT2110", label: "Probability & Statistics", icon: "calculate", color: "#db2777", year: 2, semester: 2 },
  { value: "IT2070", label: "Data Structures & Algorithms", icon: "hub", color: "#7c3aed", year: 2, semester: 2 },
  { value: "IT2010", label: "Mobile Application Development", icon: "smartphone", color: "#0891b2", year: 2, semester: 2 },
  { value: "IT2080", label: "IT Project", icon: "assignment", color: "#ea580c", year: 2, semester: 2 },

  // Year 3 - Semester 1
  { value: "IT3060", label: "Human Computer Interaction", icon: "palette", color: "#f43f5e", year: 3, semester: 1 },
  { value: "IT3090", label: "Business Management for IT", icon: "business", color: "#10b981", year: 3, semester: 1 },
  { value: "IT3070", label: "Information Assurance & Security", icon: "security", color: "#6366f1", year: 3, semester: 1 },
  { value: "IT3080", label: "Data Science & Analytics", icon: "analytics", color: "#f59e0b", year: 3, semester: 1 },

  // Year 3 - Semester 2
  { value: "IT3030", label: "Programming Applications and Frameworks", icon: "apps", color: "#3b82f6", year: 3, semester: 2 },
  { value: "IT3040", label: "IT Project Management", icon: "checklist", color: "#8b5cf6", year: 3, semester: 2 },
  { value: "IT3010", label: "Network Design and Management", icon: "hub", color: "#06b6d4", year: 3, semester: 2 },
  { value: "IT3020", label: "Database Systems", icon: "database", color: "#ec4899", year: 3, semester: 2 },

  // Year 4 - Semester 1
  { value: "IT4010_AI", label: "Artificial Intelligence", icon: "psychology", color: "#7c3aed", year: 4, semester: 1 },
  { value: "SEC401", label: "Cyber Security", icon: "lock", color: "#db2777", year: 4, semester: 1 },
];

// --- Helpers ---
const getModuleData = (value) =>
  MODULE_OPTIONS.find((m) => m.value === value) || { label: value, icon: "book", color: "#64748b" };

const getModuleLabel = (value) => getModuleData(value).label;

const getSavedProfile = () => {
  const saved = localStorage.getItem("studentProfile");
  if (saved) {
    const parsed = JSON.parse(saved);
    // Migrate old single-module string to array
    if (typeof parsed.selectedModule === "string") {
      parsed.selectedModules = parsed.selectedModule ? [parsed.selectedModule] : [];
      delete parsed.selectedModule;
    }
    return parsed;
  }
  return {
    name: "",
    email: "",
    studentId: "",
    bio: "",
    skills: ["Java", "Python", "UI Design"],
    selectedModules: [],
    selectedYear: "",
    selectedSemester: "",
    degreeProgram: "",
  };
};

// --- FeatureCard Sub-component ---
function FeatureCard({ icon, title, description, linkLabel, link }) {
  return (
    <div className="feature-card">
      <div className="feature-card__icon-wrap">
        <span className="material-symbols-outlined feature-card__icon">{icon}</span>
      </div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__desc">{description}</p>
      <Link to={link} className="feature-card_link">
        {linkLabel}
      </Link>
    </div>
  );
}

// --- Multi-Module Dropdown Sub-component ---
function ModuleMultiSelect({ selectedModules, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleModule = (value) => {
    if (selectedModules.includes(value)) {
      onChange(selectedModules.filter((m) => m !== value));
    } else {
      onChange([...selectedModules, value]);
    }
  };

  return (
    <div className="module-multiselect" ref={ref}>
      <div
        className={`module-multiselect__trigger ${open ? "module-multiselect__trigger--open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <div className="module-multiselect__placeholder">
          <span className="material-symbols-outlined">add_circle</span>
          {selectedModules.length === 0 ? "Select Your Modules" : `${selectedModules.length} Modules Selected`}
        </div>
        <span className="material-symbols-outlined module-multiselect__chevron">
          expand_more
        </span>
      </div>

      {open && (
        <div className="module-multiselect__dropdown">
          {options.length === 0 ? (
            <div className="module-multiselect__empty">
              Please select year and semester first
            </div>
          ) : (
            options.map((m) => {
              const checked = selectedModules.includes(m.value);
              return (
                <label
                  key={m.value}
                  className={`module-option ${checked ? "module-option--checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="module-option__checkbox"
                    checked={checked}
                    onChange={() => toggleModule(m.value)}
                  />
                  <div className="module-option__icon-box" style={{ color: m.color }}>
                    <span className="material-symbols-outlined">{m.icon}</span>
                  </div>
                  <div className="module-option__label-group">
                    <span className="module-option__label">{m.label}</span>
                    <span className="module-option__meta">{m.value.toUpperCase()}</span>
                  </div>
                  <div className="module-option__checkmark">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                </label>
              );
            })
          )}
          <div className="module-multiselect__footer">
            <button className="module-multiselect__ok-btn" onClick={() => setOpen(false)}>
              Apply Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Saved Profile Display Sub-component ---
function SavedProfileCard({ profile, onRemoveModule }) {
  if (!profile) return null;
  const { skills, selectedModules } = profile;
  const hasData = skills.length > 0 || selectedModules.length > 0;
  if (!hasData) return null;

  return (
    <div className="saved-profile-card">
      <div className="saved-profile-card__heading">
        <span className="material-symbols-outlined saved-profile-card__icon">
          task_alt
        </span>
        <h3 className="saved-profile-card__title">Your Saved Profile</h3>
      </div>

      <div className="saved-profile-card__body">
        {selectedModules.length > 0 && (
          <div className="saved-profile-card__row">
            <span className="saved-profile-card__label">
              <span className="material-symbols-outlined">book</span>
              Current Modules
            </span>
            <div className="saved-profile-card__skills">
              {selectedModules.map((val) => {
                const data = getModuleData(val);
                return (
                  <span key={val} className="module-badge" style={{ borderColor: data.color + '40', color: data.color, backgroundColor: data.color + '10' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px' }}>{data.icon}</span>
                    {data.label}
                    <button 
                      className="module-badge__remove" 
                      onClick={() => onRemoveModule(val)}
                      aria-label={`Remove ${data.label}`}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div className="saved-profile-card__row">
            <span className="saved-profile-card__label">
              <span className="material-symbols-outlined">psychology</span>
              Skills &amp; Expertise
            </span>
            <div className="saved-profile-card__skills">
              {skills.map((skill) => (
                <span key={skill} className="saved-skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Dashboard Component ---
export default function Dashboard() {
  const savedProfile = getSavedProfile();

  const [name, setName] = useState(savedProfile.name || "");
  const [email, setEmail] = useState(savedProfile.email || "");
  const [studentId, setStudentId] = useState(savedProfile.studentId || "");
  const [bio, setBio] = useState(savedProfile.bio || "");
  const [skills, setSkills] = useState(savedProfile.skills);
  const [skillInput, setSkillInput] = useState("");
  const [selectedModules, setSelectedModules] = useState(savedProfile.selectedModules || []);
  const [selectedYear, setSelectedYear] = useState(savedProfile.selectedYear || "");
  const [selectedSemester, setSelectedSemester] = useState(savedProfile.selectedSemester || "");
  const [degreeProgram, setDegreeProgram] = useState(savedProfile.degreeProgram || "");
  const [displayedProfile, setDisplayedProfile] = useState(
    savedProfile.skills.length > 0 || savedProfile.selectedModules?.length > 0
      ? savedProfile
      : null
  );

  const filteredModules = MODULE_OPTIONS.filter(
    (m) => m.year === parseInt(selectedYear) && m.semester === parseInt(selectedSemester)
  );

  const allowedModuleValues = new Set(filteredModules.map((m) => m.value));

  const handleRemoveModule = (moduleValue) => {
    const updatedModules = selectedModules.filter((m) => m !== moduleValue);
    setSelectedModules(updatedModules);
    
    // Auto-update saved profile too if it exists
    if (displayedProfile) {
      const moduleLabels = updatedModules.map(val => getModuleData(val).label);
      const updatedProfile = { ...displayedProfile, selectedModules: updatedModules, moduleLabels };
      localStorage.setItem("studentProfile", JSON.stringify(updatedProfile));
      setDisplayedProfile(updatedProfile);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const addSkill = () => {
    const newSkill = skillInput.trim().replace(/,$/, "");
    if (!newSkill) return;
    const exists = skills.some((s) => s.toLowerCase() === newSkill.toLowerCase());
    if (!exists) {
      setSkills([...skills, newSkill]);
    }
    setSkillInput("");
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      alert("Please add your name and email before saving profile");
      return;
    }

    if (!selectedYear || !selectedSemester) {
      alert("Please select year and semester");
      return;
    }

    if (Number(selectedYear) >= 3 && !degreeProgram) {
      alert("Please select your degree specialization for Year 3/4");
      return;
    }

    const modulesForCurrentTerm = selectedModules.filter((val) => allowedModuleValues.has(val));

    // Save both values and labels for easier matching on other pages
    const moduleLabels = modulesForCurrentTerm.map(val => getModuleData(val).label);
    const profileData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      studentId: studentId.trim(),
      bio: bio.trim(),
      skills,
      selectedModules: modulesForCurrentTerm,
      moduleLabels,
      selectedYear,
      selectedSemester,
      degreeProgram: Number(selectedYear) >= 3 ? degreeProgram : "",
    };
    setSelectedModules(modulesForCurrentTerm);
    localStorage.setItem("studentProfile", JSON.stringify(profileData));
    setDisplayedProfile(profileData);

    try {
      const degree = Number(selectedYear) >= 3 && profileData.degreeProgram
        ? `BSc (${profileData.degreeProgram}) - Year ${selectedYear}`
        : `BSc IT - Year ${selectedYear}`;
      await api.post("/learning/peers/upsert", {
        name: profileData.name,
        email: profileData.email,
        studentId: profileData.studentId,
        year: Number(profileData.selectedYear),
        semester: Number(profileData.selectedSemester),
        modules: profileData.moduleLabels,
        skills: profileData.skills,
        bio: profileData.bio,
        degreeProgram: profileData.degreeProgram,
        degree,
      });
    } catch (err) {
      console.error("Failed to sync student profile:", err);
    }

    alert("Profile saved and synced");
  };

  const handleSkillKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      addSkill();
    }
  };

  useEffect(() => {
    if (Number(selectedYear) < 3 && degreeProgram) {
      setDegreeProgram("");
    }
  }, [selectedYear, degreeProgram]);

  useEffect(() => {
    if (!selectedYear || !selectedSemester) {
      setSelectedModules([]);
      return;
    }

    // Keep only modules that belong to the currently selected year/semester.
    setSelectedModules((prev) => prev.filter((val) => allowedModuleValues.has(val)));
  }, [selectedYear, selectedSemester]);

  return (
    <main className="main">
        {/* ── Hero Section ── */}
        <section className="hero-card">
          <div className="hero-card__content">
            <h1 className="hero-card__title">Smart Learning Hub</h1>
            <p className="hero-card__subtitle">
              Collaborate with peers, share knowledge, and access academic resources in one
              integrated platform.
            </p>
            <button className="btn btn--primary hero-card__cta">Explore Features</button>
          </div>
          <div className="hero-card__image-wrap">
            <img
              className="hero-card__image"
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
              alt="Students collaborating"
            />
          </div>
        </section>

        {/* ── Academic Profile Setup ── */}
        <section className="profile-card">
          <div className="profile-card__heading">
            <div className="profile-card__heading-icon">
              <span className="material-symbols-outlined">edit_square</span>
            </div>
            <h2 className="profile-card__title">Set Up Your Academic Profile</h2>
          </div>

          <div className="profile-card__fields">
            {/* Basic Info */}
            <div className="profile-field">
              <label className="profile-field__label">Full Name</label>
              <input
                className="profile-field__select"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="profile-field">
              <label className="profile-field__label">Email</label>
              <input
                className="profile-field__select"
                type="email"
                placeholder="Enter your campus email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="profile-field">
              <label className="profile-field__label">Student ID (Optional)</label>
              <input
                className="profile-field__select"
                type="text"
                placeholder="e.g. IT22123456"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="profile-field profile-field--full">
              <label className="profile-field__label">Short Bio (Optional)</label>
              <textarea
                className="profile-field__select"
                placeholder="Tell peers what you can help with"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>

            {/* Year Selection */}
            <div className="profile-field">
              <label className="profile-field__label">Select Academic Year</label>
              <div className="profile-field__select-wrap">
                <select
                  className="profile-field__select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="" disabled>Choose Year</option>
                  {YEAR_OPTIONS.map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined profile-field__chevron">
                  expand_more
                </span>
              </div>
            </div>

            {/* Semester Selection */}
            <div className="profile-field">
              <label className="profile-field__label">Select Semester</label>
              <div className="profile-field__select-wrap">
                <select
                  className="profile-field__select"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  <option value="" disabled>Choose Semester</option>
                  {SEMESTER_OPTIONS.map((sem) => (
                    <option key={sem.value} value={sem.value}>
                      {sem.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined profile-field__chevron">
                  expand_more
                </span>
              </div>
            </div>

            {Number(selectedYear) >= 3 && (
              <div className="profile-field">
                <label className="profile-field__label">Specialization (Year 3/4)</label>
                <div className="profile-field__select-wrap">
                  <select
                    className="profile-field__select"
                    value={degreeProgram}
                    onChange={(e) => setDegreeProgram(e.target.value)}
                  >
                    <option value="" disabled>Choose Specialization</option>
                    {SPECIALIZATION_OPTIONS.map((sp) => (
                      <option key={sp.value} value={sp.value}>
                        {sp.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined profile-field__chevron">
                    expand_more
                  </span>
                </div>
              </div>
            )}

            {/* Multi-Module Select */}
            <div className="profile-field profile-field--full">
              <label className="profile-field__label">
                Select Current Modules
                {selectedModules.length > 0 && (
                  <span className="profile-field__count">
                    {selectedModules.length} selected
                  </span>
                )}
              </label>
              <ModuleMultiSelect
                selectedModules={selectedModules}
                onChange={setSelectedModules}
                options={filteredModules}
              />
              {!selectedYear || !selectedSemester ? (
                <p className="field-hint">Select year and semester to see available modules</p>
              ) : filteredModules.length === 0 ? (
                <p className="field-hint field-hint--warning">No modules found for this selection</p>
              ) : null}
            </div>

            {/* Skills Input */}
            <div className="profile-field">
              <label className="profile-field__label">Skills &amp; Expertise</label>
              <div className="profile-field__skills-box">
                {skills.map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                    <button
                      className="skill-tag__remove"
                      onClick={() => handleRemoveSkill(skill)}
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  className="profile-field__skills-input"
                  placeholder="Add more..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={addSkill}
                />
                <button
                  type="button"
                  className="profile-field__skill-add-btn"
                  onClick={addSkill}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="profile-card__footer">
            <p className="profile-card__hint">
              Complete your profile to connect with the right peers.
            </p>
            <button className="btn btn--primary" onClick={handleSaveProfile}>
              Save Profile
            </button>
          </div>
        </section>

        {/* ── Saved Profile Display ── */}
        <SavedProfileCard 
          profile={displayedProfile} 
          onRemoveModule={handleRemoveModule}
        />

        {/* ── Feature Cards ── */}
        <div className="feature-grid">
          {features.map((f) => (
            <FeatureCard key={f.id} {...f} />
          ))}
        </div>
      </main>
  );
}


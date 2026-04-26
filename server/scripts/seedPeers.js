/**
 * Peer Seed Script — creates peer profiles for learning hub
 * Run: node scripts/seedPeers.js
 */
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const baseStudents = [
  {
    studentId: "IT220101",
    name: "Nadeesha Fernando",
    email: "nadeesha.fernando@campus.edu",
    year: 3,
    semester: 1,
    degree: "BSc IT - Year 3",
    modules: ["IT3060", "IT3070"],
    skills: ["Figma", "UI/UX", "Wireframing", "React"],
    rating: 4.8,
    bio: "Enjoys UX mentoring and frontend prototyping.",
    profilePic: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    studentId: "IT220102",
    name: "Ravindu Perera",
    email: "ravindu.perera@campus.edu",
    year: 3,
    semester: 2,
    degree: "BSc IT - Year 3",
    modules: ["IT3030", "IT3020"],
    skills: ["Node.js", "MongoDB", "Express", "JavaScript"],
    rating: 4.7,
    bio: "Backend-focused and helps with API design.",
    profilePic: "https://randomuser.me/api/portraits/men/41.jpg"
  },
  {
    studentId: "IT220103",
    name: "Dulani Senanayake",
    email: "dulani.senanayake@campus.edu",
    year: 2,
    semester: 2,
    degree: "BSc IT - Year 2",
    modules: ["IT2070", "IT2010"],
    skills: ["Java", "Algorithms", "Flutter", "Problem Solving"],
    rating: 4.9,
    bio: "Loves solving algorithm questions and mobile apps.",
    profilePic: "https://randomuser.me/api/portraits/women/21.jpg"
  },
  {
    studentId: "IT220104",
    name: "Kasun Wijesinghe",
    email: "kasun.wijesinghe@campus.edu",
    year: 1,
    semester: 2,
    degree: "BSc IT - Year 1",
    modules: ["IT1100", "IT1060"],
    skills: ["HTML", "CSS", "Scrum", "Git"],
    rating: 4.5,
    bio: "Happy to support web basics and teamwork tools.",
    profilePic: "https://randomuser.me/api/portraits/men/54.jpg"
  },
  {
    studentId: "IT220105",
    name: "Nethmi Jayasuriya",
    email: "nethmi.jayasuriya@campus.edu",
    year: 4,
    semester: 1,
    degree: "BSc IT - Year 4",
    modules: ["IT4010_AI", "SEC401"],
    skills: ["Python", "Machine Learning", "Security", "Data Analysis"],
    rating: 4.9,
    bio: "Guides juniors in AI and secure coding practices.",
    profilePic: "https://randomuser.me/api/portraits/women/37.jpg"
  }
];

const firstNames = [
  "Ayesha", "Kavindu", "Tharushi", "Isuru", "Nethmi", "Hasitha", "Imesha", "Dulani", "Yasiru", "Pavani",
  "Nipun", "Chathuri", "Ravindu", "Malsha", "Dhanuka", "Sachini", "Pramod", "Nadeera", "Thilina", "Sashini"
];

const lastNames = [
  "Perera", "Fernando", "Silva", "Jayasinghe", "Ranasinghe", "Gunasekara", "Wijesinghe", "Bandara", "Senanayake", "Karunaratne"
];

const modulePool = [
  "IT1010", "IT1030", "IT1050", "IT1090", "IT1100", "IT1080", "IT1060",
  "IT2050", "OS201", "IT2110", "IT2070", "IT2010", "IT2080",
  "IT3060", "IT3090", "IT3070", "IT3080", "IT3030", "IT3040", "IT3010", "IT3020",
  "IT4010_AI", "SEC401"
];

const skillPool = [
  "Java", "Python", "React", "Node.js", "MongoDB", "SQL", "UI/UX", "Figma", "Algorithms", "Cybersecurity",
  "Machine Learning", "Data Analysis", "Flutter", "Git", "Linux", "JavaScript", "C++", "Problem Solving", "Networking", "Project Management"
];

const pickMany = (arr, count, offset) => {
  const selected = [];
  for (let i = 0; i < count; i++) {
    selected.push(arr[(offset + i * 3) % arr.length]);
  }
  return [...new Set(selected)];
};

const usedNames = new Set(baseStudents.map((s) => s.name.toLowerCase()));

const makeUniqueName = (baseName, index) => {
  let name = baseName;
  if (usedNames.has(name.toLowerCase())) {
    name = `${baseName} ${index + 1}`;
  }
  usedNames.add(name.toLowerCase());
  return name;
};

const generatedStudents = Array.from({ length: 40 }).map((_, i) => {
  const first = firstNames[i % firstNames.length];
  const last = lastNames[(i * 2) % lastNames.length];
  const name = makeUniqueName(`${first} ${last}`, i);
  const year = (i % 4) + 1;
  const semester = (i % 2) + 1;
  const modules = pickMany(modulePool, 2 + (i % 2), i);
  const skills = pickMany(skillPool, 3 + (i % 2), i + 5);
  const rating = Number((4 + ((i % 10) / 10)).toFixed(1));
  const degree = `BSc IT - Year ${year}`;
  const genderPath = i % 2 === 0 ? "men" : "women";
  const portrait = (i % 70) + 1;
  const idNum = 230000 + i;

  return {
    studentId: `IT${idNum}`,
    name,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@campus.edu`,
    year,
    semester,
    degree,
    modules,
    skills,
    rating,
    bio: `I can help with ${skills[0]} and ${skills[1]}.`,
    profilePic: `https://randomuser.me/api/portraits/${genderPath}/${portrait}.jpg`
  };
});

const students = [...baseStudents, ...generatedStudents];

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set in .env");
    }

    const Peer = require('../models/Peer');

    await connectDB();
    
    // Clear existing peers (optional - comment out if you want to keep existing)
    await Peer.deleteMany({});
    
    await Peer.insertMany(students);

    console.log(`✅ Peers seeded successfully: ${students.length}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Peer seed failed:", err.message);
    process.exit(1);
  }
};

run();

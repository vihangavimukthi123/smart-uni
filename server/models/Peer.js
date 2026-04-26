const mongoose = require('mongoose');

const peerSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      default: "",
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    modules: [
      {
        type: String,
      },
    ],
    year: {
      type: Number,
      min: 1,
      max: 4,
      default: 1,
    },
    semester: {
      type: Number,
      min: 1,
      max: 2,
      default: 1,
    },
    skills: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    profilePic: {
      type: String,
      default: "https://randomuser.me/api/portraits/lego/1.jpg",
    },
    degree: {
      type: String,
      default: "BSc IT – Year 1",
    },
    degreeProgram: {
      type: String,
      enum: ["", "IT", "SE", "DS", "CS"],
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    availability: {
      type: String,
      enum: ["Available Now", "Busy", "Away"],
      default: "Available Now",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Peer", peerSchema);

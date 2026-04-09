const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    subject: String,
    module: { type: String, required: true }, // e.g., "Web Development", "Data Science"
    category: {
      type: String,
      enum: ["Notes", "Past Papers", "Tutorials", "Assignments", "YouTube Links"],
      default: "Notes",
    },

    fileType: { type: String, default: "PDF" }, // PDF, DOCX, PPT, IMAGE
    fileUrl: { type: String, required: true },
    author: { type: String, default: "John Doe" },
    userId: { type: String, default: "JD123" },
    downloads: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);


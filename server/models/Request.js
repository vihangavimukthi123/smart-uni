const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  senderName: String,
  senderEmail: String,
  receiverName: String,
  receiverEmail: String,
  requestType: {
    type: String,
    default: "PEER_REQUEST",
  },
  taskId: String,
  taskTitle: String,
  skill: String,
  message: String,
  date: String,
  status: {
    type: String,
    default: "PENDING"
  }
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);

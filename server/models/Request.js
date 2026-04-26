const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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

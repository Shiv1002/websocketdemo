const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema(
  {
    msg: {
      type: String,
    },
    sender: {
      type: String,
    },
  },
  { timestamp: true }
);
module.exports = mongoose.model("chats", chatSchema);

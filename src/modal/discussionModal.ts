const mongoose = require("mongoose");

const discussionSchema = new mongoose.Schema({
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true }, // Discussion belongs to a chapter
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Student who commented
  comment: { type: String, required: true },
  likes:{type:Number,default:0},
  replies: [
    {
      educatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Educator", required: true }, // Educator replying
      comment: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      likes:{type:Number,default:0}
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Discussion", discussionSchema);

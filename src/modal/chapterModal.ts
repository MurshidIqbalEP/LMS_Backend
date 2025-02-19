import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lecture" }],
    position: { type: Number, required: true }, 
  });
  
  const Chapter = mongoose.model("Chapter", chapterSchema);
  export default Chapter;
  
import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    resources: [{ type: String }], 
    duration: { type: Number },
    position: { type: Number, required: true }, 
  });

const Lecture = mongoose.model("Lecture", lectureSchema);
export default Lecture;
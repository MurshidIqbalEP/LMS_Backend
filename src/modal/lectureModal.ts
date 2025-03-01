import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
    title: { type: String, required: true },
    videoUrl: { type: String, required: true }, 
    duration: { type: Number },
    ispreview:{type:Boolean,default:false},
    position: { type: Number, required: true }, 
  });

const Lecture = mongoose.model("Lecture", lectureSchema);
export default Lecture;
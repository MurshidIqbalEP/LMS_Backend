import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    educatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Educator", required: true },
    category: { type: String, required:true },
    price: { type: Number, default: 0 },
    thumbnail: { type: String },
    resources: { type: String },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
    isPublished:{type:Boolean , default:false},
    enrolledStudents:[{type:String,ref:"User"}],
    createdAt: { type: Date, default: Date.now },
  });
  
  const Course = mongoose.model("Course", courseSchema);
  export default Course;
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    educatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String },
    price: { type: Number, default: 0 },
    thumbnail: { type: String },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
    isPublished:{type:Boolean , required:true, default:false},
    rating:{type:Number ,min: 1,max: 5},
    createdAt: { type: Date, default: Date.now },
  });
  
  const Course = mongoose.model("Course", courseSchema);
  export default Course;
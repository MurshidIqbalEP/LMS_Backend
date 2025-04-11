import mongoose from "mongoose";

const LectureProgressSchema = new mongoose.Schema({
    lectureId:{type: mongoose.Schema.Types.ObjectId, ref: "Lecture", required: true},
    status: {
        type: String,
        enum: ["not_started", "in_progress", "completed"],
        default: "not_started",
      },
    completedAt: { type: Date, default: null }
})

const ChapterProgressSchema = new mongoose.Schema({
    chapterId:{type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true},
    isCompleted:{type:Boolean,default:false},
    completedAt: { type: Date, default: null },
    lecturesProgress: [LectureProgressSchema] 
})


const CourseProgressSchema = new mongoose.Schema({
   userId:{type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
   courseId:{type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true},
   isCompleted:{type:Boolean,default:false},
   completedAt: { type: Date, default: null },
   chapters: [ChapterProgressSchema]
})

const CourseProgress = mongoose.model("CourseProgress", CourseProgressSchema);
export default CourseProgress;
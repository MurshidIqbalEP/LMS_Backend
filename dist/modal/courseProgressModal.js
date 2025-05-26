"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const LectureProgressSchema = new mongoose_1.default.Schema({
    lectureId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Lecture", required: true },
    status: {
        type: String,
        enum: ["not_started", "in_progress", "completed"],
        default: "not_started",
    },
    completedAt: { type: Date, default: null }
});
const ChapterProgressSchema = new mongoose_1.default.Schema({
    chapterId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Chapter", required: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    lecturesProgress: [LectureProgressSchema]
});
const CourseProgressSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Course", required: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    chapters: [ChapterProgressSchema]
});
const CourseProgress = mongoose_1.default.model("CourseProgress", CourseProgressSchema);
exports.default = CourseProgress;

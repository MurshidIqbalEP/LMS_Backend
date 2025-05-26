"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const courseSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String },
    educatorId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Educator", required: true },
    category: { type: String, required: true },
    price: { type: Number, default: 0 },
    thumbnail: { type: String },
    resources: { type: String },
    chapters: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Chapter" }],
    isPublished: { type: Boolean, default: false },
    enrolledStudents: [{ type: String, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
});
const Course = mongoose_1.default.model("Course", courseSchema);
exports.default = Course;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const lectureSchema = new mongoose_1.default.Schema({
    chapterId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Chapter", required: true },
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    duration: { type: Number },
    ispreview: { type: Boolean, default: false },
    position: { type: Number, required: true },
});
const Lecture = mongoose_1.default.model("Lecture", lectureSchema);
exports.default = Lecture;

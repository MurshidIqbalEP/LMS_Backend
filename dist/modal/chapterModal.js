"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chapterSchema = new mongoose_1.default.Schema({
    courseId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    lectures: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Lecture" }],
    position: { type: Number, required: true },
});
const Chapter = mongoose_1.default.model("Chapter", chapterSchema);
exports.default = Chapter;

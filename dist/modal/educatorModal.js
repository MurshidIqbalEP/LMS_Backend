"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const educatorSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subjectExpertise: { type: String, required: true },
    qualification: { type: String, required: true },
    profilePicture: { type: String, required: true },
    governmentId: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true });
const Educator = mongoose_1.default.model("Educator", educatorSchema);
exports.default = Educator;

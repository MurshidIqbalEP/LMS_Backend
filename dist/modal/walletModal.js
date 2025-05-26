"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const walletSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Educator", required: true },
    balance: { type: Number, required: true, default: 0 },
    transactions: [
        {
            amount: { type: Number, required: true },
            type: { type: String, enum: ["credit", "debit"], required: true },
            description: { type: String },
            createdAt: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
const Wallet = mongoose_1.default.model("Wallet", walletSchema);
exports.default = Wallet;

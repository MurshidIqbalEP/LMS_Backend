"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PaymentSchema = new mongoose_1.default.Schema({
    razorpay_order_id: { type: String, require: true },
    razorpay_payment_id: { type: String, require: true },
    razorpay_signature: { type: String, require: true },
    createdAt: { type: Date, default: Date.now },
});
const Payment = mongoose_1.default.model("Payment", PaymentSchema);
exports.default = Payment;

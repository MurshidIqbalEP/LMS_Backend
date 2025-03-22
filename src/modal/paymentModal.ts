import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    razorpay_order_id:{type:String,require:true},
    razorpay_payment_id:{type:String,require:true},
    razorpay_signature:{type:String,require:true},
    createdAt: { type: Date, default: Date.now },
  });

const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;
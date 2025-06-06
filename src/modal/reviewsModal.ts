import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course", 
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        required: true,
        trim: true,
      },
    }, 
{ timestamps: true })

const Review = mongoose.model("Review", reviewSchema);
export default Review;
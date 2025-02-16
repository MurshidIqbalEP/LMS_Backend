import mongoose from "mongoose";

const educatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subjectExpertise: { type: String, required: true },
    qualification: { type: String, required: true },
    profilePicture: { type: String, required: true },
    governmentId: { type: String, required: true },
  },
  { timestamps: true }
);


const Educator = mongoose.model("Educator", educatorSchema);
export default Educator;
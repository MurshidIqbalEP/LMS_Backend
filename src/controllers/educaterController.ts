import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../utils/bcript";
import Educator from "../modal/educatorModal";
import { generateRefreshtoken, generateToken } from "../utils/jwt";

// Register
export const registerEducator = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      subjectExpertise,
      qualification,
      profilePicture,
      governmentId,
    } = req.body;

    const existedEducator = await Educator.findOne({ email });
    if (existedEducator) {
      res.status(400).json({ message: "Educator already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const educator = await Educator.create({
      name,
      email,
      password: hashedPassword,
      subjectExpertise,
      qualification,
      profilePicture,
      governmentId,
    });
    res.status(201).json({ message: "Educator created successfully" });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login
export const loginEducator = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const educator = await Educator.findOne({ email });
    if (!educator) {
      res.status(400).json({ message: "Educator not found" });
      return;
    }

    const isPasswordValid = await comparePassword(password, educator.password);
    if (!isPasswordValid) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

     const token = generateToken(educator._id.toString());
     const refreshToken = generateRefreshtoken(educator._id.toString());
    
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
    
        res.status(200).json({
          _id: educator._id,
          name: educator.name,
          email: educator.email,
          subjectExpertise:educator.subjectExpertise,
          qualification:educator.qualification,
          profilePicture:educator.profilePicture,
          token,
          message: "Successfully logged in",
        });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

import { Request, Response } from "express";
import User from "../modal/userModal";
import { generateRefreshtoken, generateToken } from "../utils/jwt";
import { hashPassword } from "../utils/bcript";


// register user
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) res.status(400).json({ message: "User already exists" });

    const HashedPassword = await hashPassword(password);
    const user = await User.create({ name, email, password: HashedPassword });

    const token = generateToken(user._id.toString());
    const refreshToken = generateRefreshtoken(user._id.toString());
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};



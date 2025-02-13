import { Request, Response } from "express";
import User from "../modal/userModal";
import { generateRefreshtoken, generateToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/bcript";
import generateRandomPassword from "../utils/rendomPas";

// Register user
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const existedUser = await User.findOne({ email });
    if (!existedUser) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    if (existedUser.isGoogle) {
      res
        .status(400)
        .json({ success: false, message: "Please log in using Google" });
      return;
    }

    const isPasswordValid = await comparePassword(
      password,
      existedUser.password
    );
    if (!isPasswordValid) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = generateToken(existedUser._id.toString());
    const refreshToken = generateRefreshtoken(existedUser._id.toString());

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      _id: existedUser._id,
      name: existedUser.name,
      email: existedUser.email,
      token,
      message: "Successfully logged in",
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// Registration using google auth
export const googleRegister = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const password = await generateRandomPassword(6);
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isGoogle: true,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login using google auth
export const googleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const existedUser = await User.findOne({ email });
    if (!existedUser) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    if (!existedUser.isGoogle) {
      res.status(400).json({
        success: false,
        message: "Please log in with your email and password",
      });
      return;
    }

    const token = generateToken(existedUser._id.toString());
    const refreshToken = generateRefreshtoken(existedUser._id.toString());

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      _id: existedUser._id,
      name: existedUser.name,
      email: existedUser.email,
      token,
      message: "Successfully logged in",
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../modal/userModal";
import { generateRefreshtoken, generateToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/bcript";
import generateRandomPassword from "../utils/rendomPas";
import Category from "../modal/categoryModal";
import Course from "../modal/courseModal";
import Lecture from "../modal/lectureModal";
import Razorpay from "razorpay";
import crypto from "crypto";
const { randomBytes, createHmac } = crypto;
import Payment from "../modal/paymentModal";
import Wallet from "../modal/walletModal";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

// Fetch all category
export const fetchAllCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await Category.find();
    const categoryNames = categories.map((cat) => cat.name);
    res.status(200).json(categoryNames);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fetch All Courses
export const fetchAllCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const courses = await Course.find(
      {},
      {
        _id: 1,
        title: 1,
        description: 1,
        category: 1,
        price: 1,
        thumbnail: 1,
        rating: 1,
      }
    );
    res.status(200).json(courses);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fetch Course Data
export const fetchCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId,studentId } = req.query;

    const course = await Course.findById(courseId, {
      resources: 0,
      createdAt: 0,
    })
      .populate({
        path: "educatorId",
        select: "name profilePicture",
      })
      .populate({
        path: "chapters",
        options: { sort: { position: 1 } },
        populate: {
          path: "lectures",
          model: "Lecture",
          options: { sort: { position: 1 } },
        },
      });
      const isEnrolled = course?.enrolledStudents.includes(studentId as string);
    res.status(200).json({ courseData: course,isEnrolled });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For Razorpay Payment
export const payment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;

    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: randomBytes(10).toString("hex"),
      payment_capture: 1,
    };
    const order = await razorpay.orders.create(options);

    res.status(200).json({ success: true, order });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For Razorpay Payment Verification
export const paymentVerification = async (req: Request,res: Response): Promise<void> => {
  try {
    const {razorpay_order_id,razorpay_payment_id,razorpay_signature,courseId,educatorId,studentId} = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res
        .status(400)
        .json({ success: false, message: "Missing payment details" });
      return;
    }

    // Generate signature hash using HMAC SHA256
    const secret = process.env.RAZORPAY_KEY_SECRET as string;
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = createHmac("sha256", secret)
      .update(sign)
      .digest("hex");

    // Compare generated signature with the received signature
    if (expectedSignature === razorpay_signature) {
      const payment = new Payment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
      await payment.save();

      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({ success: false, message: "Course not found" });
        return;
      }
      const amount = course.price;
      let wallet = await Wallet.findOne({ userId: educatorId });
      if (!wallet) {
        wallet = new Wallet({ userId: educatorId, balance: 0, transactions: [] });
      }
      wallet.balance += amount;
      wallet.transactions.push({
        amount,
        type: "credit",
        description: `Payment received for course ${course.title}`,
        createdAt: new Date(),
      });
      await wallet.save();
      if (!course.enrolledStudents.includes(studentId)) {
        course.enrolledStudents.push(studentId);
        await course.save();
      }

      res
        .status(200)
        .json({ success: true, message: "Payment verified successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    const err = error as Error;
    console.error("Payment Verification Error:", error);
    res.status(500).json({ success: false, message: err.message });
  }
};

// For student Entrollments
export const fetchEntrollments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;
    
    const enrolledCourses = await Course.find(
      { enrolledStudents: studentId },
      { _id: 1, title: 1, description: 1, category: 1, price: 1, thumbnail: 1 }
    );
   
    res.status(200).json({success:true,enrolledCourses})
   
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};


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
import CourseProgress from "../modal/courseProgressModal";
import axios from "axios";
import pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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

// For Fetching Course Player Data
export const fetchPlayerData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId,studentId } = req.query;

    const course = await Course.findById(courseId)
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
      
      if (!course) {
         res.status(404).json({ success: false, message: "Course not found" });
         return
      }
      const isEnrolled = course?.enrolledStudents.includes(studentId as string);
      if(isEnrolled){
        res.status(200).json({ courseData: course });
      }else{
         res.status(403).json({ success: false, message: "Access denied. Enrollment required." });
      }
    
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};


// For mark lecture as viewed
export const markLectureViewed = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, courseId, chapterId, lectureId,status } = req.body;

    
    
    // Find user's course progress
    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
       res.status(404).json({ message: "Course progress not found" });
       return
    }

    // Find the specific chapter in progress
    const chapterProgress = progress.chapters.find(
      (chapter) => chapter.chapterId.toString() === chapterId
    );

    if (!chapterProgress) {
       res.status(404).json({ message: "Chapter not found in progress" });
       return
    }

    // Find the lecture in the chapter
    const lectureProgress = chapterProgress.lecturesProgress.find(
      (lecture) => lecture.lectureId.toString() === lectureId
    );
    
    if (!lectureProgress) {
       res.status(404).json({ message: "Lecture not found in progress" });
       return
    }

    // Mark the lecture as completed if not already done
    if (lectureProgress.status !== "completed") {
      lectureProgress.status = status;
      if (status === "completed") {
        lectureProgress.completedAt = new Date();
      }
    }

    // Check if all lectures in this chapter are completed
    const allLecturesCompleted = chapterProgress.lecturesProgress.every(
      (lecture) => lecture.status === "completed"
    );

    if (allLecturesCompleted) {
      chapterProgress.isCompleted = true;
      chapterProgress.completedAt = new Date();
    }

    // Check if all chapters are completed
    const allChaptersCompleted = progress.chapters.every(
      (chapter) => chapter.isCompleted
    );

    if (allChaptersCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    // Save the updated progress
    await progress.save();

    res.status(200).json({ success: true, progress });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};


// For Get current course progress
export const getCourseProgress = async (req:Request,res:Response): Promise<void> =>{
  try {
    const { userId, courseId } = req.query;

    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      const course = await Course.findById(courseId)
        .populate({
          path: "chapters",
          populate: { path: "lectures" } 
        })as unknown as { chapters: { lectures: any[] }[] };

      if (!course) {
        res.status(404).json({ success: false, message: "Course not found" });
        return;
      } 
       progress = new CourseProgress({
        userId,
        courseId,
        chapters: course.chapters.map((chapter: any,index: number) => ({
          chapterId: chapter._id,
          isCompleted:false,
          lecturesProgress: chapter.lectures.map((lecture: any,lectureIndex: number) => ({
            lectureId: lecture._id,
            status:index === 0 && lectureIndex === 0? 'in_progress': 'not_started',
          })),
        })),
      });

      await progress.save();
    
    }

    const totalLectures = progress.chapters.reduce((acc, ch) => acc + ch.lecturesProgress.length, 0);
    const completedLectures = progress.chapters.reduce((acc, ch) => acc + ch.lecturesProgress.filter(lec => lec.status === "completed").length, 0);
    const completionPercentage = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;

    res.status(200).json({ success: true, completionPercentage, progress });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
}



export const generateQuestionsFromPDF = async (req:Request,res:Response): Promise<void> =>{
  try {
    const { pdfUrl } = req.query;

    if (!pdfUrl) {
      res.status(400).json({ message: "PDF URL is required" });
      return;
    }

    console.log("hreeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");

    const response = await axios.get(pdfUrl as string, {
      responseType: "arraybuffer",
    });

    const data = await pdfParse(response.data);
    const extractedText = data.text;

    const prompt = `
            Generate 10 meaningful and relevant interview questions from the following content.

            Rules to follow strictly:
            1. Only return the questions.
            2. Do not add any extra text, explanation, or numbering.
            3. Format your response exactly like this: ["question 1", "question 2", "question 3", ...]
            4. The questions will be asked by a voice assistant, so avoid using symbols like /, *, -, (), or any special characters.
            5. The questions should sound professional, clear, and natural for an interview setting.
            6. Focus on understanding, concepts, and practical knowledge from the content.
            7. Keep each question concise and not more than 20 words if possible.
            8. Ask only topic-specific questions based on key concepts, definitions, or facts from the content.
            9. Avoid opinion-based or scenario-based questions.
            10. Questions should feel like they belong in an academic interview or exam.
              Content:${extractedText}`;

    const completion = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1-zero:free", // Correct model name
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000", // Optional, but must be valid
          "X-Title": "Interview Question Generator", // Optional
        },
      }
    );

    const rawText: string =completion.data.choices[0]?.message?.reasoning || "";
    const questionLines: string[] = rawText
      .split("\n")
      .filter((line: string) => /^\d+\.\s+/.test(line)) 
      .map((line: string) => line.replace(/^\d+\.\s+/, "").trim()); 
      console.log(questionLines);

    res.status(200).json({ success: true, questions: questionLines });
  } catch (error) {
    const err = error as Error;
    console.log(err.message)
    res.status(500).json({ success: false, message: err.message });
  }
}
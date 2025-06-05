import { Request, Response } from "express";
import User from "../modal/userModal";
import { comparePassword } from "../utils/bcript";
import { generateRefreshtoken, generateToken } from "../utils/jwt";
import Educator from "../modal/educatorModal";
import Course from "../modal/courseModal";

// For admin login
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const existedUser = await User.findOne({ email });
    if (!existedUser) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    if (!existedUser.isAdmin) {
      res.status(400).json({ success: false, message: "You are not an admin" });
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

    const token = generateToken(existedUser._id.toString(), "admin");
    const refreshToken = generateRefreshtoken(
      existedUser._id.toString(),
      "admin"
    );

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

// For google  admin Login
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

    if (!existedUser.isAdmin) {
      res.status(400).json({ success: false, message: "You are not an admin" });
      return;
    }

    const token = generateToken(existedUser._id.toString(), "admin");
    const refreshToken = generateRefreshtoken(
      existedUser._id.toString(),
      "admin"
    );

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

// For Fetch all Students
export const fetchStudents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({isAdmin:false,isVerified:true})
    res.status(200).json({users,success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For Fetch all Educators 
export const fetchEducator = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const educators = await Educator.find({isVerified:true})
    res.status(200).json({educators,success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For Fetch all Courses
export const fetchCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const courses = await Course.find({isRejected:false,isEdited:false})
    res.status(200).json({courses,success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For Fetch all newCourses
export const fetchnewCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const courses = await Course.find({ isPublished: false })
      .populate("educatorId", "name profilePicture") 
      .exec();
    res.status(200).json({courses,success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For list course
export const listCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.query;

    const course = await Course.findByIdAndUpdate(courseId,{ isPublished: true },{ new: true });
    res.status(200).json({course,success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For unlist course
export const unlistCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.query;

    const course = await Course.findByIdAndUpdate(courseId,{ isPublished: false },{ new: true });
    res.status(200).json({course,success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For Fetch Course Details
export const fetchCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.query;

    const course = await Course.findById(id, {
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

    res.status(200).json({ courseData: course,success:true });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For fetch All Edited Courses
export const fetchEditedCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const courses = await Course.find({isEdited:true,isPublished:true})
    res.status(200).json({courses,success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For  Approve Edited Courses
export const approveCourseEdit = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.query;
    const course = await Course.findByIdAndUpdate(courseId,{ isEdited: false },{ new: true });
   
    res.status(200).json({message:"aproved edited course",success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For  Reject Edited Courses
export const rejectCourseEdit = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.query;
    const course = await Course.findByIdAndUpdate(courseId,{ isEdited: true,isRejected:true },{ new: true });
   
    res.status(200).json({message:"rejected edited course",success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For  Approve  Courses
export const approveCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.query;
    const course = await Course.findByIdAndUpdate(courseId,{ isPublished: true},{ new: true });
   
    res.status(200).json({message:"aproved course",success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For  reject  Courses
export const rejectCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.query;
    const course = await Course.findByIdAndUpdate(courseId,{ isPublished: false,isRejected:true},{ new: true });
   
    res.status(200).json({message:"course rejected",success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For publish course
export const publishCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.query;
    const course = await Course.findByIdAndUpdate(courseId,{ isPublished: true },{ new: true });
   
    res.status(200).json({message:"published course",success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For block student
export const blockStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.query;
    const student = await User.findByIdAndUpdate(studentId,{ isBlocked: true },{ new: true });
   
    res.status(200).json({message:"blocked student",success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For unblock student
export const unblockStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.query;
    const student = await User.findByIdAndUpdate(studentId,{ isBlocked: false },{ new: true });
   
    res.status(200).json({message:"blocked student",success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For block educator
export const blockEducator = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { educatorId } = req.query;
    const educator = await Educator.findByIdAndUpdate(educatorId,{ isBlocked: true },{ new: true });
   
    res.status(200).json({message:"blocked educator",success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For unblock educator
export const unblockEducator = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { educatorId } = req.query;
    const educator = await Educator.findByIdAndUpdate(educatorId,{ isBlocked: false },{ new: true });
   
    res.status(200).json({message:"unblocked educator",success:true});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// For fetch chartData
export const fetchChartData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const usersPerMonth = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          students: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    
    const monthNames = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const formattedData = usersPerMonth.map((item) => ({
      month: monthNames[item._id],
      students: item.students,
    }));

     const categoryData = await Course.aggregate([
      {
        $group: {
          _id: "$category",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1,
        },
      },
      {
        $sort: { value: -1 } 
      }
    ]);

    const TotalUsers = await User.countDocuments({isVerified: true,isBlocked: false,isAdmin: false,});
    const TotalEducators = await Educator.countDocuments({isVerified: true,isBlocked: false});
    const TotalCourses = await Course.countDocuments({isVerified: true,isBlocked: false,isRejected:false});
   
    res.status(200).json({ success: true, arreachartData: formattedData,piechartData:categoryData,TotalUsers,TotalEducators,TotalCourses});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};



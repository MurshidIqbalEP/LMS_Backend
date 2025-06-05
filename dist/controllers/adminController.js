"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchChartData = exports.unblockEducator = exports.blockEducator = exports.unblockStudent = exports.blockStudent = exports.publishCourse = exports.rejectCourse = exports.approveCourse = exports.rejectCourseEdit = exports.approveCourseEdit = exports.fetchEditedCourses = exports.fetchCourse = exports.unlistCourse = exports.listCourse = exports.fetchnewCourses = exports.fetchCourses = exports.fetchEducator = exports.fetchStudents = exports.googleLogin = exports.loginAdmin = void 0;
const userModal_1 = __importDefault(require("../modal/userModal"));
const bcript_1 = require("../utils/bcript");
const jwt_1 = require("../utils/jwt");
const educatorModal_1 = __importDefault(require("../modal/educatorModal"));
const courseModal_1 = __importDefault(require("../modal/courseModal"));
// For admin login
const loginAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const existedUser = yield userModal_1.default.findOne({ email });
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
        const isPasswordValid = yield (0, bcript_1.comparePassword)(password, existedUser.password);
        if (!isPasswordValid) {
            res.status(400).json({ success: false, message: "Invalid credentials" });
            return;
        }
        const token = (0, jwt_1.generateToken)(existedUser._id.toString(), "admin");
        const refreshToken = (0, jwt_1.generateRefreshtoken)(existedUser._id.toString(), "admin");
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
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.loginAdmin = loginAdmin;
// For google  admin Login
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const existedUser = yield userModal_1.default.findOne({ email });
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
        const token = (0, jwt_1.generateToken)(existedUser._id.toString(), "admin");
        const refreshToken = (0, jwt_1.generateRefreshtoken)(existedUser._id.toString(), "admin");
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
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.googleLogin = googleLogin;
// For Fetch all Students
const fetchStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModal_1.default.find({ isAdmin: false, isVerified: true });
        res.status(200).json({ users, success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchStudents = fetchStudents;
// For Fetch all Educators 
const fetchEducator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const educators = yield educatorModal_1.default.find({ isVerified: true });
        res.status(200).json({ educators, success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchEducator = fetchEducator;
// For Fetch all Courses
const fetchCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield courseModal_1.default.find({ isRejected: false, isEdited: false });
        res.status(200).json({ courses, success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchCourses = fetchCourses;
// For Fetch all newCourses
const fetchnewCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield courseModal_1.default.find({ isPublished: false })
            .populate("educatorId", "name profilePicture")
            .exec();
        res.status(200).json({ courses, success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchnewCourses = fetchnewCourses;
// For list course
const listCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.query;
        const course = yield courseModal_1.default.findByIdAndUpdate(courseId, { isPublished: true }, { new: true });
        res.status(200).json({ course, success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.listCourse = listCourse;
// For unlist course
const unlistCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.query;
        const course = yield courseModal_1.default.findByIdAndUpdate(courseId, { isPublished: false }, { new: true });
        res.status(200).json({ course, success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.unlistCourse = unlistCourse;
// For Fetch Course Details
const fetchCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        const course = yield courseModal_1.default.findById(id, {
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
        res.status(200).json({ courseData: course, success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchCourse = fetchCourse;
// For fetch All Edited Courses
const fetchEditedCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield courseModal_1.default.find({ isEdited: true, isPublished: true });
        res.status(200).json({ courses, success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchEditedCourses = fetchEditedCourses;
// For  Approve Edited Courses
const approveCourseEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.query;
        const course = yield courseModal_1.default.findByIdAndUpdate(courseId, { isEdited: false }, { new: true });
        res.status(200).json({ message: "aproved edited course", success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.approveCourseEdit = approveCourseEdit;
// For  Reject Edited Courses
const rejectCourseEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.query;
        const course = yield courseModal_1.default.findByIdAndUpdate(courseId, { isEdited: true, isRejected: true }, { new: true });
        res.status(200).json({ message: "rejected edited course", success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.rejectCourseEdit = rejectCourseEdit;
// For  Approve  Courses
const approveCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.query;
        const course = yield courseModal_1.default.findByIdAndUpdate(courseId, { isPublished: true }, { new: true });
        res.status(200).json({ message: "aproved course", success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.approveCourse = approveCourse;
// For  reject  Courses
const rejectCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.query;
        const course = yield courseModal_1.default.findByIdAndUpdate(courseId, { isPublished: false, isRejected: true }, { new: true });
        res.status(200).json({ message: "course rejected", success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.rejectCourse = rejectCourse;
// For publish course
const publishCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.query;
        const course = yield courseModal_1.default.findByIdAndUpdate(courseId, { isPublished: true }, { new: true });
        res.status(200).json({ message: "published course", success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.publishCourse = publishCourse;
// For block student
const blockStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = req.query;
        const student = yield userModal_1.default.findByIdAndUpdate(studentId, { isBlocked: true }, { new: true });
        res.status(200).json({ message: "blocked student", success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.blockStudent = blockStudent;
// For unblock student
const unblockStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = req.query;
        const student = yield userModal_1.default.findByIdAndUpdate(studentId, { isBlocked: false }, { new: true });
        res.status(200).json({ message: "blocked student", success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.unblockStudent = unblockStudent;
// For block educator
const blockEducator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { educatorId } = req.query;
        const educator = yield educatorModal_1.default.findByIdAndUpdate(educatorId, { isBlocked: true }, { new: true });
        res.status(200).json({ message: "blocked educator", success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.blockEducator = blockEducator;
// For unblock educator
const unblockEducator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { educatorId } = req.query;
        const educator = yield educatorModal_1.default.findByIdAndUpdate(educatorId, { isBlocked: false }, { new: true });
        res.status(200).json({ message: "unblocked educator", success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.unblockEducator = unblockEducator;
// For fetch chartData
const fetchChartData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usersPerMonth = yield userModal_1.default.aggregate([
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
        const categoryData = yield courseModal_1.default.aggregate([
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
        const TotalUsers = yield userModal_1.default.countDocuments({ isVerified: true, isBlocked: false, isAdmin: false, });
        const TotalEducators = yield educatorModal_1.default.countDocuments({ isVerified: true, isBlocked: false });
        const TotalCourses = yield courseModal_1.default.countDocuments({ isVerified: true, isBlocked: false, isRejected: false });
        res.status(200).json({ success: true, arreachartData: formattedData, piechartData: categoryData, TotalUsers, TotalEducators, TotalCourses });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchChartData = fetchChartData;

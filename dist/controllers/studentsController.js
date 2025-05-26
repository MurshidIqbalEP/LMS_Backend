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
exports.refreshToken = exports.postReview = exports.fetchTopCourses = exports.generateQuestionsFromPDF = exports.getCourseProgress = exports.markLectureViewed = exports.fetchPlayerData = exports.fetchEntrollments = exports.paymentVerification = exports.payment = exports.fetchCourse = exports.fetchAllCourses = exports.fetchAllCategory = exports.googleLogin = exports.googleRegister = exports.loginUser = exports.verifyOtp = exports.registerUser = void 0;
const userModal_1 = __importDefault(require("../modal/userModal"));
const otpModal_1 = __importDefault(require("../modal/otpModal"));
const reviewsModal_1 = __importDefault(require("../modal/reviewsModal"));
const jwt_1 = require("../utils/jwt");
const bcript_1 = require("../utils/bcript");
const rendomPas_1 = __importDefault(require("../utils/rendomPas"));
const categoryModal_1 = __importDefault(require("../modal/categoryModal"));
const courseModal_1 = __importDefault(require("../modal/courseModal"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const { randomBytes, createHmac } = crypto_1.default;
const paymentModal_1 = __importDefault(require("../modal/paymentModal"));
const walletModal_1 = __importDefault(require("../modal/walletModal"));
const courseProgressModal_1 = __importDefault(require("../modal/courseProgressModal"));
const axios_1 = __importDefault(require("axios"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const generative_ai_1 = require("@google/generative-ai");
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const educatorModal_1 = __importDefault(require("../modal/educatorModal"));
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// Register user
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const userExists = yield userModal_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const hashedPassword = yield (0, bcript_1.hashPassword)(password);
        const user = yield userModal_1.default.create({ name, email, password: hashedPassword });
        yield walletModal_1.default.create({
            userId: user._id,
            balance: 0,
            transactions: [],
        });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        yield otpModal_1.default.create({ email, code: otp });
        yield (0, sendEmail_1.default)(email, "Verify Your Email", `Your OTP is ${otp}`);
        res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.registerUser = registerUser;
// Verify OTP
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const existingOtp = yield otpModal_1.default.findOne({ email, code: otp });
        if (!existingOtp) {
            res.status(400).json({ message: "Invalid or expired OTP" });
            return;
        }
        const user = yield userModal_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        user.isVerified = true;
        yield user.save();
        yield otpModal_1.default.deleteOne({ _id: existingOtp._id });
        res
            .status(200)
            .json({ message: "Email verified successfully", success: true });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.verifyOtp = verifyOtp;
// Login user
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const existedUser = yield userModal_1.default.findOne({ email });
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
        if (!existedUser.isVerified) {
            res
                .status(400)
                .json({ success: false, message: "Email is not verified" });
            return;
        }
        const isPasswordValid = yield (0, bcript_1.comparePassword)(password, existedUser.password);
        if (!isPasswordValid) {
            res.status(400).json({ success: false, message: "Invalid credentials" });
            return;
        }
        const token = (0, jwt_1.generateToken)(existedUser._id.toString(), "student");
        const refreshToken = (0, jwt_1.generateRefreshtoken)(existedUser._id.toString(), "student");
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
exports.loginUser = loginUser;
// Registration using google auth
const googleRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email } = req.body;
        const userExists = yield userModal_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const password = yield (0, rendomPas_1.default)(6);
        const hashedPassword = yield (0, bcript_1.hashPassword)(password);
        const user = yield userModal_1.default.create({
            name,
            email,
            password: hashedPassword,
            isGoogle: true,
            isVerified: true,
        });
        res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.googleRegister = googleRegister;
// Login using google auth
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
        const token = (0, jwt_1.generateToken)(existedUser._id.toString(), "student");
        const refreshToken = (0, jwt_1.generateRefreshtoken)(existedUser._id.toString(), "student");
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
// Fetch all category
const fetchAllCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield categoryModal_1.default.find();
        const categoryNames = categories.map((cat) => cat.name);
        res.status(200).json(categoryNames);
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchAllCategory = fetchAllCategory;
// Fetch All Courses
const fetchAllCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield courseModal_1.default.aggregate([
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "course",
                    as: "reviews"
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    category: 1,
                    price: 1,
                    thumbnail: 1,
                    rating: 1,
                    reviews: 1
                }
            }
        ]);
        res.status(200).json(courses);
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchAllCourses = fetchAllCourses;
// Fetch Course Data
const fetchCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, studentId } = req.query;
        const course = yield courseModal_1.default.findById(courseId, {
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
        const isEnrolled = course === null || course === void 0 ? void 0 : course.enrolledStudents.includes(studentId);
        const reviews = yield reviewsModal_1.default.find({ course: courseId })
            .populate({ path: "user", select: "name" })
            .sort({ createdAt: -1 });
        res.status(200).json({ courseData: course, isEnrolled, reviews });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchCourse = fetchCourse;
// For Razorpay Payment
const payment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount } = req.body;
        const options = {
            amount: Number(amount) * 100,
            currency: "INR",
            receipt: randomBytes(10).toString("hex"),
            payment_capture: 1,
        };
        const order = yield razorpay.orders.create(options);
        res.status(200).json({ success: true, order });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.payment = payment;
// For Razorpay Payment Verification
const paymentVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, educatorId, studentId, } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res
                .status(400)
                .json({ success: false, message: "Missing payment details" });
            return;
        }
        // Generate signature hash using HMAC SHA256
        const secret = process.env.RAZORPAY_KEY_SECRET;
        const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = createHmac("sha256", secret)
            .update(sign)
            .digest("hex");
        // Compare generated signature with the received signature
        if (expectedSignature === razorpay_signature) {
            const payment = new paymentModal_1.default({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            });
            yield payment.save();
            const course = yield courseModal_1.default.findById(courseId);
            if (!course) {
                res.status(404).json({ success: false, message: "Course not found" });
                return;
            }
            const amount = course.price;
            let wallet = yield walletModal_1.default.findOne({ userId: educatorId });
            if (!wallet) {
                wallet = new walletModal_1.default({
                    userId: educatorId,
                    balance: 0,
                    transactions: [],
                });
            }
            wallet.balance += amount;
            wallet.transactions.push({
                amount,
                type: "credit",
                description: `Payment received for course ${course.title}`,
                createdAt: new Date(),
            });
            yield wallet.save();
            if (!course.enrolledStudents.includes(studentId)) {
                course.enrolledStudents.push(studentId);
                yield course.save();
            }
            res
                .status(200)
                .json({ success: true, message: "Payment verified successfully" });
        }
        else {
            res
                .status(400)
                .json({ success: false, message: "Invalid payment signature" });
        }
    }
    catch (error) {
        const err = error;
        console.error("Payment Verification Error:", error);
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.paymentVerification = paymentVerification;
// For student Entrollments
const fetchEntrollments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = req.params;
        const enrolledCourses = yield courseModal_1.default.find({ enrolledStudents: studentId }, { _id: 1, title: 1, description: 1, category: 1, price: 1, thumbnail: 1 });
        res.status(200).json({ success: true, enrolledCourses });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchEntrollments = fetchEntrollments;
// For Fetching Course Player Data
const fetchPlayerData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, studentId } = req.query;
        const course = yield courseModal_1.default.findById(courseId)
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
            return;
        }
        const isEnrolled = course === null || course === void 0 ? void 0 : course.enrolledStudents.includes(studentId);
        if (isEnrolled) {
            res.status(200).json({ courseData: course });
        }
        else {
            res
                .status(403)
                .json({
                success: false,
                message: "Access denied. Enrollment required.",
            });
        }
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchPlayerData = fetchPlayerData;
// For mark lecture as viewed
const markLectureViewed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, courseId, chapterId, lectureId, status } = req.body;
        // Find user's course progress
        const progress = yield courseProgressModal_1.default.findOne({ userId, courseId });
        if (!progress) {
            res.status(404).json({ message: "Course progress not found" });
            return;
        }
        // Find the specific chapter in progress
        const chapterProgress = progress.chapters.find((chapter) => chapter.chapterId.toString() === chapterId);
        if (!chapterProgress) {
            res.status(404).json({ message: "Chapter not found in progress" });
            return;
        }
        // Find the lecture in the chapter
        const lectureProgress = chapterProgress.lecturesProgress.find((lecture) => lecture.lectureId.toString() === lectureId);
        if (!lectureProgress) {
            res.status(404).json({ message: "Lecture not found in progress" });
            return;
        }
        // Mark the lecture as completed if not already done
        if (lectureProgress.status !== "completed") {
            lectureProgress.status = status;
            if (status === "completed") {
                lectureProgress.completedAt = new Date();
            }
        }
        // Check if all lectures in this chapter are completed
        const allLecturesCompleted = chapterProgress.lecturesProgress.every((lecture) => lecture.status === "completed");
        if (allLecturesCompleted) {
            chapterProgress.isCompleted = true;
            chapterProgress.completedAt = new Date();
        }
        // Check if all chapters are completed
        const allChaptersCompleted = progress.chapters.every((chapter) => chapter.isCompleted);
        if (allChaptersCompleted) {
            progress.isCompleted = true;
            progress.completedAt = new Date();
        }
        // Save the updated progress
        yield progress.save();
        res.status(200).json({ success: true, progress });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.markLectureViewed = markLectureViewed;
// For Get current course progress
const getCourseProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, courseId } = req.query;
        let progress = yield courseProgressModal_1.default.findOne({ userId, courseId });
        if (!progress) {
            const course = (yield courseModal_1.default.findById(courseId).populate({
                path: "chapters",
                populate: { path: "lectures" },
            }));
            if (!course) {
                res.status(404).json({ success: false, message: "Course not found" });
                return;
            }
            progress = new courseProgressModal_1.default({
                userId,
                courseId,
                chapters: course.chapters.map((chapter, index) => ({
                    chapterId: chapter._id,
                    isCompleted: false,
                    lecturesProgress: chapter.lectures.map((lecture, lectureIndex) => ({
                        lectureId: lecture._id,
                        status: index === 0 && lectureIndex === 0
                            ? "in_progress"
                            : "not_started",
                    })),
                })),
            });
            yield progress.save();
        }
        const totalLectures = progress.chapters.reduce((acc, ch) => acc + ch.lecturesProgress.length, 0);
        const completedLectures = progress.chapters.reduce((acc, ch) => acc +
            ch.lecturesProgress.filter((lec) => lec.status === "completed").length, 0);
        const completionPercentage = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;
        res.status(200).json({ success: true, completionPercentage, progress });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.getCourseProgress = getCourseProgress;
// For creating questions from pdf
const generateQuestionsFromPDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { pdfUrl } = req.query;
        if (!pdfUrl) {
            res.status(400).json({ message: "PDF URL is required" });
            return;
        }
        const response = yield axios_1.default.get(pdfUrl, {
            responseType: "arraybuffer",
        });
        const data = yield (0, pdf_parse_1.default)(response.data);
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
        const completion = yield axios_1.default.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "deepseek/deepseek-r1-zero:free",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "Interview Question Generator",
            },
        });
        const rawText = ((_b = (_a = completion.data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "";
        const cleanedInput = rawText.replace(/\\boxed\{\[|\]\}/g, "");
        const questions = cleanedInput
            .split(",")
            .map((q) => q.replace(/[\n"+]/g, "").trim());
        res.status(200).json({ success: true, questions: questions });
    }
    catch (error) {
        const err = error;
        console.log(err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.generateQuestionsFromPDF = generateQuestionsFromPDF;
// For fetching Top Courses
const fetchTopCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield courseModal_1.default.aggregate([
            {
                $addFields: {
                    enrolledCount: { $size: "$enrolledStudents" },
                },
            },
            {
                $sort: { enrolledCount: -1 },
            },
            {
                $limit: 5,
            },
            {
                $project: {
                    title: 1,
                    thumbnail: 1,
                    _id: 1,
                },
            },
        ]);
        res.status(200).json({ success: true, courses });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchTopCourses = fetchTopCourses;
// for posting reviews and rating
const postReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, courseId, rating, review } = req.body;
        const existingReview = yield reviewsModal_1.default.findOne({
            user: userId,
            course: courseId,
        });
        if (existingReview) {
            res.status(400).json({ message: "You have already reviewed this room." });
            return;
        }
        const Mreview = new reviewsModal_1.default({
            user: userId,
            course: courseId,
            rating,
            comment: review,
        });
        yield Mreview.save();
        res
            .status(201)
            .json({ message: "Review posted successfully.", success: true });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.postReview = postReview;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            res
                .status(400)
                .json({ success: false, message: "No refresh token found" });
            return;
        }
        const decoded = (0, jwt_1.verifyToken)(token, process.env.JWT_SECRET);
        let user;
        if (decoded.role === "student") {
            user = yield userModal_1.default.findById(decoded.id);
        }
        else if (decoded.role === "educator") {
            user = yield educatorModal_1.default.findById(decoded.id);
        }
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        const newAccessToken = (0, jwt_1.generateToken)(decoded.id, decoded.role);
        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.refreshToken = refreshToken;

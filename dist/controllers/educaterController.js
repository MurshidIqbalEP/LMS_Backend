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
exports.UpdateCourse = exports.fetchCourseByCourseId = exports.deleteCourseById = exports.fetchCoursesById = exports.postCourse = exports.fetchAllCategory = exports.loginEducator = exports.verifyOtp = exports.registerEducator = void 0;
const bcript_1 = require("../utils/bcript");
const educatorModal_1 = __importDefault(require("../modal/educatorModal"));
const jwt_1 = require("../utils/jwt");
const courseModal_1 = __importDefault(require("../modal/courseModal"));
const chapterModal_1 = __importDefault(require("../modal/chapterModal"));
const lectureModal_1 = __importDefault(require("../modal/lectureModal"));
const categoryModal_1 = __importDefault(require("../modal/categoryModal"));
const walletModal_1 = __importDefault(require("../modal/walletModal"));
const otpModal_1 = __importDefault(require("../modal/otpModal"));
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
// Register
const registerEducator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, subjectExpertise, qualification, profilePicture, governmentId, } = req.body;
        const existedEducator = yield educatorModal_1.default.findOne({ email });
        if (existedEducator) {
            res.status(400).json({ message: "Educator already exists" });
            return;
        }
        const hashedPassword = yield (0, bcript_1.hashPassword)(password);
        const educator = yield educatorModal_1.default.create({
            name,
            email,
            password: hashedPassword,
            subjectExpertise,
            qualification,
            profilePicture,
            governmentId,
        });
        yield walletModal_1.default.create({
            userId: educator._id,
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
exports.registerEducator = registerEducator;
// verify otp
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const existingOtp = yield otpModal_1.default.findOne({ email, code: otp });
        if (!existingOtp) {
            res.status(400).json({ message: "Invalid or expired OTP" });
            return;
        }
        const user = yield educatorModal_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        user.isVerified = true;
        yield user.save();
        yield otpModal_1.default.deleteOne({ _id: existingOtp._id });
        res.status(200).json({ message: "Email verified successfully", success: true });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.verifyOtp = verifyOtp;
// Login
const loginEducator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const educator = yield educatorModal_1.default.findOne({ email });
        if (!educator) {
            res.status(400).json({ message: "Educator not found" });
            return;
        }
        if (!educator.isVerified) {
            res.status(400).json({ success: false, message: "Email is not verified" });
            return;
        }
        const isPasswordValid = yield (0, bcript_1.comparePassword)(password, educator.password);
        if (!isPasswordValid) {
            res.status(400).json({ success: false, message: "Invalid credentials" });
            return;
        }
        const token = (0, jwt_1.generateToken)(educator._id.toString(), "educator");
        const refreshToken = (0, jwt_1.generateRefreshtoken)(educator._id.toString(), "educator");
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
            subjectExpertise: educator.subjectExpertise,
            qualification: educator.qualification,
            profilePicture: educator.profilePicture,
            token,
            message: "Successfully logged in",
        });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.loginEducator = loginEducator;
// Fetch all category
const fetchAllCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield categoryModal_1.default.find({}, { name: 1, _id: 0 });
        const categoryNames = categories.map(category => category.name);
        res.status(200).json({ categoryNames });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchAllCategory = fetchAllCategory;
// Post a course
const postCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, educatorId, category, price, thumbnailUrl, resourceUrl, chapters } = req.body;
        if (!educatorId) {
            res.status(404).json({ success: false, message: "EducatorId not found" });
            return;
        }
        const newCourse = new courseModal_1.default({
            title,
            description,
            educatorId,
            category,
            price,
            thumbnail: thumbnailUrl,
            resources: resourceUrl
        });
        yield newCourse.save();
        for (const chapterData of chapters) {
            const newChapter = new chapterModal_1.default({
                courseId: newCourse._id,
                title: chapterData.name,
                position: chapterData.id,
            });
            yield newChapter.save();
            newCourse.chapters.push(newChapter._id);
            for (const lectureData of chapterData.lectures) {
                const newLecture = new lectureModal_1.default({
                    chapterId: newChapter._id,
                    title: lectureData.name,
                    videoUrl: lectureData.url,
                    position: lectureData.id,
                });
                yield newLecture.save();
                newChapter.lectures.push(newLecture._id);
            }
            yield newChapter.save();
        }
        yield newCourse.save();
        res.status(201).json({ message: "Course created successfully", course: newCourse });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.postCourse = postCourse;
// Fetch courses by educator ID
const fetchCoursesById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { educatorId } = req.query;
        if (!educatorId) {
            res.status(400).json({ message: "Educator ID is required" });
            return;
        }
        const courses = yield courseModal_1.default.find({ educatorId }, { title: 1, description: 1, category: 1, thumbnail: 1, isPublished: 1, enrolledStudents: 1 });
        res.status(200).json({ courses });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchCoursesById = fetchCoursesById;
// Delete course by course ID
const deleteCourseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.query;
        if (!courseId) {
            res.status(400).json({ message: "Educator ID is required" });
            return;
        }
        const course = yield courseModal_1.default.findById(courseId);
        const chapters = yield chapterModal_1.default.find({ courseId: course === null || course === void 0 ? void 0 : course._id });
        const chapterIds = chapters.map(chapter => chapter._id);
        yield lectureModal_1.default.deleteMany({ chapterId: { $in: chapterIds } });
        yield chapterModal_1.default.deleteMany({ courseId: course === null || course === void 0 ? void 0 : course._id });
        yield courseModal_1.default.findByIdAndDelete(courseId);
        res.status(200).json({ success: true, message: "Course deleted successfully" });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.deleteCourseById = deleteCourseById;
// Fetch Course data by Course Id
const fetchCourseByCourseId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = req.params.courseId;
        const course = yield courseModal_1.default.findById(courseId)
            .populate({
            path: "chapters",
            populate: {
                path: "lectures",
            },
        });
        res.status(200).json({ course });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.fetchCourseByCourseId = fetchCourseByCourseId;
// Update Course
const UpdateCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, title, description, educatorId, category, price, thumbnailUrl, resourceUrl, chapters } = req.body;
        if (!id) {
            res.status(400).json({ success: false, message: "Course ID is required." });
            return;
        }
        const updatedCourse = yield courseModal_1.default.findByIdAndUpdate(id, {
            $set: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (title && { title })), (description && { description })), (educatorId && { educatorId })), (category && { category })), (price !== undefined && { price })), (thumbnailUrl && { thumbnail: thumbnailUrl })), (resourceUrl && { resources: resourceUrl })),
        }, { new: true });
        if (!updatedCourse) {
            res.status(404).json({ success: false, message: "Course not found." });
            return;
        }
        if (chapters && Array.isArray(chapters)) {
            const existingChapters = yield chapterModal_1.default.find({ courseId: id });
            const existingChapterIds = existingChapters.map(chapter => chapter._id.toString());
            const chapterIdsToKeep = [];
            for (const chapterData of chapters) {
                let chapter;
                if (chapterData._id && typeof chapterData._id === 'string' && chapterData._id.trim()) {
                    chapterIdsToKeep.push(chapterData._id);
                    chapter = yield chapterModal_1.default.findByIdAndUpdate(chapterData._id, { title: chapterData.name, position: chapterData.id }, { new: true });
                }
                else {
                    chapter = new chapterModal_1.default({
                        courseId: updatedCourse._id,
                        title: chapterData.name,
                        position: chapterData.id,
                    });
                    yield chapter.save();
                    chapterIdsToKeep.push(chapter._id.toString());
                    updatedCourse.chapters.push(chapter._id);
                }
                if (chapter && chapterData.lectures && Array.isArray(chapterData.lectures)) {
                    const existingLectures = yield lectureModal_1.default.find({ chapterId: chapter._id });
                    const existingLectureIds = existingLectures.map(lecture => lecture._id.toString());
                    const lectureIdsToKeep = [];
                    for (const lectureData of chapterData.lectures) {
                        if (lectureData._id && typeof lectureData._id === 'string' && lectureData._id.trim()) {
                            lectureIdsToKeep.push(lectureData._id);
                            yield lectureModal_1.default.findByIdAndUpdate(lectureData._id, { title: lectureData.name, videoUrl: lectureData.url, position: lectureData.id }, { new: true });
                        }
                        else {
                            const newLecture = new lectureModal_1.default({
                                chapterId: chapter._id,
                                title: lectureData.name,
                                videoUrl: lectureData.url,
                                position: lectureData.id,
                            });
                            yield newLecture.save();
                            lectureIdsToKeep.push(newLecture._id.toString());
                            if (!chapter.lectures) {
                                chapter.lectures = [];
                            }
                            chapter.lectures.push(newLecture._id);
                        }
                    }
                    // Delete lectures
                    const lectureIdsToRemove = existingLectureIds.filter(id => !lectureIdsToKeep.includes(id));
                    if (lectureIdsToRemove.length > 0) {
                        yield lectureModal_1.default.deleteMany({ _id: { $in: lectureIdsToRemove } });
                        chapter.lectures = chapter.lectures.filter(lectureId => !lectureIdsToRemove.includes(lectureId.toString()));
                    }
                    yield chapter.save();
                }
            }
            const chapterIdsToRemove = existingChapterIds.filter(id => !chapterIdsToKeep.includes(id));
            if (chapterIdsToRemove.length > 0) {
                // Delete associated lectures first
                yield lectureModal_1.default.deleteMany({ chapterId: { $in: chapterIdsToRemove } });
                // Then delete the chapters
                yield chapterModal_1.default.deleteMany({ _id: { $in: chapterIdsToRemove } });
                updatedCourse.chapters = updatedCourse.chapters.filter(chapterId => !chapterIdsToRemove.includes(chapterId.toString()));
            }
            yield updatedCourse.save();
        }
        res.status(200).json({
            success: true,
            message: "Course updated successfully"
        });
    }
    catch (error) {
        console.error("Course update error:", error);
        const err = error;
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.UpdateCourse = UpdateCourse;

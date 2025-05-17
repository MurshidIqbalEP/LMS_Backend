import express from 'express';
import { registerUser,loginUser,googleRegister,googleLogin, fetchAllCategory, fetchAllCourses,fetchCourse, payment, paymentVerification, fetchEntrollments, fetchPlayerData, getCourseProgress, markLectureViewed, generateQuestionsFromPDF,fetchTopCourses,verifyOtp, postReview, refreshToken} from '../controllers/studentsController'; 
import { studentauth } from '../middleware/StudentAuth';
const router = express.Router();

router.post('/register', registerUser);
router.post('/verifyOtp', verifyOtp);
router.post("/googleregister", googleRegister);
router.post("/login", loginUser);
router.post("/googlelogin",googleLogin);
router.post("/refresh-token",refreshToken);
router.get("/fetchAllCategory",studentauth,fetchAllCategory);
router.get("/fetchAllCourse",studentauth,fetchAllCourses);
router.get("/fetchCourse",studentauth,fetchCourse);
router.post("/payment",studentauth,payment);
router.post("/paymentVerification",studentauth,paymentVerification);
router.get("/myEntrollments/:studentId",studentauth,fetchEntrollments);
router.get("/fetchPlayerData",studentauth,fetchPlayerData);
router.patch("/markLecture",studentauth,markLectureViewed);
router.get("/fetchCourseProgress",studentauth,getCourseProgress);
router.get("/fetchQuestionsFromPdf",studentauth,generateQuestionsFromPDF);
router.get("/fetchTopCourses",studentauth,fetchTopCourses);
router.post("/postReview",studentauth,postReview)


export default router;

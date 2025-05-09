import express from 'express';
import { registerUser,loginUser,googleRegister,googleLogin, fetchAllCategory, fetchAllCourses,fetchCourse, payment, paymentVerification, fetchEntrollments, fetchPlayerData, getCourseProgress, markLectureViewed, generateQuestionsFromPDF,fetchTopCourses,verifyOtp} from '../controllers/studentsController'; 

const router = express.Router();

router.post('/register', registerUser);
router.post('/verifyOtp', verifyOtp);
router.post("/googleregister", googleRegister);
router.post("/login", loginUser);
router.post("/googlelogin",googleLogin);
router.get("/fetchAllCategory",fetchAllCategory);
router.get("/fetchAllCourse",fetchAllCourses);
router.get("/fetchCourse",fetchCourse);
router.post("/payment",payment);
router.post("/paymentVerification",paymentVerification);
router.get("/myEntrollments/:studentId",fetchEntrollments);
router.get("/fetchPlayerData",fetchPlayerData);
router.patch("/markLecture",markLectureViewed);
router.get("/fetchCourseProgress",getCourseProgress);
router.get("/fetchQuestionsFromPdf",generateQuestionsFromPDF);
router.get("/fetchTopCourses",fetchTopCourses);


export default router;

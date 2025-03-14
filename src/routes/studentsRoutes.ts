import express from 'express';
import { registerUser,loginUser,googleRegister,googleLogin, fetchAllCategory, fetchAllCourses} from '../controllers/studentsController'; 

const router = express.Router();

router.post('/register', registerUser);
router.post("/googleregister", googleRegister);
router.post("/login", loginUser);
router.post("/googlelogin",googleLogin);
router.get("/fetchAllCategory",fetchAllCategory);
router.get("/fetchAllCourse",fetchAllCourses);


export default router;

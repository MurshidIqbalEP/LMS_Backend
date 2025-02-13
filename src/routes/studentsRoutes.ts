import express from 'express';
import { registerUser,loginUser,googleRegister,googleLogin} from '../controllers/studentsController'; 

const router = express.Router();

router.post('/register', registerUser);
router.post("/googleregister", googleRegister);
router.post("/login", loginUser);
router.post("/googlelogin",googleLogin);


export default router;

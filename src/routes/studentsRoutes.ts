import express from 'express';
import { registerUser,loginUser,googleRegister} from '../controllers/studentsController'; 

const router = express.Router();

router.post('/register', registerUser);
router.post("/googleregister", googleRegister);
router.post("/login", loginUser);
router.post("/googlelogin", loginUser);


export default router;

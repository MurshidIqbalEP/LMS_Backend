import express from 'express';
import { registerUser } from '../controllers/studentsController'; 

const router = express.Router();

router.post('/register', registerUser);

export default router;

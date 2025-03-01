import express from 'express';
import {registerEducator,loginEducator,postCourse } from '../controllers/educaterController'; 

const router = express.Router();

router.post('/register',registerEducator);
router.post('/login',loginEducator);
router.post('/postCourse',postCourse);



export default router;
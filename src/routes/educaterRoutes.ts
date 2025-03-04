import express from 'express';
import {registerEducator,loginEducator,postCourse, fetchCoursesById,deleteCourseById } from '../controllers/educaterController'; 

const router = express.Router();

router.post('/register',registerEducator);
router.post('/login',loginEducator);
router.post('/postCourse',postCourse);
router.get('/fetchCoursesById',fetchCoursesById);
router.delete('/deleteCourse',deleteCourseById);



export default router;
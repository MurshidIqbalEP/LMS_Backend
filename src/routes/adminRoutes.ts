import express from 'express';
import { approveCourse, approveCourseEdit, blockEducator, blockStudent, fetchChartData, fetchCourse, fetchCourses, fetchEditedCourses, fetchEducator, fetchnewCourses, fetchStudents, googleLogin, listCourse, loginAdmin, rejectCourse, rejectCourseEdit, unblockEducator, unblockStudent, unlistCourse } from '../controllers/adminController';
import { adminauth } from '../middleware/AdminAuth';
const router = express.Router();

router.post('/login',loginAdmin);
router.post('/googlelogin',googleLogin);
router.get('/fetchStudents',adminauth,fetchStudents);
router.patch('/blockStudent',adminauth,blockStudent);
router.patch('/unblockStudent',adminauth,unblockStudent);
router.get('/fetchEducators',adminauth,fetchEducator);
router.patch('/blockEducator',adminauth,blockEducator);
router.patch('/unblockEducator',adminauth,unblockEducator);
router.get('/fetchNewCourses',adminauth,fetchnewCourses);
router.patch('/approveCourse',adminauth,approveCourse);
router.patch('/rejectCourse',adminauth,rejectCourse);
router.patch('/approveEdit',adminauth,approveCourseEdit);
router.patch('/rejectEdit',adminauth,rejectCourseEdit);
router.get('/fetchEditedCourse',adminauth,fetchEditedCourses);
router.get('/fetchAllCourses',adminauth,fetchCourses);
router.patch('/listCourse',adminauth,listCourse);
router.patch('/unlistCourse',adminauth,unlistCourse);
router.get('/fetchCourseData',adminauth,fetchCourse);
router.get('/chartData',adminauth,fetchChartData);

export default router;
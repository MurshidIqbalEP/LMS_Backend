"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const educaterController_1 = require("../controllers/educaterController");
const EducatorAuth_1 = require("../middleware/EducatorAuth");
const router = express_1.default.Router();
router.post('/register', educaterController_1.registerEducator);
router.post('/verifyOtp', educaterController_1.verifyOtp);
router.post('/login', educaterController_1.loginEducator);
router.post('/postCourse', EducatorAuth_1.educatorauth, educaterController_1.postCourse);
router.get('/fetchCoursesById', EducatorAuth_1.educatorauth, educaterController_1.fetchCoursesById);
router.delete('/deleteCourse', EducatorAuth_1.educatorauth, educaterController_1.deleteCourseById);
router.get('/fetchCourseByCourseid/:courseId', EducatorAuth_1.educatorauth, educaterController_1.fetchCourseByCourseId);
router.patch('/updateCourse', EducatorAuth_1.educatorauth, educaterController_1.UpdateCourse);
router.get('/fetchCategory', EducatorAuth_1.educatorauth, educaterController_1.fetchAllCategory);
exports.default = router;

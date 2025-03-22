import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../utils/bcript";
import Educator from "../modal/educatorModal";
import { generateRefreshtoken, generateToken } from "../utils/jwt";
import Course from "../modal/courseModal";
import Chapter from "../modal/chapterModal";
import Lecture from "../modal/lectureModal";
import Category from "../modal/categoryModal";

// Register
export const registerEducator = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      subjectExpertise,
      qualification,
      profilePicture,
      governmentId,
    } = req.body;

    const existedEducator = await Educator.findOne({ email });
    if (existedEducator) {
      res.status(400).json({ message: "Educator already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const educator = await Educator.create({
      name,
      email,
      password: hashedPassword,
      subjectExpertise,
      qualification,
      profilePicture,
      governmentId,
    });
    res.status(201).json({ message: "Educator created successfully" });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login
export const loginEducator = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const educator = await Educator.findOne({ email });
    if (!educator) {
      res.status(400).json({ message: "Educator not found" });
      return;
    }

    const isPasswordValid = await comparePassword(password, educator.password);
    if (!isPasswordValid) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

     const token = generateToken(educator._id.toString());
     const refreshToken = generateRefreshtoken(educator._id.toString());
    
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
    
        res.status(200).json({
          _id: educator._id,
          name: educator.name,
          email: educator.email,
          subjectExpertise:educator.subjectExpertise,
          qualification:educator.qualification,
          profilePicture:educator.profilePicture,
          token,
          message: "Successfully logged in",
        });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};


// Fetch all category
export const fetchAllCategory = async (req: Request, res: Response) => {
  try {
    
    const categories = await Category.find({}, { name: 1, _id: 0 }); 
    const categoryNames = categories.map(category => category.name);
     res.status(200).json({ categoryNames }); 
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};


// Post a course
export const postCourse = async (req: Request, res: Response)=>{
  try {
    const { title, description, educatorId, category, price,thumbnailUrl, resourceUrl, chapters } = req.body;

    if (!educatorId) {
     res.status(404).json({ success: false, message: "EducatorId not found" });
     return
    }

    const newCourse = new Course({
      title,
      description,
      educatorId,
      category,
      price,
      thumbnail:thumbnailUrl,
      resources:resourceUrl
    });
    await newCourse.save();

     for (const chapterData of chapters) {
      const newChapter = new Chapter({
        courseId: newCourse._id,
        title: chapterData.name,
        position: chapterData.id,
      });

      await newChapter.save();
      newCourse.chapters.push(newChapter._id);

      for (const lectureData of chapterData.lectures) {
        const newLecture = new Lecture({
          chapterId: newChapter._id,
          title: lectureData.name,
          videoUrl: lectureData.url,
          position: lectureData.id,
        
        });
        await newLecture.save();
        newChapter.lectures.push(newLecture._id);
      }
      await newChapter.save();
    }
    await newCourse.save();
     res.status(201).json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
}

// Fetch courses by educator ID
export const fetchCoursesById = async (req:Request,res:Response)=>{
  try {
    const {educatorId} = req.query;
    if (!educatorId) {
       res.status(400).json({ message: "Educator ID is required" });
       return
    }
    const courses =await Course.find({educatorId},{title:1,description:1,category:1,thumbnail:1,isPublished:1,enrolledStudents:1})
    res.status(200).json({courses})
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
}

// Delete course by course ID
export const deleteCourseById = async (req:Request,res:Response)=>{
  try {
    const {courseId} = req.query;
    if (!courseId) {
      res.status(400).json({ message: "Educator ID is required" });
      return
   }

   const course = await Course.findById(courseId);
   const chapters = await Chapter.find({courseId:course?._id});
   const chapterIds = chapters.map(chapter => chapter._id);
   await Lecture.deleteMany({ chapterId: { $in: chapterIds } });
   await Chapter.deleteMany({ courseId: course?._id });
   await Course.findByIdAndDelete(courseId);

   res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
}

// Fetch Course data by Course Id
export const fetchCourseByCourseId = async (req:Request,res:Response)=>{
  try {
    
    const courseId = req.params.courseId;
    
    const course = await Course.findById(courseId)
  .populate({
    path: "chapters",
    populate: {
      path: "lectures",
    },
  });
  res.status(200).json({course});
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
}

// Update Course
export const UpdateCourse = async (req: Request, res: Response) => {
  try {
    const { id, title, description, educatorId, category, price, thumbnailUrl, resourceUrl, chapters } = req.body;
    if (!id) {
       res.status(400).json({ success: false, message: "Course ID is required." });
       return
    }
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        $set: { 
          ...(title && { title }),
          ...(description && { description }),
          ...(educatorId && { educatorId }),
          ...(category && { category }),
          ...(price !== undefined && { price }),
          ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
          ...(resourceUrl && { resources: resourceUrl })
        },
      },
      { new: true } 
    );

    if (!updatedCourse) {
       res.status(404).json({ success: false, message: "Course not found." });
       return
    }

    if (chapters && Array.isArray(chapters)) {
      const existingChapters = await Chapter.find({ courseId: id });
      const existingChapterIds = existingChapters.map(chapter => chapter._id.toString());
      const chapterIdsToKeep: string[] = [];
      for (const chapterData of chapters) {
        let chapter;
        if (chapterData._id && typeof chapterData._id === 'string' && chapterData._id.trim()) {
          chapterIdsToKeep.push(chapterData._id);
          
          chapter = await Chapter.findByIdAndUpdate(
            chapterData._id,
            { title: chapterData.name, position: chapterData.id },
            { new: true }
          );
        } else {
          chapter = new Chapter({
            courseId: updatedCourse._id,
            title: chapterData.name,
            position: chapterData.id,
          });
          await chapter.save();
          chapterIdsToKeep.push(chapter._id.toString());
          updatedCourse.chapters.push(chapter._id);
        }

        if (chapter && chapterData.lectures && Array.isArray(chapterData.lectures)) {
          const existingLectures = await Lecture.find({ chapterId: chapter._id });
          const existingLectureIds = existingLectures.map(lecture => lecture._id.toString());
          const lectureIdsToKeep: string[] = [];
          for (const lectureData of chapterData.lectures) {
            if (lectureData._id && typeof lectureData._id === 'string' && lectureData._id.trim()) {
              lectureIdsToKeep.push(lectureData._id);
              await Lecture.findByIdAndUpdate(
                lectureData._id,
                { title: lectureData.name, videoUrl: lectureData.url, position: lectureData.id },
                { new: true }
              );
            } else {
              const newLecture = new Lecture({
                chapterId: chapter._id,
                title: lectureData.name,
                videoUrl: lectureData.url,
                position: lectureData.id,
              });
              
              await newLecture.save();
              lectureIdsToKeep.push(newLecture._id.toString());
              if (!chapter.lectures) {
                chapter.lectures = [];
              }
              chapter.lectures.push(newLecture._id);
            }
          }

          // Delete lectures
          const lectureIdsToRemove = existingLectureIds.filter(id => !lectureIdsToKeep.includes(id));
          if (lectureIdsToRemove.length > 0) {
            await Lecture.deleteMany({ _id: { $in: lectureIdsToRemove } });
            chapter.lectures = chapter.lectures.filter(lectureId => 
              !lectureIdsToRemove.includes(lectureId.toString())
            );
          }
          await chapter.save();
        }
      }

      const chapterIdsToRemove = existingChapterIds.filter(id => !chapterIdsToKeep.includes(id));
      if (chapterIdsToRemove.length > 0) {
        // Delete associated lectures first
        await Lecture.deleteMany({ chapterId: { $in: chapterIdsToRemove } });
        // Then delete the chapters
        await Chapter.deleteMany({ _id: { $in: chapterIdsToRemove } });
        
        updatedCourse.chapters = updatedCourse.chapters.filter(chapterId => 
          !chapterIdsToRemove.includes(chapterId.toString())
        );
      }
      await updatedCourse.save();
    }
     res.status(200).json({ 
      success: true, 
      message: "Course updated successfully"
    });
  } catch (error) {
    console.error("Course update error:", error);
    const err = error as Error;
     res.status(500).json({ success: false, message: err.message });
  }
}
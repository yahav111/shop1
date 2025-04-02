import multer from "multer";

// הגדרת אחסון בזיכרון
const storage = multer.memoryStorage();
// יצירת אובייקט multer עם מתודה 'single' שמקבלת את שם השדה (במקרה זה 'image')
const upload = multer({ storage });

// יצוא ה-middleware
export default upload;

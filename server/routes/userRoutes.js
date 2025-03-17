import express from "express";
import { signUp, signIn } from "../controllers/Usercontrollers.js";

const router = express.Router();

router.post("/signup", signUp);

router.post("/signin", signIn);

// אתה בודק אם המשתמש יש לו טוקן והטוקן valid.
// אם כן אתה מחזיר לו את הפרטים של היוזר
// router.get("/me",)

export default router;

import express from "express";
import { signUp, signIn, verifyToken } from "../controllers/Usercontrollers.js";

const router = express.Router();

router.post("/signup", signUp);

router.post("/signin", signIn);

router.get("/me", verifyToken);

export default router;

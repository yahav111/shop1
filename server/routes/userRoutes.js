import express from "express";
import {
  signUp,
  signIn,
  verifyToken,
  logout,
} from "../controllers/Usercontrollers.js";

const router = express.Router();

router.post("/signup", signUp);

router.post("/signin", signIn);

router.get("/me", verifyToken);

router.post("/logout", logout);

export default router;

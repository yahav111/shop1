import express from "express";
import {
  signUp,
  signIn,
  verifyToken,
  logout,
  updateUser,
} from "../controllers/Usercontrollers.js";

const router = express.Router();

router.post("/signup", signUp);

router.post("/signin", signIn);

router.get("/me", verifyToken);

router.post("/", logout);

router.put("/", updateUser);

export default router;

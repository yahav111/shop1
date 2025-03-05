import express from "express";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/PasswordControllers.js";

const router = express.Router();

router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);

export default router;

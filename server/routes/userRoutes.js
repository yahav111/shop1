import express from "express";
import {
  signUp,
  signIn,
  verifyToken,
  logout,
  updateUser,
  deleteUser,
  getAllUsers,
  loginAdmin,
} from "../controllers/Usercontrollers.js";
import Protect from "../middleware/protect.js";

const router = express.Router();

router.get("/", getAllUsers);

router.delete("/:id", deleteUser);

router.post("/signup", signUp);

router.post("/signin", signIn);

router.post("/signinDashboard", loginAdmin);

router.get("/me", Protect, verifyToken);

router.post("/", logout);

router.put("/", updateUser);

export default router;

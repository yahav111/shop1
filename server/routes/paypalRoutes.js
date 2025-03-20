import express from "express";
import { generateAccessToken } from "../controllers/paypalControllers.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const accessToken = await generateAccessToken();
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

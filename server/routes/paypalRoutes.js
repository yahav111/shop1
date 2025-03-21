import express from "express";
import {
  generateAccessToken,
  createOrder,
  capturePayment,
} from "../controllers/paypalControllers.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const accessToken = await generateAccessToken();
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", createOrder);
router.post("/:orderId", capturePayment);

export default router;

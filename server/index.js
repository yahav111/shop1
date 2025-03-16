import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import PasswordRoutes from "./routes/passwordRoutes.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/auth", userRoutes);

app.use("/products", productRoutes);

app.use("/Password", PasswordRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

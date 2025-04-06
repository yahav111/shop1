import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import PasswordRoutes from "./routes/passwordRoutes.js";
import orderRoutes from "./routes/ordersRoutes.js";
import paypalRoutes from "./routes/paypalRoutes.js";
import CategoriesRoutes from "./routes/CategoriesRoutes.js";
const app = express();
const PORT = 3000;

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "http://localhost:5175"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", userRoutes);
app.use("/products", productRoutes);
app.use("/Password", PasswordRoutes);
app.use("/order", orderRoutes);
app.use("/paypal", paypalRoutes);
app.use("/categories", CategoriesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

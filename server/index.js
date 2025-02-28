import express from "express";
import cors from "cors"; 
import productRoutes from "./routes/productRoutes.js";

const app = express();
const PORT = 3000;


app.use(cors()); 

app.use(express.json());
app.use("/products", productRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


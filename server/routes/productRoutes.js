import express from "express";
import Protect from "../middleware/protect.js";
import upload from "../middleware/upload.js";
import {
  getAllProducts,
  getUserCart,
  createUserProduct,
  updateUserProduct,
  createProduct,
  clearCart,
  getProductById,
  deleteProductuser,
  deleteProductById,
  updateProductById,
} from "../controllers/ProductControllers.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/userId", Protect, getUserCart);
router.get("/productId/:productId", getProductById);
router.put("/productId/:productId", updateProductById);

// create Only Product - Model Product (לא עגלת קניות)

router.post("/", upload.single("image"), createProduct);
// create UserProducts when user add Product to the cart - Model UserProducts
router.post("/addToCart", Protect, createUserProduct);

router.put("/", Protect, updateUserProduct);
router.delete("/", Protect, deleteProductuser);
router.delete("/clear", clearCart);
router.delete("/:productId", deleteProductById);

export default router;

// קשור לנקודת קצה ADDTOCART
// 🔹 בדוק אם המוצר כבר קיים אצל המשתמש ב-UserProducts
// const existingUserProduct = await prisma.userProducts.findUnique({
//   where: {
//     productId_userId: {
//       productId,
//       userId,
//     },
//   },
// });

// if (existingUserProduct) {
//   // 🔄 אם המוצר כבר קיים - עדכן את הכמות
//   const updatedUserProduct = await prisma.userProducts.update({
//     where: {
//       productId_userId: {
//         productId,
//         userId,
//       },
//     },
//     data: {
//       quantity: existingUserProduct.quantity + (quantity || 1),
//     },
//   });

//   return res.status(200).json({
//     product: updatedUserProduct,
//     message: "Product quantity updated successfully",
//   });
// }

// // 🔹 אם המוצר לא קיים אצל המשתמש, צור אותו
// const userProduct = await prisma.userProducts.create({
//   data: {
//     userId,
//     productId: existingProduct.productId,
//     quantity: quantity || 1,
//   },
// });

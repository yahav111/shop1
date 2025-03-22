import express from "express";
import {
  getAllProducts,
  getUserCart,
  createUserProduct,
  updateUserProduct,
  deleteProduct,
  createProduct,
  clearCart,
} from "../controllers/ProductControllers.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/userId", getUserCart);
// create Only Product - Model Product (לא עגלת קניות)

router.post("/", createProduct);
// create UserProducts when user add Product to the cart - Model UserProducts
router.post("/addToCart", createUserProduct);

router.put("/", updateUserProduct);
router.delete("/", deleteProduct);
router.delete("/clear", clearCart);

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

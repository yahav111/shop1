/*
  Warnings:

  - You are about to drop the column `quantity` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiry` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_userId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "quantity",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExpiry";

-- CreateTable
CREATE TABLE "UserProducts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "UserProducts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserProducts" ADD CONSTRAINT "UserProducts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProducts" ADD CONSTRAINT "UserProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

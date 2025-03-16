/*
  Warnings:

  - A unique constraint covering the columns `[productId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Made the column `productId` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "UserProducts" DROP CONSTRAINT "UserProducts_productId_fkey";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "productId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_productId_key" ON "Product"("productId");

-- AddForeignKey
ALTER TABLE "UserProducts" ADD CONSTRAINT "UserProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

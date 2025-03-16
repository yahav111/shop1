/*
  Warnings:

  - A unique constraint covering the columns `[productId,userId]` on the table `UserProducts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserProducts_productId_userId_key" ON "UserProducts"("productId", "userId");

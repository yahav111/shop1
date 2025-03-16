-- CreateTable
CREATE TABLE "dbProduct" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "rating" JSONB NOT NULL,

    CONSTRAINT "dbProduct_pkey" PRIMARY KEY ("id")
);

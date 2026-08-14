/*
  Warnings:

  - A unique constraint covering the columns `[storageKey]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storageKey` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "storageKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Image_storageKey_key" ON "Image"("storageKey");

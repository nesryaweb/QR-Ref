/*
  Warnings:

  - You are about to drop the column `storageKey` on the `Image` table. All the data in the column will be lost.
  - Added the required column `data` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Image_storageKey_key";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "storageKey",
ADD COLUMN     "data" BYTEA NOT NULL;

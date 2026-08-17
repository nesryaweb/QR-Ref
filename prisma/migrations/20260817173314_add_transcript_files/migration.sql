-- AlterTable
ALTER TABLE "Transcript" ADD COLUMN     "image" BYTEA,
ADD COLUMN     "imageMimeType" TEXT,
ADD COLUMN     "imageSize" INTEGER,
ADD COLUMN     "pdf" BYTEA,
ADD COLUMN     "pdfSize" INTEGER;

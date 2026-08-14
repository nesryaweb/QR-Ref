-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "referenceId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "blobUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_referenceId_key" ON "Image"("referenceId");

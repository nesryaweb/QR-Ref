import { generateReferenceId } from "@/lib/reference";
import { uploadImage } from "@/lib/storage";
import { prisma } from "@/lib/db";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json(
        { error: "Image file is required." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        {
          error: "Only PNG, JPEG, and WEBP images are allowed.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        {
          error: "Image must be smaller than 10MB.",
        },
        { status: 400 },
      );
    }

    let referenceId;
    let existingImage;

    do {
      referenceId = generateReferenceId();

      existingImage = await prisma.image.findUnique({
        where: {
          referenceId,
        },
      });
    } while (existingImage);

    const extension = getExtension(file.type);

    const storageKey = `${referenceId}.${extension}`;

    await uploadImage(file, storageKey);

    return Response.json({
      success: true,
      referenceId,
      storageKey,
    });
  } catch (error) {
    console.error("Image upload failed:", error);

    return Response.json(
      {
        error: "Failed to upload image.",
      },
      { status: 500 },
    );
  }
}

function getExtension(mimeType) {
  const extensions = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
  };

  return extensions[mimeType];
}

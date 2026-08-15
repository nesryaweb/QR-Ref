import { prisma } from "@/lib/db";
import { generateReferenceId } from "@/lib/reference";

import { getServerSession } from "next-auth";
import { authOptions } from "../../../../pages/api/auth/[...nextauth]";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
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
          error: "Image must be smaller than 5MB.",
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

    const imageBuffer = Buffer.from(await file.arrayBuffer());

    const image = await prisma.image.create({
      data: {
        referenceId,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        data: imageBuffer,
      },
    });

    return Response.json({
      success: true,
      image: {
        id: image.id,
        referenceId: image.referenceId,
        originalName: image.originalName,
        mimeType: image.mimeType,
        size: image.size,
      },
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

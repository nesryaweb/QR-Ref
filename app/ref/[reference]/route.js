import { prisma } from "@/lib/db";
import { createEditedImage } from "@/lib/image-editor";

export async function GET(request, { params }) {
  try {
    const { reference } = await params;

    const referenceId = reference.replace(/\.(png|jpe?g|webp)$/i, "");

    const image = await prisma.image.findUnique({
      where: {
        referenceId,
      },
    });

    if (!image) {
      return new Response("Image not found", {
        status: 404,
      });
    }

    const editedImage = await createEditedImage({
      imageBuffer: Buffer.from(image.data),
      referenceId: image.referenceId,
    });

    return new Response(editedImage, {
      status: 200,
      headers: {
        "Content-Type": image.mimeType,
        "Content-Disposition": "inline",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Public edited image failed:", error);

    return new Response("Failed to generate edited image", {
      status: 500,
    });
  }
}

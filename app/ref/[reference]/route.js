import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { reference } = await params;

    const referenceId = reference.split(".")[0];

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

    return new Response(image.data, {
      status: 200,
      headers: {
        "Content-Type": image.mimeType,
        "Content-Length": image.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image retrieval failed:", error);

    return new Response("Failed to retrieve image", {
      status: 500,
    });
  }
}
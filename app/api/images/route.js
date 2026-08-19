import { prisma } from "@/lib/db";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const images = await prisma.image.findMany({
      select: {
        id: true,
        studentName: true,
        referenceId: true,
        originalName: true,
        mimeType: true,
        size: true,
        createdAt: true,
        pngUrl: true,
  pdfUrl: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({
      images,
    });
  } catch (error) {
    console.error("Failed to fetch images:", error);

    return Response.json(
      {
        error: "Failed to fetch images.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();

    const referenceId = body.referenceId;

    if (!referenceId) {
      return Response.json(
        {
          error: "Reference ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const image = await prisma.image.findUnique({
      where: {
        referenceId,
      },
    });

    if (!image) {
      return Response.json(
        {
          error: "Image not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.image.delete({
      where: {
        referenceId,
      },
    });

    return Response.json({
      success: true,
      referenceId,
    });
  } catch (error) {
    console.error("Failed to delete image:", error);

    return Response.json(
      {
        error: "Failed to delete image.",
      },
      {
        status: 500,
      },
    );
  }
}

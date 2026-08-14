import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const images = await prisma.image.findMany();

    return Response.json({
      success: true,
      count: images.length,
      images,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: "Database connection failed",
      },
      { status: 500 },
    );
  }
}

import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { reference } = await params;

    const transcript = await prisma.transcript.findUnique({
      where: {
        referenceId: reference,
      },
      select: {
        photo: true,
        photoMimeType: true,
      },
    });

    if (!transcript || !transcript.photo) {
      return new Response("Student photo not found.", {
        status: 404,
      });
    }

    return new Response(transcript.photo, {
      status: 200,
      headers: {
        "Content-Type":
          transcript.photoMimeType || "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Student photo failed:", error);

    return new Response("Failed to load student photo.", {
      status: 500,
    });
  }
}
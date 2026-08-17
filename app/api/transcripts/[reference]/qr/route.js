import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { reference } = await params;

    const transcript = await prisma.transcript.findUnique({
      where: {
        referenceId: reference,
      },
      select: {
        referenceId: true,
      },
    });

    if (!transcript) {
      return new Response("Transcript not found.", {
        status: 404,
      });
    }

    const imageUrl = `/transcripts/${reference}/transcript.png`;

    return Response.redirect(
      new URL(imageUrl, request.url),
    );
  } catch (error) {
    console.error("Public transcript image failed:", error);

    return new Response("Failed to load transcript.", {
      status: 500,
    });
  }
}
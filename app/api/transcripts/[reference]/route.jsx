import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { reference } = await params;

    const transcript = await prisma.transcript.findUnique({
      where: {
        referenceId: reference,
      },
    });

    if (!transcript) {
      return Response.json(
        {
          error: "Transcript not found.",
        },
        {
          status: 404,
        },
      );
    }

    return Response.json({
      transcript: {
        id: transcript.id,
        referenceId: transcript.referenceId,
        studentName: transcript.studentName,
        studentId: transcript.studentId,
        age: transcript.age,
        gender: transcript.gender,
        stream: transcript.stream,
        photo: true,
        transcript: transcript.transcript,
        createdAt: transcript.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to load transcript:", error);

    return Response.json(
      {
        error: "Failed to load transcript.",
      },
      {
        status: 500,
      },
    );
  }
}
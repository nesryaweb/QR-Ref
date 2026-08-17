import { prisma } from "@/lib/db";

function generateReferenceId() {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}
export async function POST(request) {
  try {
    const formData = await request.formData();

    const transcriptValue = formData.get("transcript");
    const photo = formData.get("photo");

    if (!transcriptValue) {
      return Response.json(
        {
          error: "Transcript data is required.",
        },
        { status: 400 },
      );
    }

    if (!photo || typeof photo === "string") {
      return Response.json(
        {
          error: "Student photo is required.",
        },
        { status: 400 },
      );
    }

    let transcript;

    try {
      transcript = JSON.parse(transcriptValue);
    } catch (error) {
      console.error("Transcript JSON parsing failed:", error);

      return Response.json(
        {
          error: "Invalid transcript data.",
        },
        { status: 400 },
      );
    }

    console.log("RECEIVED TRANSCRIPT:", transcript);

    // Get the values from the parsed transcript object
    const {
      studentName,
      studentId,
      age,
      gender,
      stream,
      grades,
      completedGrade,
    } = transcript;

    // Validation
    if (!studentName?.trim()) {
      return Response.json(
        {
          error: "Student name is required.",
        },
        { status: 400 },
      );
    }

    if (!studentId?.trim()) {
      return Response.json(
        {
          error: "Student ID is required.",
        },
        { status: 400 },
      );
    }

    if (!grades?.length) {
      return Response.json(
        {
          error: "At least one grade is required.",
        },
        { status: 400 },
      );
    }

    // Convert uploaded photo to Buffer
    const photoBuffer = Buffer.from(await photo.arrayBuffer());

    // Generate unique reference ID
    let referenceId;

    while (!referenceId) {
      const candidate = generateReferenceId();

      const existing = await prisma.transcript.findUnique({
        where: {
          referenceId: candidate,
        },
      });

      if (!existing) {
        referenceId = candidate;
      }
    }

    // Save transcript
    const savedTranscript = await prisma.transcript.create({
      data: {
        referenceId,

        studentName,
        studentId,
        age,
        gender,
        stream,

        photo: photoBuffer,
        photoMimeType: photo.type,
        photoName: photo.name,
        photoSize: photo.size,

        transcript: {
          grades,
          completedGrade,
        },
      },
    });

    console.log("TRANSCRIPT SAVED:", savedTranscript.id);

    return Response.json(
      {
        transcript: {
          id: savedTranscript.id,
          referenceId: savedTranscript.referenceId,
          studentName: savedTranscript.studentName,
          studentId: savedTranscript.studentId,
          age: savedTranscript.age,
          gender: savedTranscript.gender,
          stream: savedTranscript.stream,
          createdAt: savedTranscript.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Transcript save failed:", error);

    return Response.json(
      {
        error: "Failed to save transcript.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const transcripts = await prisma.transcript.findMany({
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        referenceId: true,
        studentName: true,
        studentId: true,
        age: true,
        gender: true,
        stream: true,
        createdAt: true,
      },
    });

    return Response.json({
      transcripts,
    });
  } catch (error) {
    console.error("Failed to load transcripts:", error);

    return Response.json(
      {
        error: "Failed to load transcripts.",
      },
      {
        status: 500,
      },
    );
  }
}
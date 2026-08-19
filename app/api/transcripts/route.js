import { prisma } from "@/lib/db";

import { generateTranscriptFiles } from "@/lib/generateTranscriptFiles";
import { del } from "@vercel/blob";

function generateReferenceId() {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

export async function POST(request) {
  try {
    // =========================================
    // READ FORM DATA
    // =========================================

    const formData = await request.formData();

    const transcriptValue = formData.get("transcript");
    const photo = formData.get("photo");

    // =========================================
    // BASIC VALIDATION
    // =========================================

    if (!transcriptValue) {
      return Response.json(
        {
          error: "Transcript data is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!photo || typeof photo === "string") {
      return Response.json(
        {
          error: "Student photo is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================
    // PARSE TRANSCRIPT
    // =========================================

    let transcript;

    try {
      transcript = JSON.parse(transcriptValue);
    } catch (error) {
      console.error("Transcript JSON parsing failed:", error);

      return Response.json(
        {
          error: "Invalid transcript data.",
        },
        {
          status: 400,
        },
      );
    }

    console.log("RECEIVED TRANSCRIPT:", transcript);

    // =========================================
    // EXTRACT VALUES
    // =========================================

    const {
      studentName,
      studentId,
      age,
      gender,
      stream,
      grades,
      completedGrade,
    } = transcript;

    // =========================================
    // VALIDATION
    // =========================================

    if (!studentName?.trim()) {
      return Response.json(
        {
          error: "Student name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!studentId?.trim()) {
      return Response.json(
        {
          error: "Student ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!grades?.length) {
      return Response.json(
        {
          error: "At least one grade is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================
    // CONVERT PHOTO TO BUFFER
    // =========================================

    const photoBuffer = Buffer.from(await photo.arrayBuffer());

    // =========================================
    // GENERATE UNIQUE REFERENCE ID
    // =========================================

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

    // =========================================
    // SAVE TRANSCRIPT TO DATABASE
    // =========================================

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

    console.log("STARTING FILE GENERATION FOR:", savedTranscript.referenceId);

    // =========================================
    // GENERATE PNG + PDF
    // =========================================

    try {
      const generatedFiles = await generateTranscriptFiles(
        savedTranscript.referenceId,
      );

      console.log("TRANSCRIPT FILES GENERATED:", generatedFiles);

      await prisma.transcript.update({
        where: {
          referenceId: savedTranscript.referenceId,
        },
        data: {
          pngUrl: generatedFiles.pngUrl,
          pdfUrl: generatedFiles.pdfUrl,
        },
      });
    } catch (generationError) {
      console.error("========== FILE GENERATION ERROR ==========");
      console.error(generationError);
      console.error("===========================================");

      return Response.json(
        {
          error: "Transcript was saved, but file generation failed.",
          referenceId: savedTranscript.referenceId,
          details:
            generationError instanceof Error
              ? generationError.stack || generationError.message
              : String(generationError),
        },
        { status: 500 },
      );
    }

    // =========================================
    // SUCCESS
    // =========================================

    console.log("TRANSCRIPT FILES GENERATED:", savedTranscript.referenceId);

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

          pngUrl: generatedFiles.pngUrl,
          pdfUrl: generatedFiles.pdfUrl,
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
      {
        status: 500,
      },
    );
  }
}

// =========================================
// GET ALL TRANSCRIPTS
// =========================================

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
        pngUrl: true,
  pdfUrl: true,
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

// =========================================
// DELETE TRANSCRIPT
// =========================================

export async function DELETE(request) {
  try {
    const body = await request.json();

    const { referenceId } = body;

    // =========================================
    // VALIDATE REFERENCE ID
    // =========================================

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

    // =========================================
    // FIND TRANSCRIPT
    // =========================================

    const transcript = await prisma.transcript.findUnique({
      where: {
        referenceId,
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

    // =========================================
    // DELETE FROM DATABASE
    // =========================================

    await prisma.transcript.delete({
      where: {
        referenceId,
      },
    });

    // =========================================
    // DELETE GENERATED FILES
    //
    // This matches the directory used by
    // generateTranscriptFiles()
    //
    // public/
    //   transcripts/
    //     referenceId/
    //       transcript.png
    //       transcript.pdf
    // =========================================

    if (transcript.pngUrl) {
  await del(transcript.pngUrl);
}

if (transcript.pdfUrl) {
  await del(transcript.pdfUrl);
}

    console.log("TRANSCRIPT DELETED:", referenceId);

    // =========================================
    // SUCCESS
    // =========================================

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Transcript deletion failed:", error);

    return Response.json(
      {
        error: "Failed to delete transcript.",
      },
      {
        status: 500,
      },
    );
  }
}

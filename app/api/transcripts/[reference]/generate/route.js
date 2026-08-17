import { generateTranscriptFiles } from "@/lib/generateTranscriptFiles";

export async function GET(request, { params }) {
  try {
    const { reference } = await params;

    if (!reference) {
      return Response.json(
        {
          error: "Reference ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const files = await generateTranscriptFiles(reference);

    return Response.json({
      success: true,
      referenceId: reference,
      pngUrl: files.pngUrl,
      pdfUrl: files.pdfUrl,
    });
  } catch (error) {
    console.error("Transcript generation failed:", error);

    return Response.json(
      {
        error: "Failed to generate transcript files.",
      },
      {
        status: 500,
      },
    );
  }
}
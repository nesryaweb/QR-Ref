import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { reference } = await params;

    // =========================================
    // FIND TRANSCRIPT
    // =========================================

    const transcript = await prisma.transcript.findUnique({
      where: {
        referenceId: reference,
      },
      select: {
        pdfUrl: true,
        studentName: true,
      },
    });

    if (!transcript) {
      return new Response("Transcript not found.", {
        status: 404,
      });
    }

    if (!transcript.pdfUrl) {
      return new Response("Transcript PDF has not been generated yet.", {
        status: 404,
      });
    }

    // =========================================
    // FETCH PRIVATE BLOB SERVER-SIDE
    // =========================================

    const blobResponse = await fetch(transcript.pdfUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!blobResponse.ok) {
      console.error(
        "Failed to fetch transcript PDF Blob:",
        blobResponse.status,
        blobResponse.statusText,
      );

      return new Response("Failed to load transcript PDF.", {
        status: 502,
      });
    }

    // =========================================
    // GET PDF
    // =========================================

    const pdfBuffer = await blobResponse.arrayBuffer();

    // =========================================
    // SAFE FILE NAME
    // =========================================

    const safeName =
      (transcript.studentName || "transcript")
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "-") || "transcript";

    // =========================================
    // RETURN PDF
    // =========================================

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",

        "Content-Disposition": `attachment; filename="${safeName}-${reference}.pdf"`,

        "Content-Length": String(pdfBuffer.byteLength),

        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Transcript PDF API failed:", error);

    return new Response("Failed to load transcript PDF.", {
      status: 500,
    });
  }
}
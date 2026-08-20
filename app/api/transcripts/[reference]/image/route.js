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
        pngUrl: true,
      },
    });

    if (!transcript) {
      return new Response("Transcript not found.", {
        status: 404,
      });
    }

    if (!transcript.pngUrl) {
      return new Response("Transcript image has not been generated yet.", {
        status: 404,
      });
    }

    // =========================================
    // FETCH PRIVATE BLOB SERVER-SIDE
    // =========================================

    const blobResponse = await fetch(transcript.pngUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!blobResponse.ok) {
      console.error(
        "Failed to fetch transcript Blob:",
        blobResponse.status,
        blobResponse.statusText,
      );

      return new Response("Failed to load transcript image.", {
        status: 502,
      });
    }

    // =========================================
    // RETURN IMAGE
    // =========================================

    const imageBuffer = await blobResponse.arrayBuffer();

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          blobResponse.headers.get("content-type") || "image/png",

        "Content-Length": String(imageBuffer.byteLength),

        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Transcript image API failed:", error);

    return new Response("Failed to load transcript image.", {
      status: 500,
    });
  }
}
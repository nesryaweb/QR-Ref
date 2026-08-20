import { prisma } from "@/lib/db";

export const runtime = "nodejs";

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
        referenceId: true,
        pngUrl: true,
      },
    });

    if (!transcript) {
      return new Response("Transcript not found.", {
        status: 404,
      });
    }

    // =========================================
    // CHECK IMAGE URL
    // =========================================

    if (!transcript.pngUrl) {
      return new Response("Transcript image has not been generated yet.", {
        status: 404,
      });
    }

    // =========================================
    // FETCH PRIVATE VERCEL BLOB
    // =========================================

    const blobResponse = await fetch(transcript.pngUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!blobResponse.ok) {
      console.error("Failed to fetch transcript image from Vercel Blob:", {
        status: blobResponse.status,
        statusText: blobResponse.statusText,
        reference,
      });

      return new Response("Transcript image could not be loaded.", {
        status: 502,
      });
    }

    // =========================================
    // GET IMAGE
    // =========================================

    const imageBuffer = await blobResponse.arrayBuffer();

    // =========================================
    // RETURN IMAGE
    // =========================================

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": blobResponse.headers.get("content-type") || "image/png",

        "Content-Length": imageBuffer.byteLength.toString(),

        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Public transcript image failed:", error);

    return new Response("Failed to load transcript.", {
      status: 500,
    });
  }
}

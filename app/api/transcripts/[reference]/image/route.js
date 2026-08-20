import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { reference } = await params;

    // =========================================
    // VALIDATE REFERENCE
    // =========================================

    if (!reference || !/^\d{7}$/.test(reference)) {
      return new Response("Invalid transcript reference.", {
        status: 400,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

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
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // =========================================
    // CHECK IMAGE URL
    // =========================================

    if (!transcript.pngUrl) {
      return new Response("Transcript image has not been generated yet.", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
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
      console.error("Failed to fetch transcript Blob:", {
        reference,
        status: blobResponse.status,
        statusText: blobResponse.statusText,
      });

      return new Response("Failed to load transcript image.", {
        status: 502,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // =========================================
    // READ IMAGE
    // =========================================

    const imageBuffer = await blobResponse.arrayBuffer();

    // =========================================
    // RETURN IMAGE
    // =========================================

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          blobResponse.headers.get("content-type") || "image/png",

        "Content-Length": String(imageBuffer.byteLength),

        "Content-Disposition": "inline",

        "Cache-Control": "no-store, max-age=0",

        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Transcript image API failed:", error);

    return new Response("Failed to load transcript image.", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}
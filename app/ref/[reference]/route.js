import { prisma } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

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

    const imagePath = path.join(
      process.cwd(),
      "public",
      "transcripts",
      reference,
      "transcript.png",
    );

    const imageBuffer = await fs.readFile(imagePath);

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": imageBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Public transcript image failed:", error);

    return new Response("Transcript image not found.", {
      status: 404,
    });
  }
}
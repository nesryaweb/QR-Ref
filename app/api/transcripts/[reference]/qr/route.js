import QRCode from "qrcode";
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
      return new Response("Transcript not found", {
        status: 404,
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // QR points to the public transcript page.
    const transcriptUrl = `${baseUrl}/ref/${transcript.referenceId}`;

    const qrCode = await QRCode.toBuffer(transcriptUrl, {
      type: "png",
      width: 500,
      margin: 2,
      errorCorrectionLevel: "H",
    });

    return new Response(qrCode, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": qrCode.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Transcript QR generation failed:", error);

    return new Response("Failed to generate QR code", {
      status: 500,
    });
  }
}
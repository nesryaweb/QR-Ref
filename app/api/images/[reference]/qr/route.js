import QRCode from "qrcode";
import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { reference } = await params;

    const image = await prisma.image.findUnique({
      where: {
        referenceId: reference,
      },
    });

    if (!image) {
      return new Response("Image not found", {
        status: 404,
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const imageUrl = `${baseUrl}/ref/${image.referenceId}.${getExtension(
      image.mimeType
    )}`;

    const qrCode = await QRCode.toBuffer(imageUrl, {
      type: "png",
      width: 500,
      margin: 2,
      errorCorrectionLevel: "M",
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
    console.error("QR generation failed:", error);

    return new Response("Failed to generate QR code", {
      status: 500,
    });
  }
}

function getExtension(mimeType) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  return extensions[mimeType] || "jpg";
}
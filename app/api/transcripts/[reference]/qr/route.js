import QRCode from "qrcode";

export async function GET(request, { params }) {
  try {
    const { reference } = await params;

    if (!reference) {
      return new Response("Reference ID is required.", {
        status: 400,
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // This is what the QR code contains.
    const targetUrl = `${baseUrl}/ref/${reference}`;

    // Generate the actual QR image.
    const qrBuffer = await QRCode.toBuffer(targetUrl, {
      type: "png",
      width: 500,
      margin: 2,
      errorCorrectionLevel: "H",
    });

    return new Response(qrBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": qrBuffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("QR generation failed:", error);

    return new Response("Failed to generate QR code.", {
      status: 500,
    });
  }
}
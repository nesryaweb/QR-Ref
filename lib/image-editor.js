import sharp from "sharp";
import QRCode from "qrcode";

export async function createEditedImage({ imageBuffer, referenceId }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // QR points to the public reference page.
  const qrTarget = `${baseUrl}/ref/${referenceId}`;

  // Generate QR at high resolution first,
  // then resize it to the exact size needed on the image.
  const qrBuffer = await QRCode.toBuffer(qrTarget, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 2,
    width: 500,
  });

  const metadata = await sharp(imageBuffer).metadata();

  const width = metadata.width || 1000;

  // Match the reference image:
  // QR ≈ 96px on a 1075px-wide image.
  const qrSize = Math.round(width * 0.1);

  // Reference position:
  // left ≈ 57px on a 1075px-wide image.
  const left = Math.round(width * 0.053) - 6;

  // Reference position:
  // top ≈ 39px on a 1075px-wide image.
  // Moved 2px upward.
  const top = Math.round(width * 0.0363) - 6;

  const resizedQr = await sharp(qrBuffer)
    .resize(qrSize, qrSize)
    .png()
    .toBuffer();

  return sharp(imageBuffer)
    .composite([
      {
        input: resizedQr,
        left,
        top,
      },
    ])
    .png()
    .toBuffer();
}

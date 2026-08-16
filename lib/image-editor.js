import sharp from "sharp";
import QRCode from "qrcode";

export async function createEditedImage({
  imageBuffer,
  referenceId,
  studentName,
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // QR points to the public reference page.
  const qrTarget = `${baseUrl}/ref/${referenceId}`;

  // Generate QR at high resolution first.
  const qrBuffer = await QRCode.toBuffer(qrTarget, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 2,
    width: 500,
  });

  const metadata = await sharp(imageBuffer).metadata();

  const width = metadata.width || 1000;

  // Responsive QR size.
  const qrSize = Math.round(width * 0.1);

  // Current QR position.
  const left = Math.round(width * 0.053) - 6;
  const top = Math.round(width * 0.0363) - 6;

  const resizedQr = await sharp(qrBuffer)
    .resize(qrSize, qrSize)
    .png()
    .toBuffer();

  /*
   * STUDENT NAME
   */

  const name = String(studentName || "").trim();
  5;
  // Responsive font size.
  const fontSize = Math.max(12, Math.round(width * 0.0135));

  // Space between QR and name.
  const nameGap = -9;

  // Height needed for the text.
  const nameHeight = Math.round(fontSize * 1.5);

  const nameSvg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${qrSize}"
      height="${nameHeight}"
      viewBox="0 0 ${qrSize} ${nameHeight}"
    >
      <text
        x="${qrSize / 2.14}"
        y="${fontSize}"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}px"
        font-weight="600"
        fill="#000000"
      >${escapeXml(name)}</text>
    </svg>
  `;

  const nameBuffer = Buffer.from(nameSvg);

  // Place the name directly underneath the QR.
  const nameTop = top + qrSize + nameGap;

  return sharp(imageBuffer)
    .composite([
      // QR
      {
        input: resizedQr,
        left,
        top,
      },

      // Student name
      {
        input: nameBuffer,
        left,
        top: nameTop,
      },
    ])
    .png()
    .toBuffer();
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

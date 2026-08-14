import QRCode from "qrcode";

export async function generateQRCode(url) {
  return await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 500,
  });
}
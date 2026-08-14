import { generateQRCode } from "@/lib/qr";

export async function GET() {
  const qr = await generateQRCode(
    "http://localhost:3000/ref/2790406"
  );

  return Response.json({
    success: true,
    qr,
  });
}
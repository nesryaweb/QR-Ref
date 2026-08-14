import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function ImagePage({ params }) {
  const { reference } = await params;

  const image = await prisma.image.findUnique({
    where: {
      referenceId: reference,
    },
  });

  if (!image) {
    notFound();
  }

  const imageSrc = `data:${image.mimeType};base64,${Buffer.from(
    image.data,
  ).toString("base64")}`;

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <img
        src={imageSrc}
        alt={image.originalName}
        className="max-h-[95vh] max-w-full object-contain"
      />
    </main>
  );
}

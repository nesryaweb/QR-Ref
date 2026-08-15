import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function ImagePage({ params }) {
  const { reference } = await params;

  const referenceId = reference.replace(/\.(png|jpe?g|webp)$/i, "");

  console.log("Reference from URL:", reference);
  console.log("Reference ID for database:", referenceId);

  const image = await prisma.image.findUnique({
    where: {
      referenceId,
    },
  });

  console.log("Image found:", !!image);

  if (!image) {
    notFound();
  }

  const imageSrc = `data:${image.mimeType};base64,${Buffer.from(
    image.data,
  ).toString("base64")}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4">
      <img
        src={imageSrc}
        alt={image.originalName}
        className="max-h-[95vh] max-w-full object-contain"
      />
    </main>
  );
}
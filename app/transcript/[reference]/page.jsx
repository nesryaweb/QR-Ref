import fs from "fs/promises";
import path from "path";

import TranscriptDocument from "@/app/admin/components/TranscriptDocument";

export default async function TranscriptPage({ params }) {
  const { reference } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // =========================================
  // LOAD TRANSCRIPT
  // =========================================

  const response = await fetch(`${baseUrl}/api/transcripts/${reference}`, {
    cache: "no-store",
    headers: {
      "x-transcript-secret": process.env.TRANSCRIPT_INTERNAL_SECRET || "",
    },
  });

  if (!response.ok) {
    throw new Error("Transcript not found.");
  }

  const data = await response.json();

  const transcript = {
    ...data.transcript,
    grades: data.transcript.transcript?.grades || [],
    completedGrade: data.transcript.transcript?.completedGrade || "",
  };

  // =========================================
  // LOAD SCHOOL HEADER DIRECTLY ON SERVER
  // =========================================

  const schoolHeaderPath = path.join(
    process.cwd(),
    "public",
    "images",
    "school-header.png",
  );

  const schoolHeaderBuffer = await fs.readFile(schoolHeaderPath);

  const schoolHeaderUrl = `data:image/png;base64,${schoolHeaderBuffer.toString("base64")}`;

  // =========================================
  // QR
  // =========================================

  const qrUrl = `${baseUrl}/api/transcripts/${reference}/qr`;

  // =========================================
  // STUDENT PHOTO
  // =========================================

  const photoResponse = await fetch(
    `${baseUrl}/api/transcripts/${reference}/photo`,
    {
      cache: "no-store",
      headers: {
        "x-transcript-secret": process.env.TRANSCRIPT_INTERNAL_SECRET || "",
      },
    },
  );

  if (!photoResponse.ok) {
    throw new Error("Student photo could not be loaded.");
  }

  const photoBuffer = await photoResponse.arrayBuffer();

  const photoMimeType =
    photoResponse.headers.get("content-type") || "image/jpeg";

  const photoUrl = `data:${photoMimeType};base64,${Buffer.from(
    photoBuffer,
  ).toString("base64")}`;

  // =========================================
  // RENDER DOCUMENT
  // =========================================

  return (
    <div id="transcript-document">
      <TranscriptDocument
        transcript={{
          ...transcript,
          photoSrc: photoUrl,
        }}
        qrUrl={qrUrl}
        photoUrl={photoUrl}
        schoolHeaderUrl={schoolHeaderUrl}
      />
    </div>
  );
}

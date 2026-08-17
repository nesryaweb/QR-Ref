import { prisma } from "@/lib/db";
import TranscriptDocument from "../../admin/components/TranscriptDocument";

export default async function TranscriptPage({ params }) {
  const { reference } = await params;

  const transcript = await prisma.transcript.findUnique({
    where: {
      referenceId: reference,
    },
  });

  if (!transcript) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Transcript not found.</p>
      </main>
    );
  }

  const documentData = {
    studentName: transcript.studentName,
    studentId: transcript.studentId,
    age: transcript.age,
    gender: transcript.gender,
    stream: transcript.stream,
    grades: transcript.transcript?.grades || [],
    completedGrade: transcript.transcript?.completedGrade || "",
    referenceId: transcript.referenceId,

    // We will handle the saved photo separately.
    photo: `/api/transcripts/${transcript.referenceId}/photo`,
  };

  return (
    <main className="min-h-screen bg-white">
      <div id="transcript-document">
        <TranscriptDocument
          transcript={documentData}
          qrUrl={`/api/transcripts/${transcript.referenceId}/qr`}
        />
      </div>
    </main>
  );
}

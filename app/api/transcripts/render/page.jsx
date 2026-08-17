"use client";

import TranscriptDocument from "@/components/TranscriptDocument";

export default function TranscriptRenderPage() {
  return (
    <main className="min-h-screen bg-white">
      <TranscriptDocument
        transcript={window.__TRANSCRIPT__}
        qrUrl={null}
      />
    </main>
  );
}
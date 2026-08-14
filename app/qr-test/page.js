"use client";

import { useEffect, useState } from "react";

export default function QRTestPage() {
  const [qr, setQr] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadQR() {
      try {
        const response = await fetch("/api/qr/test");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to generate QR code");
        }

        setQr(data.qr);
      } catch (error) {
        setError(error.message);
      }
    }

    loadQR();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold">
          QR Code Test
        </h1>

        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}

        {qr && (
          <>
            <img
              src={qr}
              alt="QR Code"
              className="w-80 h-80"
            />

            <p className="text-sm text-gray-600">
              Scan this QR code with your phone.
            </p>
          </>
        )}

        {!qr && !error && (
          <p>
            Generating QR code...
          </p>
        )}
      </div>
    </main>
  );
}
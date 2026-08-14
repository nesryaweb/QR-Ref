"use client";

import { useState } from "react";

export default function AdminPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleUpload(event) {
    event.preventDefault();

    if (!file) {
      setError("Please select an image.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setResult(data.image);
      setFile(null);

      event.target.reset();
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold">
            QR Ref
          </h1>

          <p className="mt-2 text-gray-600">
            Upload an image and generate its QR code.
          </p>
        </header>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <form
            onSubmit={handleUpload}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="image"
                className="mb-2 block text-sm font-medium"
              >
                Image
              </label>

              <input
                id="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                }}
                className="block w-full rounded-md border p-3"
              />
            </div>

            {file && (
              <div className="rounded-md bg-gray-100 p-4 text-sm">
                <p>
                  <strong>File:</strong> {file.name}
                </p>

                <p>
                  <strong>Size:</strong>{" "}
                  {(file.size / 1024).toFixed(1)} KB
                </p>

                <p>
                  <strong>Type:</strong> {file.type}
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full rounded-md bg-black px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload Image"}
            </button>
          </form>
        </section>

        {result && (
          <ResultCard image={result} />
        )}
      </div>
    </main>
  );
}

function ResultCard({ image }) {
  const qrUrl = `/api/images/${image.referenceId}/qr`;
  const imageUrl = `/ref/${image.referenceId}.${getExtension(
    image.mimeType
  )}`;

  return (
    <section className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold">
          Image uploaded successfully
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Your image is ready.
        </p>
      </div>

      <div className="flex justify-center rounded-lg bg-gray-100 p-6">
        <img
          src={qrUrl}
          alt={`QR code for ${image.referenceId}`}
          className="h-64 w-64"
        />
      </div>

      <div className="space-y-2 text-sm">
        <p>
          <strong>Reference ID:</strong>{" "}
          {image.referenceId}
        </p>

        <p>
          <strong>Original file:</strong>{" "}
          {image.originalName}
        </p>

        <p>
          <strong>Size:</strong>{" "}
          {(image.size / 1024).toFixed(1)} KB
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-md border px-4 py-3 text-center font-medium"
        >
          View Image
        </a>

        <a
          href={qrUrl}
          download={`qr-${image.referenceId}.png`}
          className="flex-1 rounded-md bg-black px-4 py-3 text-center font-medium text-white"
        >
          Download QR
        </a>
      </div>
    </section>
  );
}

function getExtension(mimeType) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  return extensions[mimeType] || "jpg";
}
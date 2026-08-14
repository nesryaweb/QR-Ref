"use client";

import { useEffect, useState } from "react";

export default function TestUploadPage() {
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  async function handleUpload() {
    if (!file) {
      setResult({
        success: false,
        message: "Please select an image first.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);

      setResult({
        success: false,
        message: "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Image Upload Test</h1>

          <p className="mt-2 text-gray-600">
            Temporary page for testing image uploads.
          </p>
        </div>

        <div className="space-y-4 rounded-lg border p-6">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
            }}
          />

          {file && (
            <p className="text-sm">
              Selected: <strong>{file.name}</strong>
            </p>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || loading}
            className="rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Image"}
          </button>
        </div>

        {result && (
          <pre className="overflow-auto rounded-lg bg-gray-100 p-4 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}

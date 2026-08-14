"use client";

import { useEffect, useState } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
export default  function AdminDashboard() {
    
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    try {
      setLoadingImages(true);

      const response = await fetch("/api/images");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load images.");
      }

      setImages(data.images);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoadingImages(false);
    }
  }

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

      await loadImages();
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(referenceId) {
    const confirmed = window.confirm(
      `Are you sure you want to delete image ${referenceId}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch("/api/images", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referenceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed.");
      }

      if (result?.referenceId === referenceId) {
        setResult(null);
      }

      await loadImages();
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <header>
          <h1 className="text-3xl font-bold">QR Ref</h1>

          <p className="mt-2 text-gray-600">
            Manage your image references and QR codes.
          </p>
        </header>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Upload Image</h2>

          <form onSubmit={handleUpload} className="mt-6 space-y-6">
            <div>
              <label htmlFor="image" className="mb-2 block text-sm font-medium">
                Image
              </label>

              <input
                id="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                }}
                className="block w-full rounded-md border p-3 text-sm cursor-pointer text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
              />
            </div>

            {file && (
              <div className="rounded-md bg-gray-100 p-4 text-sm">
                <p>
                  <strong>File:</strong> {file.name}
                </p>

                <p>
                  <strong>Size:</strong> {(file.size / 1024).toFixed(1)} KB
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

        {result && <ResultCard image={result} />}

        <ImageList
          images={images}
          loading={loadingImages}
          onDelete={handleDelete}
        />
      </div>
    </main>
  );
}

function ResultCard({ image }) {
  const qrUrl = `/api/images/${image.referenceId}/qr`;

  const imageUrl = `/ref/${image.referenceId}.${getExtension(image.mimeType)}`;

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Image uploaded successfully</h2>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium">QR Code</p>

          <div className="flex justify-center rounded-lg bg-gray-100 p-6">
            <img
              src={qrUrl}
              alt={`QR code for ${image.referenceId}`}
              className="h-64 w-64"
            />
          </div>
        </div>

        <div className="space-y-4">
          <p>
            <strong>Reference ID:</strong> {image.referenceId}
          </p>

          <p>
            <strong>File:</strong> {image.originalName}
          </p>

          <p>
            <strong>Size:</strong> {(image.size / 1024).toFixed(1)} KB
          </p>

          <div className="flex flex-col gap-3">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border px-4 py-3 text-center font-medium"
            >
              View Image
            </a>

            <a
              href={qrUrl}
              download={`qr-${image.referenceId}.png`}
              className="rounded-md bg-black px-4 py-3 text-center font-medium text-white"
            >
              Download QR
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImageList({ images, loading, onDelete }) {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Uploaded Images</h2>

          <p className="mt-1 text-sm text-gray-500">
            {images.length} image{images.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-gray-500">Loading images...</p>
      ) : images.length === 0 ? (
        <p className="mt-6 text-gray-500">No images uploaded yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {images.map((image) => (
            <ImageRow key={image.id} image={image} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}

function ImageRow({ image, onDelete }) {
  const imageUrl = `/ref/${image.referenceId}.${getExtension(image.mimeType)}`;

  const qrUrl = `/api/images/${image.referenceId}/qr`;

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center">
      <img
        src={imageUrl}
        alt={image.originalName}
        className="h-24 w-24 rounded-md object-cover"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{image.originalName}</p>

        <p className="mt-1 text-sm text-gray-500">
          Reference: {image.referenceId}
        </p>

        <p className="text-sm text-gray-500">
          {(image.size / 1024).toFixed(1)} KB
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border px-3 py-2 text-sm"
        >
          View
        </a>

        <a
          href={qrUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border px-3 py-2 text-sm"
        >
          QR
        </a>

        <button
          type="button"
          onClick={() => onDelete(image.referenceId)}
          className="rounded-md bg-red-600 px-3 py-2 text-sm text-white"
        >
          Delete
        </button>
      </div>
    </div>
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

"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import TranscriptDocument from "./components/TranscriptDocument"; 
import {
  createEmptyTranscript,
  createEmptyGrade,
  createEmptySubject,
} from "@/lib/transcript";
import TranscriptPreview from "./components/TranscriptPreview";
import GradeEditor from "./components/GradeEditor";
export default function AdminPage() {
  const [transcript, setTranscript] = useState(createEmptyTranscript());
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);

  const [loadingMessage, setLoadingMessage] = useState("");
  useEffect(() => {
    loadImages();
  }, []);
  function updateTranscript(field, value) {
    setTranscript((current) => ({
      ...current,
      [field]: value,
    }));
  }
  function addGrade() {
    setTranscript((current) => ({
      ...current,
      grades: [...current.grades, createEmptyGrade()],
    }));
  }
  function updateGrade(gradeIndex, field, value) {
    setTranscript((current) => ({
      ...current,

      grades: current.grades.map((grade, index) =>
        index === gradeIndex
          ? {
              ...grade,
              [field]: value,
            }
          : grade,
      ),
    }));
  }
  function addSubject(gradeIndex) {
    setTranscript((current) => ({
      ...current,

      grades: current.grades.map((grade, index) =>
        index === gradeIndex
          ? {
              ...grade,
              subjects: [...grade.subjects, createEmptySubject()],
            }
          : grade,
      ),
    }));
  }
  function updateSubject(gradeIndex, subjectIndex, field, value) {
    setTranscript((current) => ({
      ...current,

      grades: current.grades.map((grade, gIndex) =>
        gIndex === gradeIndex
          ? {
              ...grade,

              subjects: grade.subjects.map((subject, sIndex) =>
                sIndex === subjectIndex
                  ? {
                      ...subject,
                      [field]: value,
                    }
                  : subject,
              ),
            }
          : grade,
      ),
    }));
  }
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

    if (!studentName.trim()) {
      setError("Please enter the student's name.");
      return;
    }

    if (!file) {
      setError("Please select a file.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const isDocx =
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx");

    if (isDocx) {
      setLoadingMessage("Changing Word document to image...");
    } else {
      setLoadingMessage("Uploading image...");
    }

    try {
      const formData = new FormData();

      formData.append("studentName", studentName.trim());
      formData.append("file", file);

      const response = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setStudentName("");
      setResult(data.image);
      setFile(null);

      event.target.reset();

      await loadImages();
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
      setLoadingMessage("");
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
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">QR Ref</h1>

            <p className="mt-2 text-gray-600">
              Manage your image references and QR codes.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              signOut({
                callbackUrl: "/admin/login",
              })
            }
            className="rounded-md border cursor-pointer px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Sign out
          </button>
        </header>
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Create Student Transcript</h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the student's information and upload their photo.
          </p>

          <div className="mt-6 space-y-6">
            {/* Student Name */}
            <div>
              <label
                htmlFor="studentName"
                className="mb-2 block text-sm font-medium"
              >
                Name of the student
              </label>

              <input
                id="studentName"
                type="text"
                value={transcript.studentName}
                onChange={(event) =>
                  updateTranscript("studentName", event.target.value)
                }
                placeholder="Enter student's full name"
                className="w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Age / Gender / Stream */}
            <div className="grid gap-5 md:grid-cols-3">
              {/* Age */}
              <div>
                <label htmlFor="age" className="mb-2 block text-sm font-medium">
                  Age
                </label>

                <input
                  id="age"
                  type="number"
                  min="0"
                  value={transcript.age}
                  onChange={(event) =>
                    updateTranscript("age", event.target.value)
                  }
                  placeholder="Age"
                  className="w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="mb-2 block text-sm font-medium"
                >
                  Gender
                </label>

                <select
                  id="gender"
                  value={transcript.gender}
                  onChange={(event) =>
                    updateTranscript("gender", event.target.value)
                  }
                  className="w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Stream */}
              <div>
                <label
                  htmlFor="stream"
                  className="mb-2 block text-sm font-medium"
                >
                  Stream
                </label>

                <input
                  id="stream"
                  type="text"
                  value={transcript.stream}
                  onChange={(event) =>
                    updateTranscript("stream", event.target.value)
                  }
                  placeholder="e.g. Natural Science"
                  className="w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Student Photo */}
            <div>
              <label
                htmlFor="studentPhoto"
                className="mb-2 block text-sm font-medium"
              >
                Student Photo
              </label>

              <input
                id="studentPhoto"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const selectedPhoto = event.target.files?.[0] || null;
                  setPhoto(selectedPhoto);
                  updateTranscript("photo", selectedPhoto);
                }}
                className="block w-full rounded-md border p-3 file:mr-4 file:rounded-md file:border-0 file:bg-gray-200 file:px-4 file:py-2 file:text-sm file:font-medium cursor-pointer hover:file:bg-gray-300"
              />

              {photo && (
                <div className="mt-4 flex items-center gap-4 rounded-md bg-gray-100 p-4">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt="Student preview"
                    className="h-24 w-20 rounded object-cover"
                  />

                  <div className="text-sm">
                    <p className="font-medium">{photo.name}</p>

                    <p className="text-gray-500">
                      {(photo.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              )}
            </div>
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Academic Records</h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Add the student's grades and academic results.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addGrade}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-stone-900"
                >
                  + Add Grade
                </button>
              </div>

              {transcript.grades.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-white p-8 text-center">
                  <p className="text-gray-500">No grades added yet.</p>

                  <button
                    type="button"
                    onClick={addGrade}
                    className="mt-4 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-100"
                  >
                    + Add First Grade
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {transcript.grades.map((grade, gradeIndex) => (
                    <GradeEditor
                      key={gradeIndex}
                      grade={grade}
                      gradeIndex={gradeIndex}
                      onUpdateGrade={updateGrade}
                      onAddSubject={addSubject}
                      onUpdateSubject={updateSubject}
                    />
                  ))}
                </div>
              )}
            </section>
            {/* Additional Transcript Information */}
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">
                  Additional Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the student's conduct, attendance, and completed grade.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-4">
                {/* Conduct / Work Ethics */}
                <div>
                  <label
                    htmlFor="conduct"
                    className="mb-2 block text-sm font-medium"
                  >
                    Conduct / Work Ethics
                  </label>

                  <input
                    id="conduct"
                    type="text"
                    value={transcript.conduct}
                    onChange={(event) =>
                      updateTranscript("conduct", event.target.value)
                    }
                    placeholder="e.g. Excellent"
                    className="w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {/* Absence */}
                <div>
                  <label
                    htmlFor="absence"
                    className="mb-2 block text-sm font-medium"
                  >
                    Absence
                  </label>

                  <input
                    id="absence"
                    type="number"
                    min="0"
                    value={transcript.absence}
                    onChange={(event) =>
                      updateTranscript("absence", event.target.value)
                    }
                    placeholder="Number of absences"
                    className="w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {/* Completed Grade */}
                <div>
                  <label
                    htmlFor="completedGrade"
                    className="mb-2 block text-sm font-medium"
                  >
                    Completed Grade
                  </label>

                  <input
                    id="completedGrade"
                    type="text"
                    value={transcript.completedGrade}
                    onChange={(event) =>
                      updateTranscript("completedGrade", event.target.value)
                    }
                    placeholder="e.g. Grade 12"
                    className="w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                {/* Rank */}
                <div>
                  <label
                    htmlFor="rank"
                    className="mb-2 block text-sm font-medium"
                  >
                    Rank
                  </label>

                  <input
                    id="rank"
                    type="number"
                    min="1"
                    value={transcript.rank}
                    onChange={(event) =>
                      updateTranscript("rank", event.target.value)
                    }
                    placeholder="e.g. 3"
                    className="w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </section>
          </div>
        </section>
        <TranscriptPreview transcript={transcript} />
        <TranscriptDocument
  transcript={transcript}
  qrUrl={null}
/>

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
      <div className="flex items-center justify-between w-full">
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
  const imagePageUrl = `/ref/${image.referenceId}.${getExtension(image.mimeType)}`;

  const imageFileUrl = `/api/images/${image.referenceId}.${getExtension(
    image.mimeType,
  )}`;
  const qrUrl = `/api/images/${image.referenceId}/qr`;
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center">
      <img
        src={imageFileUrl}
        alt={image.studentName || image.originalName}
        className="h-24 w-24 rounded-md object-cover"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          <strong>Student:</strong> {image.studentName || image.originalName}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Reference: {image.referenceId}
        </p>

        <p className="text-sm text-gray-500">
          {(image.size / 1024).toFixed(1)} KB
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={imagePageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border hover:bg-gray-100 px-3 py-2 text-sm"
        >
          View
        </a>

        <a
          href={qrUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border px-3  hover:bg-gray-100 py-2 text-sm"
        >
          QR
        </a>

        <button
          type="button"
          onClick={() => onDelete(image.referenceId)}
          className="rounded-md bg-red-600 hover:bg-red-500 px-3 py-2 text-sm cursor-pointer text-white"
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

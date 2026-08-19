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
  const [fieldErrors, setFieldErrors] = useState({});

  const [transcripts, setTranscripts] = useState([]);
  const [loadingTranscripts, setLoadingTranscripts] = useState(true);
  useEffect(() => {
    loadTranscripts();
  }, []);
  async function loadTranscripts() {
    try {
      setLoadingTranscripts(true);

      const response = await fetch("/api/transcripts");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load transcripts.");
      }

      setTranscripts(data.transcripts);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoadingTranscripts(false);
    }
  }
  const [loadingMessage, setLoadingMessage] = useState("");

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

  function validateTranscript() {
    const errors = {};

    // =========================
    // STUDENT INFORMATION
    // =========================

    if (!transcript.studentName?.trim()) {
      errors.studentName = "Student name is required.";
    }

    if (!transcript.studentId?.trim()) {
      errors.studentId = "Student ID is required.";
    }

    if (!transcript.age?.toString().trim()) {
      errors.age = "Age is required.";
    } else if (Number(transcript.age) <= 0) {
      errors.age = "Age must be greater than 0.";
    }

    if (!transcript.gender?.trim()) {
      errors.gender = "Please select the student's gender.";
    }

    if (!transcript.stream?.trim()) {
      errors.stream = "Stream is required.";
    }

    if (!photo) {
      errors.photo = "Student photo is required.";
    }

    // =========================
    // GRADES
    // =========================

    if (!transcript.grades?.length) {
      errors.grades = "Please add at least one grade.";
    } else {
      transcript.grades.forEach((grade, gradeIndex) => {
        const gradeErrors = {};

        if (!grade.gradeName?.trim()) {
          gradeErrors.gradeName = "Grade is required.";
        }

        if (!grade.academicYear?.trim()) {
          gradeErrors.academicYear = "Academic year is required.";
        }

        if (!grade.conduct?.trim()) {
          gradeErrors.conduct = "Conduct / Work Ethic is required.";
        }

        if (
          grade.absence === undefined ||
          grade.absence === null ||
          grade.absence === ""
        ) {
          gradeErrors.absence = "Absences are required.";
        }

        if (!grade.firstSemesterRank?.trim()) {
          gradeErrors.firstSemesterRank = "1st semester rank is required.";
        }

        if (!grade.secondSemesterRank?.trim()) {
          gradeErrors.secondSemesterRank = "2nd semester rank is required.";
        }

        // =========================
        // SUBJECTS
        // =========================

        if (!grade.subjects?.length) {
          gradeErrors.subjects = "Please add at least one subject.";
        } else {
          const subjectErrors = {};

          grade.subjects.forEach((subject, subjectIndex) => {
            const currentSubjectErrors = {};

            if (!subject.name?.trim()) {
              currentSubjectErrors.name = "Subject name is required.";
            }

            if (
              subject.firstSemester === undefined ||
              subject.firstSemester === null ||
              subject.firstSemester === ""
            ) {
              currentSubjectErrors.firstSemester =
                "1st semester mark is required.";
            }

            if (
              subject.secondSemester === undefined ||
              subject.secondSemester === null ||
              subject.secondSemester === ""
            ) {
              currentSubjectErrors.secondSemester =
                "2nd semester mark is required.";
            }

            if (Object.keys(currentSubjectErrors).length > 0) {
              subjectErrors[subjectIndex] = currentSubjectErrors;
            }
          });

          if (Object.keys(subjectErrors).length > 0) {
            gradeErrors.subjects = subjectErrors;
          }
        }

        if (Object.keys(gradeErrors).length > 0) {
          errors.grades = errors.grades || {};
          errors.grades[gradeIndex] = gradeErrors;
        }
      });
    }

    return errors;
  }

  async function compressPhoto(file) {
    const maxWidth = 1200;
    const maxHeight = 1200;
    const quality = 0.8;

    const image = new Image();

    const imageUrl = URL.createObjectURL(file);

    try {
      image.src = imageUrl;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      let width = image.width;
      let height = image.height;

      // Resize while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);

        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      context.drawImage(image, 0, 0, width, height);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", quality);
      });

      if (!blob) {
        throw new Error("Failed to compress photo.");
      }

      return new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
        type: "image/jpeg",
      });
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  async function handleSaveTranscript(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);
    setFieldErrors({});
    setLoadingMessage("Saving transcript...");

    try {
      const validationErrors = validateTranscript();

      setFieldErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        setLoading(false);
        setLoadingMessage("");
        return;
      }

      setLoadingMessage("Preparing student photo...");

      const compressedPhoto = await compressPhoto(photo);

      console.log("Original photo:", {
        name: photo.name,
        size: photo.size,
      });

      console.log("Compressed photo:", {
        name: compressedPhoto.name,
        size: compressedPhoto.size,
      });

      const formData = new FormData();

      formData.append(
        "transcript",
        JSON.stringify({
          ...transcript,
          photo: undefined,
          photoSrc: undefined,
        }),
      );

      formData.append("photo", compressedPhoto);

      setLoadingMessage("Saving transcript...");

      const response = await fetch("/api/transcripts", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();

      let data = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        throw new Error(
          `${data.error || `Failed to save transcript (${response.status}).`}${
            data.details ? `\n\n${data.details}` : ""
          }`,
        );
      }

      console.log("SAVED TRANSCRIPT:", data.transcript);

      setResult(data.transcript);

      setTranscript(createEmptyTranscript());
      setPhoto(null);
      setFieldErrors({});

      await loadTranscripts();
    } catch (error) {
      console.error("Transcript submission failed:", error);

      setError(
        error instanceof Error ? error.message : "Failed to save transcript.",
      );
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  async function handleDelete(referenceId) {
    const confirmed = window.confirm(
      `Are you sure you want to delete transcript ${referenceId}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch("/api/transcripts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referenceId,
        }),
      });

      const text = await response.text();

      let data = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        throw new Error(data.error || `Delete failed (${response.status}).`);
      }

      if (result?.referenceId === referenceId) {
        setResult(null);
      }

      await loadTranscripts();
    } catch (error) {
      console.error("Transcript deletion failed:", error);

      setError(error instanceof Error ? error.message : "Delete failed.");
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
                className={`w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black ${
                  fieldErrors.studentName ? "border-red-500" : ""
                }`}
              />

              {fieldErrors.studentName && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.studentName}
                </p>
              )}
            </div>
            {/* Student ID */}
            <div>
              <label
                htmlFor="studentId"
                className="mb-2 block text-sm font-medium"
              >
                Student ID
              </label>

              <input
                id="studentId"
                type="text"
                value={transcript.studentId}
                onChange={(event) =>
                  updateTranscript("studentId", event.target.value)
                }
                placeholder="e.g. 1121564"
                className={`w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black ${
                  fieldErrors.studentId ? "border-red-500" : ""
                }`}
              />

              {fieldErrors.studentId && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.studentId}
                </p>
              )}
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
                  className={`w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black ${
                    fieldErrors.age ? "border-red-500" : ""
                  }`}
                />

                {fieldErrors.age && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.age}</p>
                )}
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
                  className={`w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black ${
                    fieldErrors.gender ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                {fieldErrors.gender && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.gender}
                  </p>
                )}
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
                  className={`w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black ${
                    fieldErrors.stream ? "border-red-500" : ""
                  }`}
                />

                {fieldErrors.stream && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.stream}
                  </p>
                )}
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

                  if (!selectedPhoto) {
                    setPhoto(null);
                    updateTranscript("photo", null);
                    updateTranscript("photoSrc", null);
                    return;
                  }

                  setPhoto(selectedPhoto);

                  updateTranscript("photo", selectedPhoto);

                  updateTranscript(
                    "photoSrc",
                    URL.createObjectURL(selectedPhoto),
                  );
                }}
                className="block w-full rounded-md border p-3 file:mr-4 file:rounded-md file:border-0 file:bg-gray-200 file:px-4 file:py-2 file:text-sm file:font-medium cursor-pointer hover:file:bg-gray-300"
              />
              {fieldErrors.photo && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.photo}</p>
              )}
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
                  className="rounded-md cursor-pointer bg-black px-4 py-2 text-sm font-medium text-white hover:bg-stone-900"
                >
                  + Add Grade
                </button>
              </div>
              {typeof fieldErrors.grades === "string" && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {fieldErrors.grades}
                </p>
              )}

              {transcript.grades.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-white p-8 text-center">
                  <p className="text-gray-500">No grades added yet.</p>

                  <button
                    type="button"
                    onClick={addGrade}
                    className="mt-4 cursor-pointer rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-100"
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
                      errors={fieldErrors.grades?.[gradeIndex] || {}}
                      gradeIndex={gradeIndex}
                      onUpdateGrade={updateGrade}
                      onAddSubject={addSubject}
                      onUpdateSubject={updateSubject}
                    />
                  ))}
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveTranscript}
                  disabled={loading}
                  className="rounded-md bg-black cursor-pointer px-6 py-3 font-medium text-white hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Saving Transcript..." : "Save Transcript"}
                </button>
              </div>
            </section>
          </div>
        </section>
        <TranscriptPreview transcript={transcript} />

        <TranscriptList
          transcripts={transcripts}
          loading={loadingTranscripts}
          onDelete={handleDelete}
        />
      </div>
    </main>
  );
}

function TranscriptList({ transcripts, loading, onDelete }) {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Created Transcripts</h2>

          <p className="mt-1 text-sm text-gray-500">
            {transcripts.length} transcript
            {transcripts.length === 1 ? "" : "s"} created
          </p>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-gray-500">Loading transcripts...</p>
      ) : transcripts.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed p-8 text-center">
          <p className="text-gray-500">No transcripts have been created yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {transcripts.map((transcript) => (
            <TranscriptRow
              key={transcript.id}
              transcript={transcript}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TranscriptRow({ transcript, onDelete }) {
  const transcriptImageUrl = `/ref/${transcript.referenceId}`;

  const qrUrl = `/api/transcripts/${transcript.referenceId}/qr`;

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 md:flex-row md:items-center">
      {/* STUDENT PHOTO */}
      <div className="shrink-0">
        <img
          src={`/api/transcripts/${transcript.referenceId}/photo`}
          alt={transcript.studentName || "Student"}
          className="h-28 w-24 rounded object-cover"
        />
      </div>

      {/* INFORMATION */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{transcript.studentName}</p>

        <p className="mt-1 text-sm text-gray-500">
          Reference: {transcript.referenceId}
        </p>

        <p className="text-sm text-gray-500">
          Student ID: {transcript.studentId || "—"}
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-2">
        <a
          href={transcript.pngUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md cursor-pointer border px-3 py-2 text-sm hover:bg-gray-100"
        >
          View
        </a>

        <a
           href={transcript.pdfUrl}
  download
          className="rounded-md cursor-pointer border px-3 py-2 text-sm hover:bg-gray-100"
        >
          Download PDF
        </a>

        <a
          href={qrUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md cursor-pointer border px-3 py-2 text-sm hover:bg-gray-100"
        >
          QR Code
        </a>

        <button
          type="button"
          onClick={() => onDelete(transcript.referenceId)}
          className="rounded-md cursor-pointer bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-500"
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

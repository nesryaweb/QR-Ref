"use client";

import { calculateAverage, calculateGradeTotals } from "@/lib/transcript";
import { Fragment } from "react/jsx-runtime";

export default function TranscriptPreview({ transcript }) {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Transcript Preview</h2>

        <p className="mt-1 text-sm text-gray-500">
          This is a preview of the transcript that will be generated.
        </p>
      </div>

      <div >
        <div className="min-w-full border bg-white">
          {/* =========================================
              TOP SECTION
          ========================================= */}

          <div className="grid grid-cols-[140px_1fr_180px] border-b">
            {/* QR */}
            <div className="flex h-40 items-center justify-center border-r">
              <div className="flex h-24 w-24 items-center justify-center border-2 border-dashed text-sm text-gray-500">
                QR
              </div>
            </div>

            {/* HEADER */}
            <div className="flex h-40 items-center justify-center border-r text-center">
              <div>
                <p className="text-lg font-bold">SCHOOL HEADER</p>

                <p className="mt-2 text-sm text-gray-500">
                  School branding will be placed here
                </p>
              </div>
            </div>

            {/* STUDENT PHOTO */}
            <div className="flex h-40 items-center justify-center">
              {transcript.photo ? (
                <img
                  src={URL.createObjectURL(transcript.photo)}
                  alt={transcript.studentName || "Student"}
                  className="h-32 w-28 object-cover"
                />
              ) : (
                <div className="flex h-32 w-28 items-center justify-center border-2 border-dashed text-sm text-gray-500">
                  Student Photo
                </div>
              )}
            </div>
          </div>

          {/* =========================================
              STUDENT INFORMATION
          ========================================= */}

          <div className="grid grid-cols-4 border-b">
            <InfoField label="Name" value={transcript.studentName} />

            <InfoField label="Age" value={transcript.age} />

            <InfoField label="Gender" value={transcript.gender} />

            <InfoField label="Stream" value={transcript.stream} />
          </div>

          {/* =========================================
              TRANSCRIPT TABLE
          ========================================= */}

          <TranscriptTable transcript={transcript} />

          {/* =========================================
              ADDITIONAL INFORMATION
          ========================================= */}

          <div className="border-t">
            <div className="grid grid-cols-4">
              <InfoField label="Rank" value={transcript.rank} />

              <InfoField
                label="Conduct / Work Ethics"
                value={transcript.conduct}
              />

              <InfoField label="Absence" value={transcript.absence} />

              <InfoField
                label="Completed Grade"
                value={transcript.completedGrade}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   TRANSCRIPT TABLE
===================================================== */

function TranscriptTable({ transcript }) {
  const grades = transcript.grades || [];

  /*
   * Collect every subject name from every grade.
   *
   * Example:
   *
   * Grade 9:
   * English
   * Math
   *
   * Grade 10:
   * English
   * Biology
   *
   * Result:
   * English
   * Math
   * Biology
   */
  const subjectNames = [];

  grades.forEach((grade) => {
    (grade.subjects || []).forEach((subject) => {
      const name = subject.name?.trim();

      if (name && !subjectNames.includes(name)) {
        subjectNames.push(name);
      }
    });
  });

  if (grades.length === 0) {
    return (
      <div className="border-b p-8 text-center text-gray-500">
        No academic records added yet.
      </div>
    );
  }

  return (
    <div className="border-b">
      <table className="w-full border-collapse">
        {/* =========================================
            TABLE HEADER
        ========================================= */}

        <thead>
          {/* Grade names */}
          <tr className="bg-gray-50">
            <th rowSpan="2" className="border p-2 text-left">
              Subject
            </th>

            {grades.map((grade, index) => (
              <th key={index} colSpan="2" className="border p-2 text-center">
                <div className="font-semibold">
                  {grade.gradeName || "Grade"}
                </div>

                {grade.academicYear && (
                  <div className="text-xs font-normal text-gray-500">
                    {grade.academicYear}
                  </div>
                )}
              </th>
            ))}
          </tr>

          {/* Semester names */}
          <tr className="bg-gray-50">
            {grades.map((grade, index) => (
              <Fragment key={index}>
                <th className="border p-2 text-center text-xs">1st Sem</th>

                <th className="border p-2 text-center text-xs">2nd Sem</th>
              </Fragment>
            ))}
          </tr>
        </thead>

        {/* =========================================
            SUBJECT ROWS
        ========================================= */}

        <tbody>
          {subjectNames.map((subjectName) => (
            <tr key={subjectName}>
              {/* Subject name */}
              <td className="border p-2 font-medium">{subjectName}</td>

              {/* Grades */}
              {grades.map((grade, gradeIndex) => {
                const subject = grade.subjects?.find(
                  (item) => item.name?.trim() === subjectName,
                );

                return (
                  <Fragment key={gradeIndex}>
                    {/* 1st semester */}
                    <td className="border p-2 text-center">
                      {subject?.firstSemester || "-"}
                    </td>

                    {/* 2nd semester */}
                    <td className="border p-2 text-center">
                      {subject?.secondSemester || "-"}
                    </td>
                  </Fragment>
                );
              })}
            </tr>
          ))}

          {/* =========================================
              TOTAL
          ========================================= */}

          <tr className="border-t-2 border-black">
            <td className="border p-2 font-semibold">Total</td>

            {grades.map((grade, gradeIndex) => {
              const totals = calculateGradeTotals(grade);

              return (
                <Fragment key={gradeIndex}>
                  <td className="border p-2 text-center font-semibold">
                    {totals.firstSemesterTotal || "-"}
                  </td>

                  <td className="border p-2 text-center font-semibold">
                    {totals.secondSemesterTotal || "-"}
                  </td>
                </Fragment>
              );
            })}
          </tr>

          {/* =========================================
              AVERAGE
          ========================================= */}

          <tr>
            <td className="border p-2 font-semibold">Average</td>

            {grades.map((grade, gradeIndex) => {
              const totals = calculateGradeTotals(grade);

              return (
                <Fragment key={gradeIndex}>
                  <td className="border p-2 text-center font-semibold">
                    {totals.firstSemesterAverage || "-"}
                  </td>

                  <td className="border p-2 text-center font-semibold">
                    {totals.secondSemesterAverage || "-"}
                  </td>
                </Fragment>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* =====================================================
   INFO FIELD
===================================================== */

function InfoField({ label, value }) {
  return (
    <div className="border-r p-3 last:border-r-0">
      <span className="text-xs font-semibold uppercase text-gray-500">
        {label}
      </span>

      <p className="mt-1 min-h-6 font-medium">{value || "-"}</p>
    </div>
  );
}

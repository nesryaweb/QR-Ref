"use client";

import { Fragment } from "react";
import { calculateAverage, calculateGradeTotals } from "@/lib/transcript";

export default function TranscriptDocument({ transcript, qrUrl }) {
  const grades = transcript.grades || [];

  /*
   * Build one unified subject list from all grades.
   *
   * This means subjects do not need to be hardcoded.
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

  return (
    <div
      className="mx-auto w-full p-4 bg-white text-black"
      style={{
        minHeight: "1580px",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="grid h-[190px] grid-cols-[170px_1fr_190px] border border-black">
        {/* QR */}
        <div className="flex flex-col items-center justify-center border-r border-black">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="Transcript QR Code"
              className="h-[120px] w-[120px]"
            />
          ) : (
            <div className="flex h-[120px] w-[120px] items-center justify-center border border-dashed border-black text-sm">
              QR
            </div>
          )}

          <p className="mt-1 text-[11px]">{transcript.studentName || ""}</p>
        </div>

        {/* SCHOOL HEADER */}
        <div className="flex items-center justify-center border-r border-black p-3">
          <img
            src="/transcript/school-header.png"
            alt="School Header"
            className="max-h-[165px] max-w-full object-contain"
          />
        </div>

        {/* STUDENT PHOTO */}
        <div className="flex flex-col items-center justify-center">
          {transcript.photo ? (
            <img
              src={URL.createObjectURL(transcript.photo)}
              alt={transcript.studentName || "Student"}
              className="h-[125px] w-[100px] object-cover"
            />
          ) : (
            <div className="flex h-[125px] w-[100px] items-center justify-center border border-dashed border-black text-center text-xs">
              Student
              <br />
              Photo
            </div>
          )}

          <p className="mt-1 text-center text-[9px] leading-tight">
            Note: the photo is
            <br />
            an actual photo,
            <br />
            not a scanned
            <br />
            photo.
          </p>
        </div>
      </div>

      {/* =====================================================
          STUDENT INFORMATION
      ===================================================== */}

      <div className="grid grid-cols-4 border-x border-b border-black">
        <InfoField label="Name of the student" value={transcript.studentName} />

        <InfoField label="Age" value={transcript.age} />

        <InfoField label="Gender" value={transcript.gender} />

        <InfoField label="Stream" value={transcript.stream} />
      </div>

      {/* =====================================================
          TRANSCRIPT TABLE
      ===================================================== */}

      <table className="w-full table-fixed border-collapse text-[10px]">
        <thead>
          {/* -------------------------------------------------
              GRADE HEADERS
          ------------------------------------------------- */}

          <tr>
            <th
              rowSpan={2}
              className="w-[220px] border border-black px-2 py-1 text-center font-semibold"
            >
              Subjects
            </th>

            {grades.map((grade, index) => (
              <th
                key={index}
                colSpan={3}
                className="border border-black px-1 py-1 text-center"
              >
                <div className="font-bold">{grade.gradeName || "Grade"}</div>

                <div className="text-[9px] font-normal">
                  Aca. Year: {grade.academicYear || "-"}
                </div>
              </th>
            ))}
          </tr>

          {/* -------------------------------------------------
              SEMESTER HEADERS
          ------------------------------------------------- */}

          <tr>
            {grades.map((grade, index) => (
              <Fragment key={index}>
                <th className="border border-black px-1 py-1 text-center text-[9px] font-normal">
                  1st
                  <br />
                  Sem
                </th>

                <th className="border border-black px-1 py-1 text-center text-[9px] font-normal">
                  2nd
                  <br />
                  Sem
                </th>

                <th className="border border-black px-1 py-1 text-center text-[9px] font-normal">
                  Average
                </th>
              </Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* =================================================
              SUBJECTS
          ================================================= */}

          {subjectNames.map((subjectName) => (
            <tr key={subjectName}>
              <td className="border border-black px-1 py-[2px] font-medium">
                {subjectName}
              </td>

              {grades.map((grade, gradeIndex) => {
                const subject = grade.subjects?.find(
                  (item) => item.name?.trim() === subjectName,
                );

                const average = subject
                  ? calculateAverage(
                      subject.firstSemester,
                      subject.secondSemester,
                    )
                  : "";

                return (
                  <Fragment key={gradeIndex}>
                    <td className="border border-black px-1 py-[2px] text-center">
                      {subject?.firstSemester || "-"}
                    </td>

                    <td className="border border-black px-1 py-[2px] text-center">
                      {subject?.secondSemester || "-"}
                    </td>

                    <td className="border border-black px-1 py-[2px] text-center">
                      {average === "" ? "-" : average}
                    </td>
                  </Fragment>
                );
              })}
            </tr>
          ))}

          {/* =================================================
              TOTAL
          ================================================= */}

          <tr className="font-semibold">
            <td className="border border-black px-1 py-[2px]">Total</td>

            {grades.map((grade, index) => {
              const totals = calculateGradeTotals(grade);

              return (
                <Fragment key={index}>
                  <td className="border border-black px-1 py-[2px] text-center">
                    {totals.firstSemesterTotal || "-"}
                  </td>

                  <td className="border border-black px-1 py-[2px] text-center">
                    {totals.secondSemesterTotal || "-"}
                  </td>

                  <td className="border border-black px-1 py-[2px] text-center">
                    {totals.overallAverage || "-"}
                  </td>
                </Fragment>
              );
            })}
          </tr>

          {/* =================================================
              AVERAGE
          ================================================= */}

          <tr className="font-semibold">
            <td className="border border-black px-1 py-[2px]">Average</td>

            {grades.map((grade, index) => {
              const totals = calculateGradeTotals(grade);

              return (
                <Fragment key={index}>
                  <td className="border border-black px-1 py-[2px] text-center">
                    {totals.firstSemesterAverage || "-"}
                  </td>

                  <td className="border border-black px-1 py-[2px] text-center">
                    {totals.secondSemesterAverage || "-"}
                  </td>

                  <td className="border border-black px-1 py-[2px] text-center">
                    {totals.overallAverage || "-"}
                  </td>
                </Fragment>
              );
            })}
          </tr>

          {/* =================================================
              RANK
          ================================================= */}

          <tr>
            <td className="border border-black px-1 py-[2px] font-semibold">
              Rank
            </td>

            {grades.map((grade, index) => (
              <td
                key={index}
                colSpan={3}
                className="border border-black px-1 py-[2px] text-center"
              >
                {transcript.rank || "-"}
              </td>
            ))}
          </tr>

          {/* =================================================
              CONDUCT / WORK ETHIC
          ================================================= */}

          <tr>
            <td className="border border-black px-1 py-[2px] font-semibold">
              Conduct/Work Ethic
            </td>

            {grades.map((grade, index) => (
              <td
                key={index}
                colSpan={3}
                className="border border-black px-1 py-[2px] text-center"
              >
                {transcript.conduct || "-"}
              </td>
            ))}
          </tr>

          {/* =================================================
              ABSENCES
          ================================================= */}

          <tr>
            <td className="border border-black px-1 py-[2px] font-semibold">
              Absences
            </td>

            {grades.map((grade, index) => (
              <td
                key={index}
                colSpan={3}
                className="border border-black px-1 py-[2px] text-center"
              >
                {transcript.absence || "-"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* =====================================================
          COMPLETED GRADE
      ===================================================== */}

      <div className="px-2 pt-2 text-[11px]">
        He/She has completed grade{" "}
        <span className="font-semibold">
          {transcript.completedGrade || "________________"}
        </span>
        .
      </div>

      {/* =====================================================
          SIGNATURES
      ===================================================== */}

      <div className="mt-2 grid grid-cols-2 px-2 text-[10px]">
        <div className="space-y-1">
          <p>Record Keeper's Name __________________________________</p>

          <p>Signature: __________________________________</p>

          <p>Date: __________________________________</p>
        </div>

        <div className="space-y-1">
          <p>Site Director's Name _________________________________</p>

          <p>Signature: _________________________________</p>

          <p>Date: _________________________________</p>
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="mt-4 border-t border-black px-2 pt-2 text-center text-[9px] font-semibold italic">
        Do not accept scanned or electronic versions of this document unless
        sent directly from Gibson School System
      </div>
    </div>
  );
}

/* =====================================================
   INFO FIELD
===================================================== */

function InfoField({ label, value }) {
  return (
    <div className="border-r border-black px-2 py-1 last:border-r-0">
      <span className="text-[10px] font-semibold">{label}:</span>

      <span className="ml-2 text-[10px] font-medium">{value || ""}</span>
    </div>
  );
}

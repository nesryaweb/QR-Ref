"use client";

import { Fragment } from "react";
import { calculateAverage, calculateGradeTotals } from "@/lib/transcript";
import CompletedGrades from "./CompletedGrades";

export default function TranscriptDocument({
  transcript,
  qrUrl,
  photoUrl,
  schoolHeaderUrl,
}) {
  const grades = transcript.grades || [];

  // =========================================================
  // DISPLAY AT LEAST 4 GRADES
  // =========================================================
  //
  // These extra grades are ONLY for the document display.
  // They are NOT added to transcript.grades.
  // They will NOT be saved.
  //
  const displayGrades = [...grades];

  while (displayGrades.length < 4) {
    displayGrades.push({
      isBlankGrade: true,
      gradeName: "",
      academicYear: "",
      studentCount: "",
      firstSemesterRank: "",
      secondSemesterRank: "",
      conduct: "",
      absence: "",
      subjects: [],
    });
  }

  // =========================================================
  // COLLECT ALL UNIQUE SUBJECTS
  // =========================================================

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
      id="transcript-document"
      className="h-[646px] w-[891px] bg-white p-6 text-black font-transcript-arial text-sm"
    >
      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <div className="grid grid-cols-[150px_1fr_150px] items-start">
        {/* =================================================
            QR
        ================================================= */}

        <div className="flex flex-col items-center justify-start">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="Transcript QR"
              className="h-28 w-28 object-contain"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center border-2 border-dashed text-sm text-gray-500">
              QR
            </div>
          )}

          <p className="mt-2 text-xs">{transcript.studentName || "Student"}</p>
        </div>

        {/* =================================================
            SCHOOL HEADER
        ================================================= */}

        <div className="text-center">
          <img
            src={schoolHeaderUrl}
            alt="Gibson School Systems"
            className="h-auto w-full object-contain"
          />

          <h2 className="mt-3 text-base font-bold underline">
            Student Transcript
          </h2>
        </div>

        {/* =================================================
            PHOTO
        ================================================= */}

        <div className="flex flex-col items-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={transcript.studentName || "Student"}
              className="h-30 w-30 object-cover"
            />
          ) : (
            <div className="flex h-30 w-30 items-center justify-center border-2 border-dashed text-xs text-gray-500">
              Student Photo
            </div>
          )}

          <p className="mt-1 text-center text-[10px] leading-tight">
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

      {/* IMPORTANT:
          This is intentionally identical to TranscriptPreview.
      */}

      <div className="mt-3 grid grid-cols-[2fr_0.7fr_0.8fr_0.9fr] border-b border-black text-sm">
        <InfoLine label="Name of the Student" value={transcript.studentName} />

        <InfoLine label="Age" value={transcript.age} />

        <InfoLine label="Gender" value={transcript.gender} />

        <InfoLine label="Stream" value={transcript.stream} />
      </div>

      {/* =====================================================
          TRANSCRIPT TABLE
      ===================================================== */}

      <div className="mt-0 w-full">
        {grades.length === 0 ? (
          <div className="border border-black p-10 text-center text-gray-500">
            Add grades and subjects to display the transcript.
          </div>
        ) : (
          <table className="w-full table-fixed border-collapse text-[10px]">
            {/* =================================================
                TABLE HEADER
            ================================================= */}

            <thead>
              {/* =================================================
                  ROW 1 — STUDENT ID + GRADES
              ================================================= */}

              <tr>
                {/* STUDENT ID */}

                <th
                  rowSpan={2}
                  className="w-[220px] border border-black px-2 py-1 text-left align-middle"
                >
                  <div className="font-semibold">
                    Student ID:{" "}
                    <span className="underline">
                      {transcript.studentId || ""}
                    </span>
                  </div>
                </th>

                {/* ALL DISPLAY GRADES */}

                {displayGrades.map((grade, index) => (
                  <th
                    key={index}
                    colSpan={3}
                    rowSpan={2}
                    className="border border-black p-0 text-center"
                  >
                    <div className="flex flex-col">
                      {/* GRADE */}

                      <div className="px-1 py-1 font-bold">
                        Grade:{" "}
                        <span className="underline">
                          {grade.isBlankGrade ? "-" : grade.gradeName || "-"}
                        </span>
                      </div>

                      {/* ACADEMIC YEAR */}

                      <div className="px-1 py-1 font-normal">
                        Academic Year:{" "}
                        <span className="underline">
                          {grade.isBlankGrade ? "-" : grade.academicYear || "-"}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>

              {/* =================================================
                  EMPTY STRUCTURAL ROW
              ================================================= */}

              <tr></tr>

              {/* =================================================
                  ROW 3 — SUBJECT + SEMESTERS
              ================================================= */}

              <tr>
                <th className="border border-black px-1 py-1 text-left font-semibold">
                  Subject
                </th>

                {displayGrades.map((grade, index) => (
                  <Fragment key={index}>
                    <th className="border border-black px-1 py-1 text-center font-normal">
                      1st
                      <br />
                      Sem
                    </th>

                    <th className="border border-black px-1 py-1 text-center font-normal">
                      2nd
                      <br />
                      Sem
                    </th>

                    <th className="border border-black px-1 py-1 text-center font-normal">
                      Average
                    </th>
                  </Fragment>
                ))}
              </tr>
            </thead>

            {/* =================================================
                TABLE BODY
            ================================================= */}

            <tbody>
              {/* =================================================
                  SUBJECTS
              ================================================= */}

              {subjectNames.map((subjectName) => (
                <tr key={subjectName}>
                  <td className="border border-black px-1 py-[2px] font-medium">
                    {subjectName}
                  </td>

                  {displayGrades.map((grade, gradeIndex) => {
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
                        {/* FIRST SEMESTER */}

                        <td className="border border-black px-1 py-[2px] text-center">
                          {subject?.firstSemester || "-"}
                        </td>

                        {/* SECOND SEMESTER */}

                        <td className="border border-black px-1 py-[2px] text-center">
                          {subject?.secondSemester || "-"}
                        </td>

                        {/* AVERAGE */}

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

              <tr>
                <td className="border border-black px-1 py-[2px] font-bold">
                  Total
                </td>

                {displayGrades.map((grade, index) => {
                  const totals = grade.isBlankGrade
                    ? {
                        firstSemesterTotal: "",
                        secondSemesterTotal: "",
                        overallAverage: "",
                      }
                    : calculateGradeTotals(grade);

                  return (
                    <Fragment key={index}>
                      <td className="border border-black text-center font-bold">
                        {totals.firstSemesterTotal || "-"}
                      </td>

                      <td className="border border-black text-center font-bold">
                        {totals.secondSemesterTotal || "-"}
                      </td>

                      <td className="border border-black text-center font-bold">
                        {totals.overallAverage || "-"}
                      </td>
                    </Fragment>
                  );
                })}
              </tr>

              {/* =================================================
                  AVERAGE
              ================================================= */}

              <tr>
                <td className="border border-black px-1 py-[2px] font-bold">
                  Average
                </td>

                {displayGrades.map((grade, index) => {
                  const totals = grade.isBlankGrade
                    ? {
                        firstSemesterAverage: "",
                        secondSemesterAverage: "",
                        overallAverage: "",
                      }
                    : calculateGradeTotals(grade);

                  return (
                    <Fragment key={index}>
                      <td className="border border-black text-center font-bold">
                        {totals.firstSemesterAverage || "-"}
                      </td>

                      <td className="border border-black text-center font-bold">
                        {totals.secondSemesterAverage || "-"}
                      </td>

                      <td className="border border-black text-center font-bold">
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
                <td className="border border-black px-1 py-[2px] font-bold">
                  Rank
                </td>

                {displayGrades.map((grade, index) => {
                  const rankAverage = grade.isBlankGrade
                    ? ""
                    : calculateAverage(
                        grade.firstSemesterRank,
                        grade.secondSemesterRank,
                      );

                  const studentCount = grade.studentCount;

                  return (
                    <Fragment key={index}>
                      {/* 1ST SEMESTER RANK */}

                      <td className="border border-black text-center">
                        {grade.firstSemesterRank && studentCount
                          ? `${grade.firstSemesterRank}/${studentCount}`
                          : "-"}
                      </td>

                      {/* 2ND SEMESTER RANK */}

                      <td className="border border-black text-center">
                        {grade.secondSemesterRank && studentCount
                          ? `${grade.secondSemesterRank}/${studentCount}`
                          : "-"}
                      </td>

                      {/* AVERAGE RANK */}

                      <td className="border border-black text-center font-semibold">
                        {rankAverage !== "" && studentCount
                          ? `${Math.round(Number(rankAverage))}/${studentCount}`
                          : "-"}
                      </td>
                    </Fragment>
                  );
                })}
              </tr>

              {/* =================================================
                  CONDUCT / WORK ETHIC
              ================================================= */}

              <tr>
                <td className="border border-black px-1 py-[2px] font-bold">
                  Conduct / Work Ethic
                </td>

                {displayGrades.map((grade, index) => (
                  <td
                    key={index}
                    colSpan={3}
                    className="border border-black text-center"
                  >
                    {grade.isBlankGrade ? "-" : grade.conduct || "-"}
                  </td>
                ))}
              </tr>

              {/* =================================================
                  ABSENCES
              ================================================= */}

              <tr>
                <td className="border border-black px-1 py-[2px] font-bold">
                  Absences
                </td>

                {displayGrades.map((grade, index) => (
                  <td
                    key={index}
                    colSpan={3}
                    className="border border-black text-center"
                  >
                    {grade.isBlankGrade ? "-" : grade.absence || "-"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* =====================================================
          COMPLETED GRADES
      ===================================================== */}

      <CompletedGrades grades={grades} />

      {/* =====================================================
          SIGNATURES
      ===================================================== */}

      <div className="mt-2 grid grid-cols-2 text-sm">
        <div>
          <p>Record Keeper's Name ______________________________</p>

          <p>Signature: ______________________________</p>

          <p>Date: ______________________________</p>
        </div>

        <div>
          <p>Site Director's Name ______________________________</p>

          <p>Signature: ______________________________</p>

          <p>Date: ______________________________</p>
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="mt-4 border-t pt-2 text-center text-sm font-transcript-georgia font-bold italic">
        Do not accept scanned or electronic versions of this document unless
        sent directly from Gibson School System
      </div>
    </div>
  );
}

/* =========================================================
   STUDENT INFO LINE
========================================================= */

function InfoLine({ label, value }) {
  return (
    <div className="flex items-end gap-2 px-2 py-1">
      <span className="whitespace-nowrap font-semibold">{label}:</span>

      <span className="min-w-0 flex-1 border-black font-bold underline">
        {value || ""}
      </span>
    </div>
  );
}

"use client";

import { Fragment } from "react";
import { calculateAverage, calculateGradeTotals } from "@/lib/transcript";
import CompletedGrades from "./CompletedGrades";

export default function TranscriptDocument({ transcript, qrUrl }) {
  const grades = transcript.grades || [];

  /*
   * Collect all unique subjects from all grades.
   *
   * This allows Grade 9 to have different subjects from
   * Grade 10, while still keeping one unified transcript table.
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
    <div id="transcript-document" className="w-full bg-white p-6 text-black">
      {/* =========================================
          TOP HEADER
      ========================================= */}

      <div className="grid grid-cols-[150px_1fr_150px] items-start">
        {/* QR */}
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

        {/* SCHOOL HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Gibson School Systems</h1>

          <p className="mt-1 text-lg font-semibold italic">
            Gibson Youth Academy and Gibson Preparatory College
          </p>

          <p className="text-xs">Making Young People Strong People</p>

          <p className="mt-3 text-xs font-semibold">
            Central Administrative Office, Phones: 011-662-8312 or 011-661-0150
          </p>

          <p className="text-xs font-semibold">
            P.O. Box 15564 Addis Ababa, Ethiopia.
          </p>

          <p className="text-xs font-semibold">
            https://gyaschool.com &nbsp; info@gyaschool.net
          </p>

          <h2 className="mt-3 text-base font-bold underline">
            Student Transcript
          </h2>
        </div>

        {/* PHOTO */}
        <div className="flex flex-col items-center">
          {transcript.photoUrl ? (
            <img
              src={transcript.photoUrl}
              alt={transcript.studentName || "Student"}
              className="h-28 w-24 object-cover"
            />
          ) : (
            <div className="flex h-28 w-24 items-center justify-center border-2 border-dashed text-xs text-gray-500">
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

      {/* =========================================
          STUDENT INFORMATION
      ========================================= */}

      <div className="mt-3 grid grid-cols-4 border-b border-black text-sm">
        <InfoLine label="Name of the Student" value={transcript.studentName} />

        <InfoLine label="Age" value={transcript.age} />

        <InfoLine label="Gender" value={transcript.gender} />

        <InfoLine label="Stream" value={transcript.stream} />
      </div>

      {/* =========================================
          TRANSCRIPT TABLE
      ========================================= */}

      <div className="mt-0 w-full">
        {grades.length === 0 ? (
          <div className="border border-black p-10 text-center text-gray-500">
            Add grades and subjects to display the transcript.
          </div>
        ) : (
          <table className="w-full table-fixed border-collapse text-[10px]">
            <thead>
              {/* =====================================
                  ROW 1 + 2 — STUDENT ID + GRADE/YEAR
              ===================================== */}

              <tr>
                {/* STUDENT ID */}
                <th
                  rowSpan={2}
                  className="w-[220px] border border-black px-2 py-1 text-left align-middle"
                >
                  <div className="font-semibold">
                    Student ID: {transcript.studentId || "____________"}
                  </div>
                </th>

                {/* EACH GRADE */}
                {grades.map((grade, index) => (
                  <th
                    key={index}
                    colSpan={3}
                    rowSpan={2}
                    className="border border-black p-0 text-center"
                  >
                    <div className="flex flex-col">
                      {/* GRADE */}
                      <div className="border-b border-black px-1 py-1 font-bold">
                        Grade: {grade.gradeName || "____"}
                      </div>

                      {/* ACADEMIC YEAR */}
                      <div className="px-1 py-1 font-normal">
                        Academic Year: {grade.academicYear || "____________"}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>

              {/* =====================================
                  EMPTY STRUCTURAL ROW
              ===================================== */}

              <tr></tr>

              {/* =====================================
                  ROW 3 — SUBJECT + SEMESTERS
              ===================================== */}

              <tr>
                <th className="border border-black px-1 py-1 text-left font-semibold">
                  Subject
                </th>

                {grades.map((grade, index) => (
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

            {/* =====================================
                SUBJECTS
            ===================================== */}

            <tbody>
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
                        {/* 1st Semester */}
                        <td className="border border-black px-1 py-[2px] text-center">
                          {subject?.firstSemester || "-"}
                        </td>

                        {/* 2nd Semester */}
                        <td className="border border-black px-1 py-[2px] text-center">
                          {subject?.secondSemester || "-"}
                        </td>

                        {/* Average */}
                        <td className="border border-black px-1 py-[2px] text-center">
                          {average === "" ? "-" : average}
                        </td>
                      </Fragment>
                    );
                  })}
                </tr>
              ))}

              {/* =====================================
                  TOTAL
              ===================================== */}

              <tr>
                <td className="border border-black px-1 py-[2px] font-bold">
                  Total
                </td>

                {grades.map((grade, index) => {
                  const totals = calculateGradeTotals(grade);

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

              {/* =====================================
                  AVERAGE
              ===================================== */}

              <tr>
                <td className="border border-black px-1 py-[2px] font-bold">
                  Average
                </td>

                {grades.map((grade, index) => {
                  const totals = calculateGradeTotals(grade);

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

              {/* =====================================
                  RANK
              ===================================== */}

              <tr>
                <td className="border border-black px-1 py-[2px] font-bold">
                  Rank
                </td>

                {grades.map((grade, index) => {
                  const rankAverage = calculateAverage(
                    grade.firstSemesterRank,
                    grade.secondSemesterRank,
                  );

                  return (
                    <Fragment key={index}>
                      {/* 1st Semester Rank */}
                      <td className="border border-black text-center">
                        {grade.firstSemesterRank || "-"}
                      </td>

                      {/* 2nd Semester Rank */}
                      <td className="border border-black text-center">
                        {grade.secondSemesterRank || "-"}
                      </td>

                      {/* Average Rank */}
                      <td className="border border-black text-center font-semibold">
                        {rankAverage === "" ? "-" : rankAverage}
                      </td>
                    </Fragment>
                  );
                })}
              </tr>

              {/* =====================================
                  CONDUCT / WORK ETHIC
              ===================================== */}

              <tr>
                <td className="border border-black px-1 py-[2px] font-bold">
                  Conduct / Work Ethic
                </td>

                {grades.map((grade, index) => (
                  <td
                    key={index}
                    colSpan={3}
                    className="border border-black text-center"
                  >
                    {grade.conduct || "-"}
                  </td>
                ))}
              </tr>

              {/* =====================================
                  ABSENCES
              ===================================== */}

              <tr>
                <td className="border border-black px-1 py-[2px] font-bold">
                  Absences
                </td>

                {grades.map((grade, index) => (
                  <td
                    key={index}
                    colSpan={3}
                    className="border border-black text-center"
                  >
                    {grade.absence || "-"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* =========================================
          COMPLETED GRADES
      ========================================= */}

      <CompletedGrades grades={grades} />

      {/* =========================================
          SIGNATURES
      ========================================= */}

      <div className="mt-2 grid grid-cols-2 text-xs">
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

      {/* =========================================
          FOOTER
      ========================================= */}

      <div className="mt-4 border-t pt-2 text-center text-[10px] font-semibold italic">
        Do not accept scanned or electronic versions of this document unless
        sent directly from Gibson School System
      </div>
    </div>
  );
}

/* =========================================
   STUDENT INFO LINE
========================================= */

function InfoLine({ label, value }) {
  return (
    <div className="flex items-end gap-2 px-2 py-1">
      <span className="font-semibold whitespace-nowrap">{label}:</span>

      <span className="min-w-0 flex-1 border-b border-black font-medium">
        {value || ""}
      </span>
    </div>
  );
}

"use client";

import { Fragment } from "react";
import { calculateAverage, calculateGradeTotals } from "@/lib/transcript";

export default function TranscriptDocument({ transcript, qrUrl }) {
  const grades = transcript.grades || [];

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
    <div className="w-[1120px] min-h-[1580px] bg-white text-black">
      {/* =========================================
          HEADER AREA
      ========================================= */}

      <div className="grid h-[190px] grid-cols-[170px_1fr_190px] border border-black">
        {/* QR */}
        <div className="flex items-center justify-center border-r border-black">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="Transcript QR Code"
              className="h-[130px] w-[130px]"
            />
          ) : (
            <div className="flex h-[130px] w-[130px] items-center justify-center border border-dashed border-black text-sm">
              QR
            </div>
          )}
        </div>

        {/* SCHOOL HEADER */}
        <div className="flex items-center justify-center border-r border-black text-center">
          <div>
            <div className="text-xl font-bold">
              SCHOOL HEADER
            </div>

            <div className="mt-2 text-sm">
              School branding will be placed here
            </div>
          </div>
        </div>

        {/* STUDENT PHOTO */}
        <div className="flex items-center justify-center">
          {transcript.photo ? (
            <img
              src={URL.createObjectURL(transcript.photo)}
              alt={transcript.studentName || "Student"}
              className="h-[150px] w-[120px] object-cover"
            />
          ) : (
            <div className="flex h-[150px] w-[120px] items-center justify-center border border-dashed border-black text-sm text-center">
              Student Photo
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          STUDENT INFORMATION
      ========================================= */}

      <div className="grid grid-cols-4 border-x border-b border-black">
        <InfoField
          label="Name"
          value={transcript.studentName}
        />

        <InfoField
          label="Age"
          value={transcript.age}
        />

        <InfoField
          label="Gender"
          value={transcript.gender}
        />

        <InfoField
          label="Stream"
          value={transcript.stream}
        />
      </div>

      {/* =========================================
          TRANSCRIPT TABLE
      ========================================= */}

      <div className="border-x border-b border-black">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr>
              <th
                rowSpan="2"
                className="w-[220px] border border-black p-2 text-left"
              >
                Subject
              </th>

              {grades.map((grade, index) => (
                <th
                  key={index}
                  colSpan="2"
                  className="border border-black p-2 text-center"
                >
                  {grade.gradeName || "Grade"}
                </th>
              ))}
            </tr>

            <tr>
              {grades.map((grade, index) => (
                <Fragment key={index}>
                  <th className="border border-black p-2 text-center text-sm">
                    1st Sem
                  </th>

                  <th className="border border-black p-2 text-center text-sm">
                    2nd Sem
                  </th>
                </Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {subjectNames.map((subjectName) => (
              <tr key={subjectName}>
                <td className="border border-black p-2 font-medium">
                  {subjectName}
                </td>

                {grades.map((grade, gradeIndex) => {
                  const subject = grade.subjects?.find(
                    (item) =>
                      item.name?.trim() === subjectName,
                  );

                  return (
                    <Fragment key={gradeIndex}>
                      <td className="border border-black p-2 text-center">
                        {subject?.firstSemester || "-"}
                      </td>

                      <td className="border border-black p-2 text-center">
                        {subject?.secondSemester || "-"}
                      </td>
                    </Fragment>
                  );
                })}
              </tr>
            ))}

            {/* TOTAL */}
            <tr>
              <td className="border border-black p-2 font-semibold">
                Total
              </td>

              {grades.map((grade, index) => {
                const totals = calculateGradeTotals(grade);

                return (
                  <Fragment key={index}>
                    <td className="border border-black p-2 text-center font-semibold">
                      {totals.firstSemesterTotal || "-"}
                    </td>

                    <td className="border border-black p-2 text-center font-semibold">
                      {totals.secondSemesterTotal || "-"}
                    </td>
                  </Fragment>
                );
              })}
            </tr>

            {/* AVERAGE */}
            <tr>
              <td className="border border-black p-2 font-semibold">
                Average
              </td>

              {grades.map((grade, index) => {
                const totals = calculateGradeTotals(grade);

                return (
                  <Fragment key={index}>
                    <td className="border border-black p-2 text-center font-semibold">
                      {totals.firstSemesterAverage || "-"}
                    </td>

                    <td className="border border-black p-2 text-center font-semibold">
                      {totals.secondSemesterAverage || "-"}
                    </td>
                  </Fragment>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* =========================================
          FINAL INFORMATION
      ========================================= */}

      <div className="grid grid-cols-4 border-x border-b border-black">
        <InfoField
          label="Rank"
          value={transcript.rank}
        />

        <InfoField
          label="Conduct / Work Ethics"
          value={transcript.conduct}
        />

        <InfoField
          label="Absence"
          value={transcript.absence}
        />

        <InfoField
          label="Completed Grade"
          value={transcript.completedGrade}
        />
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="border-r border-black p-3 last:border-r-0">
      <div className="text-xs font-semibold">
        {label}
      </div>

      <div className="mt-1 min-h-[24px] font-medium">
        {value || "-"}
      </div>
    </div>
  );
}
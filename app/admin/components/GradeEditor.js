"use client";

import {
  createEmptySubject,
  calculateAverage,
} from "@/lib/transcript";

export default function GradeEditor({
  grade,
  gradeIndex,
  onUpdateGrade,
  onAddSubject,
  onUpdateSubject,
}) {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="grid gap-5 md:grid-cols-2">

        {/* Grade */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Grade
          </label>

          <input
            type="text"
            value={grade.gradeName}
            onChange={(event) =>
              onUpdateGrade(
                gradeIndex,
                "gradeName",
                event.target.value,
              )
            }
            placeholder="e.g. Grade 9"
            className="w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Academic Year */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Academic Year
          </label>

          <input
            type="text"
            value={grade.academicYear}
            onChange={(event) =>
              onUpdateGrade(
                gradeIndex,
                "academicYear",
                event.target.value,
              )
            }
            placeholder="e.g. 2024/25"
            className="w-full rounded-md border p-3 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

      </div>

      {/* Subjects */}
      <div className="mt-8">

        <div className="mb-3">
          <h3 className="font-semibold">
            Subjects
          </h3>

          <p className="text-sm text-gray-500">
            Add the subjects and enter the semester marks.
          </p>
        </div>

        {grade.subjects.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">

              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left text-sm font-medium">
                    Subject
                  </th>

                  <th className="p-3 text-left text-sm font-medium">
                    1st Semester
                  </th>

                  <th className="p-3 text-left text-sm font-medium">
                    2nd Semester
                  </th>

                  <th className="p-3 text-left text-sm font-medium">
                    Average
                  </th>
                </tr>
              </thead>

              <tbody>
                {grade.subjects.map((subject, subjectIndex) => {
                  const average = calculateAverage(
                    subject.firstSemester,
                    subject.secondSemester,
                  );

                  return (
                    <tr
                      key={subjectIndex}
                      className="border-b"
                    >
                      {/* Subject */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={subject.name}
                          onChange={(event) =>
                            onUpdateSubject(
                              gradeIndex,
                              subjectIndex,
                              "name",
                              event.target.value,
                            )
                          }
                          placeholder="Subject name"
                          className="w-full rounded-md border p-2 outline-none focus:ring-2 focus:ring-black"
                        />
                      </td>

                      {/* First semester */}
                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={subject.firstSemester}
                          onChange={(event) =>
                            onUpdateSubject(
                              gradeIndex,
                              subjectIndex,
                              "firstSemester",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-md border p-2 outline-none focus:ring-2 focus:ring-black"
                        />
                      </td>

                      {/* Second semester */}
                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={subject.secondSemester}
                          onChange={(event) =>
                            onUpdateSubject(
                              gradeIndex,
                              subjectIndex,
                              "secondSemester",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-md border p-2 outline-none focus:ring-2 focus:ring-black"
                        />
                      </td>

                      {/* Average */}
                      <td className="p-3">
                        <div className="rounded-md bg-gray-100 p-2 font-medium">
                          {average === "" ? "-" : average}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}

        <button
          type="button"
          onClick={() => onAddSubject(gradeIndex)}
          className="mt-4 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-100"
        >
          + Add Subject
        </button>

      </div>
    </section>
  );
}
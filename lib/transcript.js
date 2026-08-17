export function createEmptyTranscript() {
  return {
    studentName: "",
    age: "",
    gender: "",
    stream: "",
    photo: null,

    grades: [],

    conduct: "",
absence: "",
rank: "",
completedGrade: "",
  };
}

export function createEmptyGrade() {
  return {
    gradeName: "",
    academicYear: "",
    subjects: [],
  };
}

export function createEmptySubject() {
  return {
    name: "",
    firstSemester: "",
    secondSemester: "",
  };
}

export function calculateAverage(firstSemester, secondSemester) {
  const first = Number(firstSemester);
  const second = Number(secondSemester);

  if (
    firstSemester === "" ||
    secondSemester === "" ||
    Number.isNaN(first) ||
    Number.isNaN(second)
  ) {
    return "";
  }

  return Number(((first + second) / 2).toFixed(2));
}

export function calculateGradeTotals(grade) {
  const subjects = grade.subjects || [];

  const validFirstSemester = subjects
    .map((subject) => Number(subject.firstSemester))
    .filter((mark) => !Number.isNaN(mark));

  const validSecondSemester = subjects
    .map((subject) => Number(subject.secondSemester))
    .filter((mark) => !Number.isNaN(mark));

  const firstSemesterTotal = validFirstSemester.reduce(
    (total, mark) => total + mark,
    0,
  );

  const secondSemesterTotal = validSecondSemester.reduce(
    (total, mark) => total + mark,
    0,
  );

  const firstSemesterAverage =
    validFirstSemester.length > 0
      ? firstSemesterTotal / validFirstSemester.length
      : "";

  const secondSemesterAverage =
    validSecondSemester.length > 0
      ? secondSemesterTotal / validSecondSemester.length
      : "";

  const subjectAverages = subjects
    .map((subject) =>
      calculateAverage(
        subject.firstSemester,
        subject.secondSemester,
      ),
    )
    .filter((average) => average !== "");

  const overallAverage =
    subjectAverages.length > 0
      ? subjectAverages.reduce(
          (total, average) => total + average,
          0,
        ) / subjectAverages.length
      : "";

  return {
    firstSemesterTotal: round(firstSemesterTotal),
    secondSemesterTotal: round(secondSemesterTotal),

    firstSemesterAverage:
      firstSemesterAverage === ""
        ? ""
        : round(firstSemesterAverage),

    secondSemesterAverage:
      secondSemesterAverage === ""
        ? ""
        : round(secondSemesterAverage),

    overallAverage:
      overallAverage === ""
        ? ""
        : round(overallAverage),
  };
}

function round(value) {
  return Number(value.toFixed(2));
}
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
export function createEmptyTranscript() {
  return {
    studentName: "",
    age: "",
    gender: "",
    stream: "",
    photo: null,

    grades: [],

    rank: "",
    conduct: "",
    absence: "",
    completedGrade: "",

    recordKeeper: "",
    recordKeeperDate: "",

    siteDirector: "",
    siteDirectorDate: "",
  };
}

export function createEmptyGrade() {
  return {
    name: "",
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
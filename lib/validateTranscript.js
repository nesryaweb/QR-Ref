export default function validateTranscript(transcript, photo) {
  const errors = {};

  // =========================================================
  // STUDENT INFORMATION
  // =========================================================

  if (!transcript.studentName?.trim()) {
    errors.studentName = "Student name is required.";
  }

  if (!transcript.studentId?.trim()) {
    errors.studentId = "Student ID is required.";
  }

  // =========================================================
  // AGE
  // =========================================================

  if (
    transcript.age === undefined ||
    transcript.age === null ||
    transcript.age === ""
  ) {
    errors.age = "Age is required.";
  } else if (isNaN(Number(transcript.age))) {
    errors.age = "Age must be a number.";
  } else if (Number(transcript.age) <= 0) {
    errors.age = "Age must be greater than 0.";
  }

  // =========================================================
  // GENDER
  // =========================================================

  if (!transcript.gender?.trim()) {
    errors.gender = "Please select the student's gender.";
  }

  // =========================================================
  // STREAM
  // =========================================================

  if (!transcript.stream?.trim()) {
    errors.stream = "Stream is required.";
  }

  // =========================================================
  // PHOTO
  // =========================================================

  if (!photo) {
    errors.photo = "Student photo is required.";
  }

  // =========================================================
  // GRADES
  // =========================================================

  if (!transcript.grades?.length) {
    errors.grades = "Please add at least one grade.";
  } else {
    transcript.grades.forEach((grade, gradeIndex) => {
      const gradeErrors = {};

      // =======================================================
      // GRADE NAME
      // =======================================================

      if (!grade.gradeName?.trim()) {
        gradeErrors.gradeName = "Grade is required.";
      }

      // =======================================================
      // ACADEMIC YEAR
      // =======================================================

      if (!grade.academicYear?.trim()) {
        gradeErrors.academicYear = "Academic year is required.";
      }

      // =======================================================
      // STUDENT COUNT
      // =======================================================

      if (
        grade.studentCount === undefined ||
        grade.studentCount === null ||
        grade.studentCount === ""
      ) {
        gradeErrors.studentCount = "Student count is required.";
      } else if (isNaN(Number(grade.studentCount))) {
        gradeErrors.studentCount = "Student count must be a number.";
      } else if (Number(grade.studentCount) <= 0) {
        gradeErrors.studentCount = "Student count must be greater than 0.";
      }

      // =======================================================
      // CONDUCT
      // =======================================================

      if (!grade.conduct?.trim()) {
        gradeErrors.conduct = "Conduct / Work Ethic is required.";
      }

      // =======================================================
      // ABSENCE
      // =======================================================

      if (
        grade.absence === undefined ||
        grade.absence === null ||
        grade.absence === ""
      ) {
        gradeErrors.absence = "Absences are required.";
      } else if (isNaN(Number(grade.absence))) {
        gradeErrors.absence = "Absences must be a number.";
      } else if (Number(grade.absence) < 0) {
        gradeErrors.absence = "Absences cannot be negative.";
      }

      // =======================================================
      // FIRST SEMESTER RANK
      // =======================================================

      if (
        grade.firstSemesterRank === undefined ||
        grade.firstSemesterRank === null ||
        grade.firstSemesterRank === ""
      ) {
        gradeErrors.firstSemesterRank = "1st semester rank is required.";
      } else if (isNaN(Number(grade.firstSemesterRank))) {
        gradeErrors.firstSemesterRank = "1st semester rank must be a number.";
      } else if (Number(grade.firstSemesterRank) <= 0) {
        gradeErrors.firstSemesterRank =
          "1st semester rank must be greater than 0.";
      } else if (
        !isNaN(Number(grade.studentCount)) &&
        Number(grade.studentCount) > 0 &&
        Number(grade.firstSemesterRank) > Number(grade.studentCount)
      ) {
        gradeErrors.firstSemesterRank =
          "1st semester rank cannot be greater than the total number of students.";
      }

      // =======================================================
      // SECOND SEMESTER RANK
      // =======================================================

      if (
        grade.secondSemesterRank === undefined ||
        grade.secondSemesterRank === null ||
        grade.secondSemesterRank === ""
      ) {
        gradeErrors.secondSemesterRank = "2nd semester rank is required.";
      } else if (isNaN(Number(grade.secondSemesterRank))) {
        gradeErrors.secondSemesterRank = "2nd semester rank must be a number.";
      } else if (Number(grade.secondSemesterRank) <= 0) {
        gradeErrors.secondSemesterRank =
          "2nd semester rank must be greater than 0.";
      } else if (
        !isNaN(Number(grade.studentCount)) &&
        Number(grade.studentCount) > 0 &&
        Number(grade.secondSemesterRank) > Number(grade.studentCount)
      ) {
        gradeErrors.secondSemesterRank =
          "2nd semester rank cannot be greater than the total number of students.";
      }

      // =======================================================
      // SUBJECTS
      // =======================================================

      if (!grade.subjects?.length) {
        gradeErrors.subjects = "Please add at least one subject.";
      } else {
        const subjectErrors = {};

        grade.subjects.forEach((subject, subjectIndex) => {
          const currentSubjectErrors = {};

          // =====================================================
          // SUBJECT NAME
          // =====================================================

          if (!subject.name?.trim()) {
            currentSubjectErrors.name = "Subject name is required.";
          }

          // =====================================================
          // FIRST SEMESTER MARK
          // =====================================================

          if (
            subject.firstSemester === undefined ||
            subject.firstSemester === null ||
            subject.firstSemester === ""
          ) {
            currentSubjectErrors.firstSemester =
              "1st semester mark is required.";
          } else if (isNaN(Number(subject.firstSemester))) {
            currentSubjectErrors.firstSemester =
              "1st semester mark must be a number.";
          } else if (Number(subject.firstSemester) < 0) {
            currentSubjectErrors.firstSemester =
              "1st semester mark cannot be negative.";
          } else if (Number(subject.firstSemester) > 100) {
            currentSubjectErrors.firstSemester =
              "1st semester mark cannot be greater than 100.";
          }

          // =====================================================
          // SECOND SEMESTER MARK
          // =====================================================

          if (
            subject.secondSemester === undefined ||
            subject.secondSemester === null ||
            subject.secondSemester === ""
          ) {
            currentSubjectErrors.secondSemester =
              "2nd semester mark is required.";
          } else if (isNaN(Number(subject.secondSemester))) {
            currentSubjectErrors.secondSemester =
              "2nd semester mark must be a number.";
          } else if (Number(subject.secondSemester) < 0) {
            currentSubjectErrors.secondSemester =
              "2nd semester mark cannot be negative.";
          } else if (Number(subject.secondSemester) > 100) {
            currentSubjectErrors.secondSemester =
              "2nd semester mark cannot be greater than 100.";
          }

          if (Object.keys(currentSubjectErrors).length > 0) {
            subjectErrors[subjectIndex] = currentSubjectErrors;
          }
        });

        if (Object.keys(subjectErrors).length > 0) {
          gradeErrors.subjects = subjectErrors;
        }
      }

      // =======================================================
      // SAVE GRADE ERRORS
      // =======================================================

      if (Object.keys(gradeErrors).length > 0) {
        errors.grades = errors.grades || {};
        errors.grades[gradeIndex] = gradeErrors;
      }
    });
  }

  return errors;
}

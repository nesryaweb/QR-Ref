export default function CompletedGrades({ grades = [] }) {
  const completedGrades = grades
    .map((grade) => grade.gradeName)
    .filter(Boolean);

  let completedGradeText = "";

  if (completedGrades.length === 1) {
    completedGradeText = completedGrades[0];
  } else if (completedGrades.length === 2) {
    completedGradeText = `${completedGrades[0]} and ${completedGrades[1]}`;
  } else if (completedGrades.length > 2) {
    completedGradeText =
      completedGrades.slice(0, -1).join(", ") +
      " and " +
      completedGrades[completedGrades.length - 1];
  }

  return (
    <p className="mt-2 text-sm">
      He/She has completed{" "}
      {completedGrades.length > 1 ? "grades" : "grade"}{" "}
      <span className="font-semibold underline">
        {completedGradeText || "________________"}
      </span>
      .
    </p>
  );
}
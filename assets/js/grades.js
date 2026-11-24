/*
CIT2011 | Wolmer's Boys' School | National Heroes Circle, Kingston 4
Group members (full name | student ID | lab day/time)
Shaney Byfield | 2500730 | Lab: Tuesday 3–5 p.m.
Christopher Lewis | 2505274 | Lab: Tuesday 3–5 p.m.
Kelsey James | 2510038 | Lab: Tuesday 3–5 p.m.
Vacketia Smith | 2509363 | Lab: Tuesday 3–5 p.m.
*/
if (authorized) setupGrades();

function setupGrades() {
  const form = document.getElementById("grade-form");
  const semester = document.getElementById("grade-semester");
  const subject = document.getElementById("grade-subject");
  const level = document.getElementById("grade-level");
  const assessment = document.getElementById("grade-assessment");
  const table = document.getElementById("grade-table");
  const save = document.getElementById("save-grades");

  fillSelect(semester, semesters);
  fillSelect(subject, user.role === "teacher" ? user.subjects : subjects, "Choose a subject");
  fillSelect(assessment, assessments);
  semester.addEventListener("change", loadLevels);
  subject.addEventListener("change", loadLevels);
  level.addEventListener("change", renderGrades);
  assessment.addEventListener("change", renderGrades);
  document.addEventListener("registrychange", loadLevels);

  function loadLevels() {
    const previous = level.value;
    const enrolled = getDatabase().students.filter(student => student.semester === semester.value);
    const available = subject.value ? levels.filter(item => enrolled.some(student => student.level === item)) : [];
    fillSelect(level, available, "Choose a grade level");
    if (available.includes(previous)) level.value = previous;
    level.disabled = available.length === 0;
    renderGrades();
  }

  function renderGrades() {
    table.replaceChildren();
    save.hidden = true;
    showStatus("grade-status", "");
    if (!subject.value || !level.value) {
      addElement(table, "p", level.disabled && subject.value ? "No students are enrolled in this semester." : "Choose a subject and grade level to load the class.");
      return;
    }

    const database = getDatabase();
    const students = database.students.filter(student => student.semester === semester.value && student.level === level.value);
    const body = makeTable(table, ["ID", "Student", "Score / 100"]);
    for (const student of students) {
      const row = addRow(body, [student.id, student.name]);
      const input = addElement(addElement(row, "td"), "input");
      input.type = "number";
      input.min = "0";
      input.max = "100";
      input.step = "0.01";
      input.dataset.student = student.id;
      input.setAttribute("aria-label", "Score for " + student.name);
      const grade = database.grades.find(item => item.student === student.id && matchesSelection(item));
      if (grade) input.value = grade.score;
    }
    save.hidden = students.length === 0;
  }

  function matchesSelection(grade) {
    return grade.semester === semester.value && grade.subject === subject.value && grade.assessment === assessment.value;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const allowedSubjects = user.role === "teacher" ? user.subjects : subjects;
    if (save.hidden || !allowedSubjects.includes(subject.value)) return;

    const database = getDatabase();
    const inputs = [...table.querySelectorAll("input")];
    const eligible = database.students.filter(student => student.semester === semester.value && student.level === level.value);
    if (inputs.some(input => !eligible.some(student => student.id === input.dataset.student))) {
      renderGrades();
      showStatus("grade-status", "The class list changed. Review the updated list and enter scores again.");
      return;
    }

    // Replace scores for this assessment and class while preserving all other records.
    database.grades = database.grades.filter(grade =>
      !matchesSelection(grade) || !inputs.some(input => input.dataset.student === grade.student));
    for (const input of inputs) {
      if (input.value === "") continue;
      database.grades.push({
        student: input.dataset.student,
        semester: semester.value,
        subject: subject.value,
        assessment: assessment.value,
        score: Number(input.value)
      });
    }
    saveDatabase(database);
    showStatus("grade-status", "Grades saved for " + subject.value + " · " + assessment.value + ".");
    document.dispatchEvent(new Event("gradeschange"));
  });

  loadLevels();
}

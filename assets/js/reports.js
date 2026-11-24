/*
CIT2011 | Wolmer's Boys' School | National Heroes Circle, Kingston 4
Group members (full name | student ID | lab day/time)
Shaney Byfield | 2500730 | Lab: Tuesday 3–5 p.m.
Christopher Lewis | 2505274 | Lab: Tuesday 3–5 p.m.
Kelsey James | 2510038 | Lab: Tuesday 3–5 p.m.
Vacketia Smith | 2509363 | Lab: Tuesday 3–5 p.m.
*/
if (authorized) setupReports();

function setupReports() {
  const search = document.getElementById("report-search");
  const semester = document.getElementById("report-semester");
  const level = document.getElementById("report-level");
  const status = document.getElementById("report-status");
  const studentSelect = document.getElementById("report-student");
  const output = document.getElementById("report-output");
  const print = document.getElementById("print-report");

  fillSelect(semester, semesters, "All semesters");
  fillSelect(level, levels, "All grade levels");
  search.addEventListener("input", filterStudents);
  semester.addEventListener("change", filterStudents);
  level.addEventListener("change", filterStudents);
  if (status) status.addEventListener("change", filterStudents);
  studentSelect.addEventListener("change", renderReport);
  document.addEventListener("gradeschange", renderReport);
  window.addEventListener("storage", event => {
    if (event.key === databaseKey) filterStudents();
  });
  print.addEventListener("click", () => window.print());

  function filterStudents() {
    const term = search.value.trim().toLowerCase();
    const database = getDatabase();
    const matches = database.students.filter(student =>
      (student.name.toLowerCase().includes(term) || student.id.toLowerCase().includes(term)) &&
      (!semester.value || student.semester === semester.value) &&
      (!level.value || student.level === level.value) &&
      (!status || !status.value || account(database, student).status === status.value)
    );
    const previous = studentSelect.value;
    fillSelect(studentSelect, studentOptions(matches), matches.length ? "Choose a student" : "No matching students");
    studentSelect.disabled = matches.length === 0;
    if (matches.some(student => student.id === previous)) studentSelect.value = previous;
    else if (matches.length === 1) studentSelect.value = matches[0].id;
    renderReport();
  }

  function renderReport() {
    output.replaceChildren();
    print.hidden = true;
    const database = getDatabase();
    const student = database.students.find(item => item.id === studentSelect.value);
    if (!student) {
      addElement(output, "p", studentSelect.disabled ? "No records match the filters." : "Select a student to view the report.");
      return;
    }

    addElement(output, "h3", student.name + " · " + student.id);
    addElement(output, "p", student.level + " · " + student.semester + " · " + student.email);
    renderAcademicReport(database, student);
    if (user.role === "viewer") renderStatement(database, student);
    print.hidden = false;
  }

  function renderAcademicReport(database, student) {
    const grades = database.grades.filter(grade => grade.student === student.id && grade.semester === student.semester);
    const reportSubjects = user.role === "teacher" ? user.subjects : subjects;
    addElement(output, "h3", "Academic report");
    const body = makeTable(addElement(output, "div", undefined, "table-wrap"), ["Subject", ...assessments, "Average", "Score bar"]);
    const averages = [];

    for (const subject of reportSubjects) {
      const records = grades.filter(grade => grade.subject === subject);
      const scores = assessments.map(assessment => {
        const record = records.find(grade => grade.assessment === assessment);
        return record ? record.score : null;
      });
      const entered = scores.filter(score => score !== null);
      const average = entered.length ? mean(entered) : null;
      const row = addRow(body, [subject, ...scores.map(score => score === null ? "—" : score),
        average === null ? "—" : average.toFixed(1) + "%"]);
      const visual = addElement(row, "td");
      if (average !== null) {
        averages.push(average);
        const meter = addElement(visual, "meter");
        meter.min = 0;
        meter.max = 100;
        meter.value = average;
        meter.setAttribute("aria-label", subject + " average");
      }
    }

    // Give each subject equal weight after averaging its available assessments.
    const summary = averages.length ? mean(averages).toFixed(1) + "%" : "No grades entered";
    addElement(output, "p", "Overall average: " + summary + " · Graded subjects: " + averages.length + "/" + reportSubjects.length);
  }

  function renderStatement(database, student) {
    addElement(output, "h3", "Tuition statement");
    const details = account(database, student);
    const summary = makeTable(addElement(output, "div", undefined, "table-wrap"), ["Tuition", "Payments", "Balance", "Status"]);
    addAccountBadge(addRow(summary, [money(student.tuition), money(details.paid), money(details.balance)]), details.status);
    addElement(output, "h3", "Payments");
    if (!details.payments.length) {
      addElement(output, "p", "No payments recorded.");
      return;
    }
    const payments = makeTable(addElement(output, "div", undefined, "table-wrap"), ["Date", "Amount"]);
    for (const payment of details.payments) addRow(payments, [payment.date, money(payment.cents)]);
  }

  filterStudents();
}

function mean(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

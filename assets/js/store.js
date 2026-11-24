/*
CIT2011 | Wolmer's Boys' School | National Heroes Circle, Kingston 4
Group members (full name | student ID | lab day/time)
Shaney Byfield | 2500730 | Lab: Tuesday 3–5 p.m.
Christopher Lewis | 2505274 | Lab: Tuesday 3–5 p.m.
Kelsey James | 2510038 | Lab: Tuesday 3–5 p.m.
Vacketia Smith | 2509363 | Lab: Tuesday 3–5 p.m.
*/
const databaseKey = "wolmersPortal.v1";
const sessionKey = "wolmersPortal.session";
const semesters = ["2026/27 Semester 1", "2026/27 Semester 2"];
const levels = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
const subjects = ["Mathematics", "Information Technology", "English Language", "Integrated Science"];
const assessments = ["Coursework", "Exam"];
const users = [
  { username: "admin", password: "Admin2026!", role: "admin" },
  { username: "teacher", password: "Teach2026!", role: "teacher", subjects: subjects.slice(0, 2) },
  { username: "viewer", password: "View2026!", role: "viewer" }
];
const rolePages = { admin: "admin.html", teacher: "teacher.html", viewer: "viewer.html" };

function getDatabase() {
  const saved = localStorage.getItem(databaseKey);
  if (saved) {
    return JSON.parse(saved);
  }

  // Student records and staff names below are fictional examples.
  const database = {
    teachers: [
      { name: "Mrs. Morgan", subjects: subjects.slice(0, 2) },
      { name: "Mr. Campbell", subjects: [subjects[2]] },
      { name: "Ms. Grant", subjects: [subjects[3]] }
    ],
    students: [
      { id: "S1001", name: "Andre Brown", email: "andre@example.com", level: levels[0], semester: semesters[0], tuition: 4500000 },
      { id: "S1002", name: "Jordan Clarke", email: "jordan@example.com", level: levels[0], semester: semesters[0], tuition: 4500000 },
      { id: "S1003", name: "Micah Wilson", email: "micah@example.com", level: levels[1], semester: semesters[1], tuition: 4500000 }
    ],
    grades: [
      { student: "S1001", semester: semesters[0], subject: subjects[0], assessment: "Coursework", score: 86 },
      { student: "S1001", semester: semesters[0], subject: subjects[0], assessment: "Exam", score: 92 },
      { student: "S1001", semester: semesters[0], subject: subjects[1], assessment: "Exam", score: 91 }
    ],
    payments: [
      { student: "S1001", cents: 4500000, date: "2026-09-10" },
      { student: "S1002", cents: 2000000, date: "2026-09-11" }
    ],
    messages: []
  };
  saveDatabase(database);
  return database;
}

function saveDatabase(database) {
  localStorage.setItem(databaseKey, JSON.stringify(database));
}

function currentUser() {
  const username = sessionStorage.getItem(sessionKey);
  return users.find(user => user.username === username);
}

function money(cents) {
  return "J$" + (cents / 100).toLocaleString("en-JM", {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });
}

function account(database, student) {
  const payments = database.payments.filter(payment => payment.student === student.id);
  const paid = payments.reduce((total, payment) => total + payment.cents, 0);
  const balance = student.tuition - paid;
  let status = "Outstanding";
  if (balance === 0) {
    status = student.tuition === 0 ? "Pending" : "Paid";
  } else if (paid > 0) {
    status = "Pending";
  }
  return { paid, balance, status, payments };
}

function addElement(parent, tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  parent.append(element);
  return element;
}

function fillSelect(select, options, firstLabel) {
  select.replaceChildren();
  if (firstLabel) addOption(select, "", firstLabel);
  for (const item of options) {
    if (typeof item === "string") addOption(select, item, item);
    else addOption(select, item.value, item.label);
  }
}

function addOption(select, value, label) {
  const option = addElement(select, "option", label);
  option.value = value;
}

function makeTable(container, headings) {
  container.replaceChildren();
  const table = addElement(container, "table");
  const header = addElement(addElement(table, "thead"), "tr");
  for (const heading of headings) addElement(header, "th", heading).scope = "col";
  return addElement(table, "tbody");
}

function addRow(tableBody, values) {
  const row = addElement(tableBody, "tr");
  for (const value of values) addElement(row, "td", value);
  return row;
}

function showStatus(id, message) {
  document.getElementById(id).textContent = message;
}

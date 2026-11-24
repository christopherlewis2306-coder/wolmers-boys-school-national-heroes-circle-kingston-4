/*
CIT2011 | Wolmer's Boys' School | National Heroes Circle, Kingston 4
Group members (full name | student ID | lab day/time)
Shaney Byfield | 2500730 | Lab: Tuesday 3–5 p.m.
Christopher Lewis | 2505274 | Lab: Tuesday 3–5 p.m.
Kelsey James | 2510038 | Lab: Tuesday 3–5 p.m.
Vacketia Smith | 2509363 | Lab: Tuesday 3–5 p.m.
*/
if (authorized) setupAdmin();

function setupAdmin() {
  const form = document.getElementById("student-form");
  const studentId = form.elements.namedItem("id");
  const studentName = form.elements.namedItem("name");
  const studentEmail = form.elements.namedItem("email");
  const studentLevel = form.elements.namedItem("level");
  const studentSemester = form.elements.namedItem("semester");
  const cohort = document.getElementById("registry-semester");
  const cancel = document.getElementById("cancel-edit");
  const ledgerForm = document.getElementById("ledger-form");
  const ledgerStudent = document.getElementById("ledger-student");
  const ledgerFilter = document.getElementById("ledger-filter");
  let editingId = "";

  fillSelect(studentLevel, levels);
  fillSelect(studentSemester, semesters);
  fillSelect(cohort, semesters, "All semesters");
  cohort.addEventListener("change", renderRegistry);
  ledgerFilter.addEventListener("change", renderLedger);
  cancel.addEventListener("click", clearEditor);

  function clearEditor() {
    editingId = "";
    form.reset();
    studentId.readOnly = false;
    cancel.hidden = true;
    document.getElementById("student-save").textContent = "Register student";
  }

  function editStudent(student) {
    editingId = student.id;
    studentId.value = student.id;
    studentId.readOnly = true;
    studentName.value = student.name;
    studentEmail.value = student.email;
    studentLevel.value = student.level;
    studentSemester.value = student.semester;
    cancel.hidden = false;
    document.getElementById("student-save").textContent = "Update profile";
    studentName.focus();
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const database = getDatabase();
    const name = studentName.value.trim();
    const email = studentEmail.value.trim();
    const id = studentId.value.trim();
    const existing = database.students.find(student => student.id === id);

    if (name.length < 2 || !/^S[0-9]{4}$/.test(id)) {
      showStatus("registry-status", "Enter a valid student ID and full name.");
      return;
    }
    if ((!editingId && existing) || database.students.some(student =>
      student.id !== editingId && student.email.toLowerCase() === email.toLowerCase())) {
      showStatus("registry-status", "A student with that ID or email already exists.");
      return;
    }
    if (editingId && (!existing || id !== editingId)) {
      clearEditor();
      showStatus("registry-status", "That student record is no longer available.");
      return;
    }

    const profile = { id, name, email, level: studentLevel.value, semester: studentSemester.value };
    if (existing) Object.assign(existing, profile);
    else database.students.push({ ...profile, tuition: 0 });

    saveDatabase(database);
    clearEditor();
    refresh();
    showStatus("registry-status", existing ? "Profile updated." : "Student registered.");
  });

  function removeStudent(student) {
    if (!confirm("Delete " + student.name + " and all associated grades and payments?")) return;

    const database = getDatabase();
    // Remove dependent records so IDs may be reused without inheriting old data.
    database.students = database.students.filter(item => item.id !== student.id);
    database.grades = database.grades.filter(item => item.student !== student.id);
    database.payments = database.payments.filter(item => item.student !== student.id);
    saveDatabase(database);
    if (editingId === student.id) clearEditor();
    refresh();
    showStatus("registry-status", "Student removed.");
  }

  function renderRegistry() {
    const students = getDatabase().students.filter(student => !cohort.value || student.semester === cohort.value);
    const container = document.getElementById("student-table");
    const body = makeTable(container, ["ID", "Name", "Email", "Level", "Semester", "Actions"]);
    for (const student of students) {
      const row = addRow(body, [student.id, student.name, student.email, student.level, student.semester]);
      const actions = addElement(addElement(row, "td"), "div", undefined, "actions");
      addElement(actions, "button", "Edit", "secondary").addEventListener("click", () => editStudent(student));
      addElement(actions, "button", "Delete", "danger").addEventListener("click", () => removeStudent(student));
    }
    if (!students.length) addElement(container, "p", "No students match this cohort.");
  }

  ledgerForm.addEventListener("submit", event => {
    event.preventDefault();
    const database = getDatabase();
    const fields = new FormData(ledgerForm);
    const student = database.students.find(item => item.id === fields.get("student"));
    const cents = Math.round(Number(fields.get("amount")) * 100);

    if (!student || cents < 1 || !Number.isFinite(cents)) return;

    const totals = account(database, student);
    if (fields.get("action") === "fee") {
      if (cents < totals.paid) {
        showStatus("ledger-status", "Tuition cannot be lower than payments already received.");
        return;
      }
      student.tuition = cents;
    } else {
      if (cents > totals.balance) {
        showStatus("ledger-status", "This payment exceeds the outstanding balance.");
        return;
      }
      database.payments.push({ student: student.id, cents, date: new Date().toISOString().slice(0, 10) });
    }
    saveDatabase(database);
    ledgerForm.elements.namedItem("amount").value = "";
    renderLedger();
    showStatus("ledger-status", "Transaction saved.");
  });

  function renderLedger() {
    const database = getDatabase();
    const selected = ledgerStudent.value;
    fillSelect(ledgerStudent, studentOptions(database.students), "Choose a student");
    ledgerStudent.value = database.students.some(student => student.id === selected) ? selected : "";

    const totals = [0, 0, 0];
    const ledger = document.getElementById("ledger-table");
    const body = makeTable(ledger, ["Student", "Tuition", "Payments", "Balance", "Status"]);
    let visible = 0;
    for (const student of database.students) {
      const details = account(database, student);
      totals[0] += student.tuition;
      totals[1] += details.paid;
      totals[2] += details.balance;
      if (ledgerFilter.value && details.status !== ledgerFilter.value) continue;
      const row = addRow(body, [student.name + " · " + student.id, money(student.tuition), money(details.paid), money(details.balance)]);
      addAccountBadge(row, details.status);
      visible++;
    }
    if (!visible) addElement(ledger, "p", "No matching accounts.");

    const cards = document.getElementById("ledger-totals");
    cards.replaceChildren();
    const labels = ["Total tuition", "Payments received", "Balance due"];
    for (let index = 0; index < labels.length; index++) {
      const card = addElement(cards, "div", labels[index], "card");
      addElement(card, "strong", money(totals[index]));
    }

    const history = document.getElementById("payment-table");
    const payments = makeTable(history, ["Date", "Student ID", "Payment"]);
    for (const payment of database.payments.slice().reverse()) {
      addRow(payments, [payment.date, payment.student, money(payment.cents)]);
    }
    if (!database.payments.length) addElement(history, "p", "No payments recorded.");
  }

  function refresh() {
    renderRegistry();
    renderLedger();
    document.dispatchEvent(new Event("registrychange"));
  }

  refresh();
}

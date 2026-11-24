/*
CIT2011 | Wolmer's Boys' School | National Heroes Circle, Kingston 4
Group members (full name | student ID | lab day/time)
Shaney Byfield | 2500730 | Lab: Tuesday 3–5 p.m.
Christopher Lewis | 2505274 | Lab: Tuesday 3–5 p.m.
Kelsey James | 2510038 | Lab: Tuesday 3–5 p.m.
Vacketia Smith | 2509363 | Lab: Tuesday 3–5 p.m.
*/
const dashboard = document.querySelector("[data-role]");
const user = currentUser();
const authorized = Boolean(user && user.role === dashboard.dataset.role);

function checkAccess() {
  const signedIn = currentUser();
  if (!signedIn || signedIn.role !== dashboard.dataset.role) {
    dashboard.hidden = true;
    location.replace(signedIn ? rolePages[signedIn.role] : "login.html");
    return;
  }
  dashboard.hidden = false;
}

checkAccess();
// Recheck permissions when a browser restores a dashboard from history.
window.addEventListener("pageshow", checkAccess);
document.getElementById("logout").addEventListener("click", () => {
  dashboard.hidden = true;
  sessionStorage.removeItem(sessionKey);
  location.replace("login.html");
});

function studentOptions(students) {
  return students.map(student => ({
    value: student.id,
    label: student.name + " · " + student.id
  }));
}

function addAccountBadge(row, status) {
  const cell = addElement(row, "td");
  addElement(cell, "span", status, "badge " + status.toLowerCase());
}

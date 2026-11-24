/*
CIT2011 | Wolmer's Boys' School | National Heroes Circle, Kingston 4
Group members (full name | student ID | lab day/time)
Shaney Byfield | 2500730 | Lab: Tuesday 3–5 p.m.
Christopher Lewis | 2505274 | Lab: Tuesday 3–5 p.m.
Kelsey James | 2510038 | Lab: Tuesday 3–5 p.m.
Vacketia Smith | 2509363 | Lab: Tuesday 3–5 p.m.
*/
const loginForm = document.getElementById("login-form");
const signedIn = currentUser();
if (signedIn) location.replace(rolePages[signedIn.role]);

loginForm.addEventListener("submit", event => {
  event.preventDefault();
  const fields = new FormData(loginForm);
  const username = fields.get("username").trim().toLowerCase();
  const user = users.find(item => item.username === username && item.password === fields.get("password"));

  if (!user) {
    showStatus("login-status", "The username or password is incorrect.");
    return;
  }

  sessionStorage.setItem(sessionKey, user.username);
  location.replace(rolePages[user.role]);
});

/*
CIT2011 | Wolmer's Boys' School | National Heroes Circle, Kingston 4
Group members (full name | student ID | lab day/time)
Shaney Byfield | 2500730 | Lab: Tuesday 3–5 p.m.
Christopher Lewis | 2505274 | Lab: Tuesday 3–5 p.m.
Kelsey James | 2510038 | Lab: Tuesday 3–5 p.m.
Vacketia Smith | 2509363 | Lab: Tuesday 3–5 p.m.
*/
const directory = document.getElementById("directory");
if (directory) {
  for (const teacher of getDatabase().teachers) {
    addRow(directory, [teacher.name, teacher.subjects.join(", ")]);
  }
}

const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    const fields = new FormData(contactForm);
    const message = {
      name: fields.get("name").trim(),
      email: fields.get("email").trim(),
      subject: fields.get("subject").trim(),
      message: fields.get("message").trim(),
      date: new Date().toISOString()
    };

    if (message.name.length < 2 || message.subject.length < 3 || message.message.length < 10) {
      showStatus("message-status", "Enter a name, subject and message with enough characters.");
      return;
    }

    const database = getDatabase();
    database.messages.push(message);
    saveDatabase(database);
    contactForm.reset();
    showStatus("message-status", "Your demo message was saved in this browser.");
  });
}

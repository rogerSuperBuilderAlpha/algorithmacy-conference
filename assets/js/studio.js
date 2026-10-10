(function () {
  var STUDIO_MAIL = "roger@algorithmacy.org";
  var form = document.getElementById("desk");
  var line = document.getElementById("desk-line");
  var choreInput = document.getElementById("desk-chore");
  if (!form || !line || !choreInput) return;

  function office() {
    var picked = form.querySelector('input[name="office"]:checked');
    return picked ? picked.value : "owner-run office";
  }

  function chorePhrase() {
    var chore = choreInput.value.trim();
    if (!chore) return "the chore that eats the week";
    return "\u201c" + chore + "\u201d";
  }

  function article(kind) {
    return /^[aeiou]/i.test(kind) ? "an " : "a ";
  }

  function writeLine() {
    var kind = office();
    line.textContent =
      "For " + article(kind) + kind +
      ", we learn how the office works, set agents around " + chorePhrase() +
      ", and an engineer runs them. You prompt the engineer. Setup is $5,000. The month is $1,000.";
  }

  form.addEventListener("input", writeLine);
  form.addEventListener("change", writeLine);

  form.addEventListener("submit", function (event) {
    if (!form.checkValidity()) return;
    event.preventDefault();
    var name = document.getElementById("desk-name").value.trim();
    var business = document.getElementById("desk-business").value.trim();
    var kind = office();
    var chore = choreInput.value.trim();
    var subject = "Studio — " + business;
    var body = [
      line.textContent,
      "",
      "Name: " + name,
      "Business: " + business,
      "Office: " + kind,
      "Chore: " + chore,
      "",
      "If a call is easier than email, say so here."
    ].join("\n");
    window.location.href =
      "mailto:" + STUDIO_MAIL + "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
  });

  writeLine();
})();

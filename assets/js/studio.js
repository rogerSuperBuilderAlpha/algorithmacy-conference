(function () {
  var field = document.querySelector(".studio-field");
  if (field && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    field.querySelectorAll("animate, animateMotion").forEach(function (node) { node.remove(); });
    field.classList.add("is-still");
  }

  var STUDIO_MAIL = "roger@algorithmacy.org";
  var form = document.getElementById("desk-form");
  var line = document.getElementById("desk-line");
  var choreInput = document.getElementById("desk-chore");
  var choreLabel = document.getElementById("desk-chore-label");
  var offices = document.getElementById("desk-offices");
  var mailto = document.getElementById("desk-mailto");
  var status = document.getElementById("desk-status");
  var done = document.getElementById("desk-done");
  var send = document.getElementById("desk-send");
  if (!form || !line || !choreInput || !mailto) return;

  function intent() {
    var picked = form.querySelector('input[name="intent"]:checked');
    return picked ? picked.value : "office";
  }

  function office() {
    var picked = form.querySelector('input[name="office"]:checked');
    return picked ? picked.value : "owner-run office";
  }

  function field(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function article(kind) {
    return /^[aeiou]/i.test(kind) ? "an " : "a ";
  }

  function officeLabel() {
    var kind = article(office()) + office();
    return kind.charAt(0).toUpperCase() + kind.slice(1);
  }

  function writeLine() {
    var chore = choreInput.value.trim();
    if (intent() === "other") {
      line.textContent = chore
        ? "Other work: " + chore + ". No price is listed on this page."
        : "Other work. No price is listed on this page.";
      return;
    }
    line.textContent =
      officeLabel() +
      (chore ? ". Work: " + chore + "." : ".") +
      " $5,000 to set up, then $1,000 a month.";
  }

  function applyIntent() {
    var other = intent() === "other";
    if (offices) offices.disabled = other;
    if (choreLabel) choreLabel.textContent = "The work";
    choreInput.placeholder = other ? "What you want designed or built" : "Intake, follow-ups, chasing documents";
    writeLine();
    writeMailto();
  }

  function mailBody() {
    var name = field("desk-name");
    var email = field("desk-email");
    var business = field("desk-business");
    var chore = choreInput.value.trim();
    var rows = [line.textContent, ""];
    if (name) rows.push("Name: " + name);
    if (email) rows.push("Email: " + email);
    if (business) rows.push("Business: " + business);
    if (intent() === "office") rows.push("Office: " + office());
    if (chore) rows.push("Work: " + chore);
    return rows.join("\n");
  }

  function writeMailto() {
    var business = field("desk-business") || "inquiry";
    var subject = "Studio — " + business;
    mailto.href =
      "mailto:" + STUDIO_MAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(mailBody());
  }

  document.querySelectorAll("[data-intent]").forEach(function (el) {
    el.addEventListener("click", function () {
      var value = el.getAttribute("data-intent");
      var input = form.querySelector('input[name="intent"][value="' + value + '"]');
      if (!input) return;
      input.checked = true;
      applyIntent();
      window.setTimeout(function () {
        var name = document.getElementById("desk-name");
        if (name) name.focus({ preventScroll: true });
      }, 350);
    });
  });

  form.addEventListener("input", function () {
    writeLine();
    writeMailto();
  });
  form.addEventListener("change", applyIntent);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (status) {
      status.hidden = true;
      status.textContent = "";
    }
    if (send) send.disabled = true;

    var payload = {
      intent: intent(),
      name: field("desk-name"),
      email: field("desk-email"),
      business: field("desk-business"),
      chore: choreInput.value.trim(),
      website: (form.querySelector('[name="website"]') || {}).value || ""
    };
    if (payload.intent === "office") payload.office = office();

    fetch("/api/studio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { ok: res.ok, data: data };
      });
    }).then(function (result) {
      if (!result.ok) throw new Error((result.data && result.data.error) || "We could not send that. Use the email link, or try again.");
      form.hidden = true;
      if (done) {
        done.hidden = false;
        var title = document.getElementById("desk-done-title");
        if (title) title.focus();
      }
    }).catch(function (err) {
      if (send) send.disabled = false;
      if (!status) return;
      status.hidden = false;
      status.textContent = err && err.message ? err.message : "We could not send that. Use the email link, or try again.";
    });
  });

  applyIntent();
})();

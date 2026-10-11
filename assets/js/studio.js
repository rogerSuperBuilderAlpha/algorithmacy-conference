(function () {
  var field = document.querySelector(".studio-field");
  if (field && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    field.querySelectorAll("animate, animateMotion").forEach(function (node) { node.remove(); });
    field.classList.add("is-still");
  }

  var form = document.getElementById("desk-form");
  var line = document.getElementById("desk-line");
  var messageInput = document.getElementById("desk-message");
  var messageLabel = document.getElementById("desk-message-label");
  var offices = document.getElementById("desk-offices");
  var status = document.getElementById("desk-status");
  var done = document.getElementById("desk-done");
  var send = document.getElementById("desk-send");
  var terms = document.getElementById("desk-terms");
  var started = document.getElementById("desk-started");
  if (!form || !line || !messageInput) return;

  if (started) started.value = String(Date.now());

  function intent() {
    var picked = form.querySelector('input[name="intent"]:checked');
    return picked ? picked.value : "office";
  }

  function office() {
    var picked = form.querySelector('input[name="office"]:checked');
    return picked ? picked.value : "owner-run office";
  }

  function fieldValue(id) {
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

  function preview(text) {
    var clean = text.replace(/\s+/g, " ").trim();
    if (clean.length > 140) return clean.slice(0, 137) + "…";
    return clean;
  }

  function writeLine() {
    var message = preview(messageInput.value);
    if (intent() === "other") {
      line.textContent = message
        ? "Other work: " + message + ". No price is listed on this page."
        : "Other work. No price is listed on this page.";
      return;
    }
    line.textContent =
      officeLabel() +
      (message ? ". Work: " + message + "." : ".") +
      " $5,000 to set up, then $1,000 a month.";
  }

  function applyIntent() {
    var other = intent() === "other";
    if (offices) offices.disabled = other;
    if (messageLabel) messageLabel.textContent = "The chore or message";
    messageInput.placeholder = other ? "What you want designed or built" : "Intake, follow-ups, chasing documents";
    writeLine();
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

  form.addEventListener("input", writeLine);
  form.addEventListener("change", applyIntent);

  function showError(message) {
    if (send) send.disabled = false;
    if (!status) return;
    status.hidden = false;
    status.textContent = message;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (terms) terms.setCustomValidity("");
    if (terms && !terms.checked) {
      terms.setCustomValidity("Please agree to the Terms of Service and Privacy Policy.");
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      if (terms) terms.setCustomValidity("");
      return;
    }
    if (terms) terms.setCustomValidity("");
    if (status) {
      status.hidden = true;
      status.textContent = "";
    }
    if (send) {
      send.disabled = true;
      send.textContent = "Sending…";
    }

    var payload = {
      intent: intent(),
      name: fieldValue("desk-name"),
      business: fieldValue("desk-business"),
      email: fieldValue("desk-email"),
      phone: fieldValue("desk-phone"),
      message: messageInput.value.trim(),
      terms: !!(terms && terms.checked),
      started: started ? Number(started.value) : 0,
      hp_field: (form.querySelector('[name="hp_field"]') || {}).value || ""
    };
    if (payload.intent === "office") payload.office = office();

    fetch("/api/studio", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { ok: res.ok, data: data };
      });
    }).then(function (result) {
      if (!result.ok || !result.data || !result.data.ok) {
        throw new Error((result.data && result.data.error) || "We could not send that. Email topanga@algorithmacy.org and we will reply.");
      }
      form.hidden = true;
      if (done) {
        done.hidden = false;
        var title = document.getElementById("desk-done-title");
        if (title) title.focus();
      }
    }).catch(function (err) {
      if (send) send.textContent = "Send";
      showError(err && err.message ? err.message : "We could not send that. Email topanga@algorithmacy.org and we will reply.");
    });
  });

  applyIntent();
})();

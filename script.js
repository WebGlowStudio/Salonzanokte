(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#glavni-meni");
  var label = toggle.querySelector(".sr-only");
  var navLinks = nav.querySelectorAll("a");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    label.textContent = open ? "Zatvori meni" : "Otvori meni";
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") !== "true";
    setMenu(open);
    if (open) {
      var first = nav.querySelector("a");
      if (first) first.focus();
    }
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.matchMedia("(max-width: 1079px)").matches) setMenu(false);
    });
  });

  nav.addEventListener("keydown", function (event) {
    if (event.key !== "Tab" || toggle.getAttribute("aria-expanded") !== "true") return;
    var items = Array.prototype.slice.call(nav.querySelectorAll("a"));
    items.push(toggle);
    var index = items.indexOf(document.activeElement);
    if (index === -1) return;
    var next = event.shiftKey ? index - 1 : index + 1;
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    event.preventDefault();
    items[next].focus();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      toggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1080 && toggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
    }
  });

  var hand = document.querySelector("#hand");
  var chosen = document.querySelector("#chosen");
  document.querySelectorAll('input[name="nijansa"]').forEach(function (input) {
    input.addEventListener("change", function () {
      if (!input.checked) return;
      hand.style.setProperty("--polish", input.getAttribute("data-color"));
      chosen.textContent = "Izabrana nijansa: " + input.value;
    });
  });

  var form = document.querySelector("#booking-form");
  var confirmBox = document.querySelector("#confirm");
  var dateInput = document.querySelector("#datum");

  function todayISO() {
    var now = new Date();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
  }

  dateInput.min = todayISO();

  var fields = [
    { id: "ime", test: function (value) { return value.trim().length >= 2; }, message: "Unesite ime i prezime." },
    { id: "telefon", test: function (value) { return (value.match(/\d/g) || []).length >= 8; }, message: "Unesite broj telefona, bar osam cifara." },
    { id: "usluga", test: function (value) { return value !== ""; }, message: "Izaberite uslugu." },
    { id: "datum", test: function (value) { return value !== "" && value >= todayISO(); }, message: "Izaberite današnji ili neki naredni datum." },
    { id: "vreme", test: function (value) { return value !== ""; }, message: "Izaberite vreme." }
  ];

  function clearErrors() {
    fields.forEach(function (field) {
      var input = document.getElementById(field.id);
      var error = document.getElementById("err-" + field.id);
      input.removeAttribute("aria-invalid");
      input.closest(".field").classList.remove("is-invalid");
      error.hidden = true;
      error.textContent = "";
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors();
    var firstInvalid = null;
    var data = { datum: document.getElementById("datum").value };

    fields.forEach(function (field) {
      var input = document.getElementById(field.id);
      var value = input.value;
      data[field.id] = value;
      var sunday = false;
      if (field.id === "datum" && value) {
        var picked = new Date(value + "T00:00:00");
        sunday = picked.getDay() === 0;
      }
      var timeNote = "";
      if (field.id === "vreme" && value && data.datum) {
        var day = new Date(data.datum + "T00:00:00").getDay();
        var minutes = toMinutes(value);
        if (day === 6 && (minutes < 10 * 60 || minutes > 17 * 60)) {
          timeNote = "Subotom radimo od 10:00 do 17:00.";
        }
      }
      var ok = field.test(value) && !sunday && !timeNote;
      if (!ok) {
        var error = document.getElementById("err-" + field.id);
        error.textContent = sunday
          ? "Nedeljom ne radimo. Izaberite drugi dan."
          : (timeNote || field.message);
        error.hidden = false;
        input.setAttribute("aria-invalid", "true");
        input.closest(".field").classList.add("is-invalid");
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    var name = data.ime.trim();
    confirmBox.innerHTML = "";
    var title = document.createElement("h3");
    title.textContent = "Hvala, " + name + ".";
    var lead = document.createElement("p");
    lead.textContent = "Zahtev za " + data.usluga.toLowerCase() + " (" + formatDate(data.datum) + ", " + data.vreme + ") ostaje samo na ovom ekranu.";
    var note = document.createElement("p");
    note.textContent = "Pošto je ovo demo sajt, termin nije zakazan i poruka nije poslata. U pravom salonu bismo vam se javili da potvrdimo vreme.";
    var again = document.createElement("button");
    again.type = "button";
    again.className = "btn btn-ghost";
    again.textContent = "Novi primer";
    again.addEventListener("click", function () {
      confirmBox.hidden = true;
      confirmBox.innerHTML = "";
      form.hidden = false;
      form.reset();
      dateInput.min = todayISO();
      document.getElementById("ime").focus();
    });
    title.tabIndex = -1;
    confirmBox.append(title, lead, note, again);
    form.hidden = true;
    confirmBox.hidden = false;
    title.focus();
  });

  function toMinutes(value) {
    var parts = value.split(":");
    return Number(parts[0]) * 60 + Number(parts[1]);
  }

  function formatDate(iso) {
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + ". " + parts[1] + ". " + parts[0] + ".";
  }
})();

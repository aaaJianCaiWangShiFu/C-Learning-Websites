/* ============================================================
   main.js — theme toggle, chapter progress tracking, nav state
   ============================================================ */

(function () {
  "use strict";

  var STORAGE_KEY = "cpp101-progress-v1";
  var THEME_KEY = "cpp101-theme";

  var CHAPTERS = [
    { id: "01", file: "01-introduction.html", title: "How C++ Programs Work" },
    { id: "02", file: "02-variables-and-types.html", title: "Variables, Types & Memory" },
    { id: "03", file: "03-operators.html", title: "Operators & Expressions" },
    { id: "04", file: "04-input-output.html", title: "Input & Output" },
    { id: "05", file: "05-conditionals.html", title: "Making Decisions" },
    { id: "06", file: "06-loops.html", title: "Loops" },
    { id: "07", file: "07-functions.html", title: "Functions & the Call Stack" },
    { id: "08", file: "08-arrays.html", title: "Arrays & Vectors" },
    { id: "09", file: "09-strings.html", title: "Working with Strings" },
    { id: "10", file: "10-pointers-references.html", title: "Pointers & References" },
    { id: "11", file: "11-structs-classes.html", title: "Structs, Classes & Objects" },
    { id: "12", file: "12-recursion.html", title: "Recursion" }
  ];

  window.CPP101_CHAPTERS = CHAPTERS;

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function setProgress(p) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (e) {
      /* storage unavailable (private mode etc.) — silently ignore */
    }
  }

  window.CPP101_getProgress = getProgress;

  function applyTheme(theme) {
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved) applyTheme(saved);

    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    updateToggleIcon(btn);
    btn.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      var effectiveDark = current ? current === "dark" : prefersDark;
      var next = effectiveDark ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      updateToggleIcon(btn);
    });
  }

  function updateToggleIcon(btn) {
    var current = document.documentElement.getAttribute("data-theme");
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var effectiveDark = current ? current === "dark" : prefersDark;
    btn.textContent = effectiveDark ? "☀" : "☾";
    btn.setAttribute("aria-label", effectiveDark ? "Switch to light theme" : "Switch to dark theme");
  }

  function initChapterNav() {
    var nav = document.querySelector("[data-chapter-nav]");
    if (!nav) return;
    var progress = getProgress();
    var currentFile = (window.location.pathname.split("/").pop() || "");
    var list = document.createElement("ol");

    CHAPTERS.forEach(function (ch) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = ch.file;
      a.textContent = ch.id + ". " + ch.title;
      if (progress[ch.id]) a.classList.add("done");
      if (currentFile === ch.file) a.classList.add("current");
      li.appendChild(a);
      list.appendChild(li);
    });
    nav.appendChild(list);
  }

  function initCompleteToggle() {
    var checkbox = document.getElementById("mark-complete");
    if (!checkbox) return;
    var chapterId = checkbox.getAttribute("data-chapter-id");
    var progress = getProgress();
    checkbox.checked = !!progress[chapterId];
    checkbox.addEventListener("change", function () {
      var p = getProgress();
      if (checkbox.checked) {
        p[chapterId] = true;
      } else {
        delete p[chapterId];
      }
      setProgress(p);
    });
  }

  function initIndexProgress() {
    var bar = document.querySelector("[data-progress-bar]");
    if (!bar) return;
    var progress = getProgress();
    var done = CHAPTERS.filter(function (c) { return progress[c.id]; }).length;
    var pct = Math.round((done / CHAPTERS.length) * 100);
    var fill = bar.querySelector("span");
    if (fill) fill.style.width = pct + "%";
    var label = document.querySelector("[data-progress-label]");
    if (label) label.textContent = done + " of " + CHAPTERS.length + " chapters complete (" + pct + "%)";

    document.querySelectorAll("[data-chapter-card]").forEach(function (card) {
      var id = card.getAttribute("data-chapter-card");
      if (progress[id]) {
        var badge = card.querySelector(".check");
        if (badge) badge.textContent = "✓ complete";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initChapterNav();
    initCompleteToggle();
    initIndexProgress();
  });
})();

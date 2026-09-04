/* ============================================================
   quiz.js — generic, declarative, auto-graded exercise engine.

   Predict-the-output text quiz:
     <div class="quiz predict-output" data-answer="Hello, World!">
       <div class="quiz-row">
         <input type="text" placeholder="Type the exact output...">
         <button class="btn btn-sm check-btn">Check</button>
       </div>
       <div class="quiz-feedback"></div>
     </div>

   Multiple choice quiz:
     <div class="quiz mcq" data-correct="1">
       <div class="mcq-options">
         <button data-choice="0">...</button>
         <button data-choice="1">...</button>
       </div>
       <div class="quiz-feedback"></div>
     </div>
   ============================================================ */

(function () {
  "use strict";

  function normalize(s) {
    return s.replace(/\s+/g, " ").trim();
  }

  function initPredictOutput(el) {
    var answer = el.getAttribute("data-answer") || "";
    var caseSensitive = el.hasAttribute("data-case-sensitive");
    var input = el.querySelector("input[type='text']");
    var btn = el.querySelector(".check-btn");
    var feedback = el.querySelector(".quiz-feedback");
    var attempts = 0;

    function check() {
      var got = normalize(input.value);
      var want = normalize(answer);
      if (!caseSensitive) {
        got = got.toLowerCase();
        want = want.toLowerCase();
      }
      attempts++;
      if (got === want) {
        feedback.textContent = "✓ Correct! That's exactly what the program prints.";
        feedback.className = "quiz-feedback correct";
        input.setAttribute("disabled", "true");
        btn.setAttribute("disabled", "true");
      } else if (attempts >= 3) {
        feedback.textContent = "✗ Not quite. The correct output is: " + answer;
        feedback.className = "quiz-feedback incorrect";
      } else {
        feedback.textContent = "✗ Not quite — try again (attempt " + attempts + " of 3).";
        feedback.className = "quiz-feedback incorrect";
      }
    }

    btn.addEventListener("click", check);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); check(); }
    });
  }

  function initMcq(el) {
    var correct = el.getAttribute("data-correct");
    var buttons = Array.prototype.slice.call(el.querySelectorAll(".mcq-options button"));
    var feedback = el.querySelector(".quiz-feedback");
    var answered = false;

    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        if (answered) return;
        var choice = b.getAttribute("data-choice");
        if (choice === correct) {
          answered = true;
          b.classList.add("correct");
          buttons.forEach(function (x) { x.setAttribute("disabled", "true"); });
          feedback.textContent = "✓ Correct!";
          feedback.className = "quiz-feedback correct";
        } else {
          b.classList.add("incorrect");
          b.setAttribute("disabled", "true");
          feedback.textContent = "✗ Not quite — try one of the other options.";
          feedback.className = "quiz-feedback incorrect";
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".quiz.predict-output").forEach(initPredictOutput);
    document.querySelectorAll(".quiz.mcq").forEach(initMcq);
  });
})();

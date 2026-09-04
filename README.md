# C++ From Zero

A free, static, no-build website that teaches C++ to complete beginners.

- **12 chapters**, from "what is a program?" through functions, arrays,
  strings, pointers/references, structs/classes, and recursion.
- Every chapter pairs plain-language explanations with **interactive
  animated demos** (step/play/reset controls) built from a small reusable
  toolkit — memory boxes, a call stack visualizer, pointer diagrams, loop
  tracks, and if/else flow branches.
- Each chapter ends with **auto-graded practice**: predict-the-output
  quizzes, multiple choice checks, and open-ended coding exercises with a
  toggleable sample solution.
- Progress is tracked per-chapter via `localStorage` (nothing is sent
  anywhere) and shown as a progress bar on the home page.

## Running locally

No build step or dependencies — it's plain HTML/CSS/JS. Serve the folder
with any static file server and open it in a browser, e.g.:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000/`.

## Structure

```
index.html              landing page / course overview
getting-started.html    compiler setup instructions
css/style.css           shared design system (light + dark theme)
js/main.js              theme toggle, chapter nav, progress tracking
js/highlight.js         self-contained C++ syntax highlighter
js/quiz.js              auto-graded predict-output / multiple-choice engine
js/animations.js        reusable animation widgets (memory boxes, call
                         stack, pointer arrows, loop track, flow branch)
chapters/01-...12-...   the twelve lesson pages
```

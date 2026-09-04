/* ============================================================
   animations.js — small reusable visualization toolkit used to
   build the animated demos embedded in each chapter.

   Everything lives under the global CPP101 namespace. Each
   chapter page builds a demo by rendering one of the widgets
   below into a `.demo-stage` element and then wiring a sequence
   of "steps" through CPP101.stepper() so the learner can press
   Step / Play / Reset and watch state change incrementally.
   ============================================================ */

var CPP101 = window.CPP101 || {};

(function (ns) {
  "use strict";

  /* ---------------- generic step player ----------------
     config = {
       root: element containing [data-role="prev|next|play|reset"] buttons,
       log: element to show a text log line,
       steps: [{ label: string, run: function(ctx) }],
       reset: function(ctx)  // called to restore initial state
       ctx: arbitrary state object passed to run()/reset()
     }
  ------------------------------------------------------- */
  ns.stepper = function (config) {
    var index = -1;
    var timer = null;
    var ctx = config.ctx || {};

    function updateLog() {
      if (!config.log) return;
      if (index < 0) {
        config.log.textContent = "Press “Step” or “Play” to begin.";
      } else {
        config.log.textContent =
          "Step " + (index + 1) + " / " + config.steps.length + " — " + config.steps[index].label;
      }
    }

    function next() {
      if (index >= config.steps.length - 1) {
        stopPlay();
        return false;
      }
      index++;
      config.steps[index].run(ctx);
      updateLog();
      return true;
    }

    function reset() {
      stopPlay();
      index = -1;
      if (config.reset) config.reset(ctx);
      updateLog();
    }

    function stopPlay() {
      if (timer) { clearInterval(timer); timer = null; }
      var playBtn = config.root.querySelector('[data-role="play"]');
      if (playBtn) playBtn.textContent = "▶ Play";
    }

    function play() {
      var playBtn = config.root.querySelector('[data-role="play"]');
      if (timer) { stopPlay(); return; }
      if (index >= config.steps.length - 1) reset();
      if (playBtn) playBtn.textContent = "⏸ Pause";
      timer = setInterval(function () {
        if (!next()) stopPlay();
      }, 1100);
    }

    var prevBtn = config.root.querySelector('[data-role="prev"]');
    var nextBtn = config.root.querySelector('[data-role="next"]');
    var playBtn = config.root.querySelector('[data-role="play"]');
    var resetBtn = config.root.querySelector('[data-role="reset"]');

    if (nextBtn) nextBtn.addEventListener("click", function () { stopPlay(); next(); });
    if (playBtn) playBtn.addEventListener("click", play);
    if (resetBtn) resetBtn.addEventListener("click", reset);
    if (prevBtn) prevBtn.style.display = "none";

    reset();
    return { next: next, reset: reset, ctx: ctx };
  };

  /* ---------------- memory boxes ----------------
     vars = [{ id, name, type, value, pointer(optional bool) }]
  ------------------------------------------------ */
  ns.renderBoxes = function (stage, vars) {
    stage.innerHTML = "";
    var map = {};
    vars.forEach(function (v) {
      var root = document.createElement("div");
      root.className = "mbox" + (v.pointer ? " pointer" : "");
      root.id = stage.id + "-box-" + v.id;

      var cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = v.value === undefined || v.value === null || v.value === "" ? "?" : v.value;
      root.appendChild(cell);

      var name = document.createElement("div");
      name.className = "name";
      name.textContent = v.name + (v.type ? " : " + v.type : "");
      root.appendChild(name);

      if (v.addr) {
        var addr = document.createElement("div");
        addr.className = "addr";
        addr.textContent = v.addr;
        root.appendChild(addr);
      }

      stage.appendChild(root);
      map[v.id] = { root: root, cell: cell };
    });
    return map;
  };

  ns.setBoxValue = function (map, id, value, flash) {
    var entry = map[id];
    if (!entry) return;
    entry.cell.textContent = value;
    if (flash !== false) {
      entry.root.classList.add("flash");
      setTimeout(function () { entry.root.classList.remove("flash"); }, 650);
    }
  };

  /* ---------------- arrow overlay (for pointer diagrams) ---------------- */
  ns.makeArrowLayer = function (stage) {
    stage.style.position = "relative";
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "arrow-svg");
    svg.style.position = "absolute";
    svg.style.left = "0";
    svg.style.top = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    stage.appendChild(svg);

    var marker = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    marker.innerHTML =
      '<marker id="arrowhead-' + Math.random().toString(36).slice(2) +
      '" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><polygon points="0 0, 7 3, 0 6" /></marker>';
    var markerId = marker.querySelector("marker").id;
    marker.querySelector("polygon").setAttribute("fill", "var(--accent)");
    svg.appendChild(marker);

    function draw(fromEl, toEl) {
      var stageRect = stage.getBoundingClientRect();
      var a = fromEl.getBoundingClientRect();
      var b = toEl.getBoundingClientRect();
      var x1 = a.left + a.width / 2 - stageRect.left;
      var y1 = a.top - stageRect.top - 4;
      var x2 = b.left + b.width / 2 - stageRect.left;
      var y2 = b.bottom - stageRect.top + 4;
      var midY = Math.min(y1, y2) - 26;

      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      var d = "M " + x1 + " " + y1 + " C " + x1 + " " + midY + ", " + x2 + " " + midY + ", " + x2 + " " + y2;
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "var(--accent)");
      path.setAttribute("stroke-width", "2.5");
      path.setAttribute("marker-end", "url(#" + markerId + ")");
      svg.appendChild(path);
      return path;
    }

    function clear() {
      svg.querySelectorAll("path").forEach(function (p) { p.remove(); });
    }

    return { draw: draw, clear: clear };
  };

  /* ---------------- call stack ---------------- */
  ns.makeStack = function (stage) {
    stage.innerHTML = "";
    var col = document.createElement("div");
    col.className = "stack-col";
    stage.appendChild(col);
    var frames = [];

    function push(label) {
      var frame = document.createElement("div");
      frame.className = "stack-frame";
      frame.textContent = label;
      col.appendChild(frame);
      frames.push(frame);
      return frame;
    }

    function pop() {
      var frame = frames.pop();
      if (!frame) return;
      frame.style.transition = "opacity .2s ease, transform .2s ease";
      frame.style.opacity = "0";
      frame.style.transform = "translateY(-8px) scale(0.95)";
      setTimeout(function () { frame.remove(); }, 200);
    }

    function clear() {
      frames.forEach(function (f) { f.remove(); });
      frames = [];
    }

    return { push: push, pop: pop, clear: clear, frames: frames };
  };

  /* ---------------- loop track ---------------- */
  ns.renderTrack = function (stage, n, labelFn) {
    stage.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "track";
    var slots = [];
    for (var i = 0; i < n; i++) {
      var slot = document.createElement("div");
      slot.className = "slot";
      slot.textContent = labelFn ? labelFn(i) : i;
      wrap.appendChild(slot);
      slots.push(slot);
    }
    stage.appendChild(wrap);

    function activate(i) {
      slots.forEach(function (s, idx) {
        s.classList.toggle("active", idx === i);
        if (idx < i) s.classList.add("past");
      });
    }
    function reset() {
      slots.forEach(function (s) { s.classList.remove("active", "past"); });
    }
    return { activate: activate, reset: reset, slots: slots };
  };

  /* ---------------- if/else flow branch ---------------- */
  ns.renderFlowBranch = function (stage, opts) {
    stage.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.alignItems = "center";
    wrap.style.gap = "1rem";

    var diamond = document.createElement("div");
    diamond.className = "flow-diamond";
    var span = document.createElement("span");
    span.textContent = opts.condition;
    diamond.appendChild(span);
    wrap.appendChild(diamond);

    var branches = document.createElement("div");
    branches.style.display = "flex";
    branches.style.gap = "2rem";

    var trueB = document.createElement("div");
    trueB.className = "flow-branch";
    trueB.innerHTML = '<div class="path-box">' + opts.trueLabel + "</div><span>true →</span>";

    var falseB = document.createElement("div");
    falseB.className = "flow-branch";
    falseB.innerHTML = '<div class="path-box">' + opts.falseLabel + "</div><span>false →</span>";

    branches.appendChild(trueB);
    branches.appendChild(falseB);
    wrap.appendChild(branches);
    stage.appendChild(wrap);

    function evaluate(result) {
      diamond.classList.remove("true", "false");
      trueB.classList.remove("taken");
      falseB.classList.remove("taken");
      diamond.classList.add(result ? "true" : "false");
      if (result) trueB.classList.add("taken");
      else falseB.classList.add("taken");
    }
    function reset() {
      diamond.classList.remove("true", "false");
      trueB.classList.remove("taken");
      falseB.classList.remove("taken");
    }
    return { evaluate: evaluate, reset: reset };
  };
})(CPP101);

window.CPP101 = CPP101;

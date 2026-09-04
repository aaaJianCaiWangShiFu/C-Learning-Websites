/* ============================================================
   highlight.js — small self-contained C++ syntax highlighter.
   No external dependency: scans <pre.code-block><code> blocks
   and wraps tokens in <span class="tok-*"> for CSS styling.
   ============================================================ */

(function () {
  "use strict";

  var KEYWORDS = (
    "if else for while do switch case break continue return " +
    "class struct public private protected virtual override " +
    "namespace using new delete try catch throw const static " +
    "void true false nullptr this template typename sizeof " +
    "enum default explicit friend operator inline constexpr " +
    "auto goto"
  ).split(" ");

  var TYPES = (
    "int double float char bool long short unsigned signed " +
    "string vector array map set pair size_t wchar_t"
  ).split(" ");

  var kwRe = new RegExp("^(" + KEYWORDS.join("|") + ")$");
  var typeRe = new RegExp("^(" + TYPES.join("|") + ")$");

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function highlight(src) {
    var out = "";
    var i = 0;
    var n = src.length;

    while (i < n) {
      var ch = src[i];

      /* line comment */
      if (ch === "/" && src[i + 1] === "/") {
        var end = src.indexOf("\n", i);
        if (end === -1) end = n;
        out += '<span class="tok-com">' + escapeHtml(src.slice(i, end)) + "</span>";
        i = end;
        continue;
      }

      /* block comment */
      if (ch === "/" && src[i + 1] === "*") {
        var endB = src.indexOf("*/", i + 2);
        endB = endB === -1 ? n : endB + 2;
        out += '<span class="tok-com">' + escapeHtml(src.slice(i, endB)) + "</span>";
        i = endB;
        continue;
      }

      /* preprocessor directive */
      if (ch === "#") {
        var endP = src.indexOf("\n", i);
        if (endP === -1) endP = n;
        out += '<span class="tok-preproc">' + escapeHtml(src.slice(i, endP)) + "</span>";
        i = endP;
        continue;
      }

      /* string literal */
      if (ch === '"') {
        var j = i + 1;
        while (j < n && src[j] !== '"') {
          if (src[j] === "\\") j++;
          j++;
        }
        j = Math.min(j + 1, n);
        out += '<span class="tok-str">' + escapeHtml(src.slice(i, j)) + "</span>";
        i = j;
        continue;
      }

      /* char literal */
      if (ch === "'") {
        var k = i + 1;
        while (k < n && src[k] !== "'") {
          if (src[k] === "\\") k++;
          k++;
        }
        k = Math.min(k + 1, n);
        out += '<span class="tok-str">' + escapeHtml(src.slice(i, k)) + "</span>";
        i = k;
        continue;
      }

      /* number */
      if (/[0-9]/.test(ch)) {
        var m = i;
        while (m < n && /[0-9.xXa-fA-F]/.test(src[m])) m++;
        out += '<span class="tok-num">' + escapeHtml(src.slice(i, m)) + "</span>";
        i = m;
        continue;
      }

      /* identifier / keyword / type / function-call */
      if (/[A-Za-z_]/.test(ch)) {
        var w = i;
        while (w < n && /[A-Za-z0-9_]/.test(src[w])) w++;
        var word = src.slice(i, w);
        var rest = src.slice(w);
        if (kwRe.test(word)) {
          out += '<span class="tok-kw">' + word + "</span>";
        } else if (typeRe.test(word)) {
          out += '<span class="tok-type">' + word + "</span>";
        } else if (/^\s*\(/.test(rest)) {
          out += '<span class="tok-func">' + word + "</span>";
        } else {
          out += escapeHtml(word);
        }
        i = w;
        continue;
      }

      out += escapeHtml(ch);
      i++;
    }

    return out;
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("pre.code-block > code").forEach(function (block) {
      var raw = block.textContent;
      block.innerHTML = highlight(raw);
    });
  });
})();

/* USDT Deliver — shortcode behaviour (vanilla JS, no dependencies) */
(function () {
  "use strict";

  var HASH_RE = /^0x[0-9a-fA-F]{64}$/;
  var MSG = {
    format: "That does not look like a transaction hash. It should start with <b>0x</b> and be 66 characters long."
  };

  function cfg() {
    return window.UsdtDeliver || {};
  }

  function setStatus(box, kind, html) {
    box.innerHTML = '<p class="s-' + kind + '">' + html + "</p>";
  }

  function legacyCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch (e) {}
    document.body.removeChild(ta);
  }

  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        legacyCopy(text, done);
      });
    } else {
      legacyCopy(text, done);
    }
  }

  function wire(root) {
    var copyBtn = root.querySelector(".usdt-deliver__copy");
    var addr = root.querySelector(".usdt-deliver__addr code");
    var form = root.querySelector(".usdt-deliver__form");
    var input = root.querySelector(".usdt-deliver__tx");
    var go = root.querySelector(".usdt-deliver__go");
    var status = root.querySelector(".usdt-deliver__status");
    if (!form || !input || !go || !status) return;

    var i18n = cfg().i18n || {};

    if (copyBtn && addr) {
      copyBtn.addEventListener("click", function () {
        copyText(addr.textContent.trim(), function () {
          var was = copyBtn.textContent;
          copyBtn.textContent = i18n.copied || "Copied ✓";
          setTimeout(function () {
            copyBtn.textContent = i18n.copy || was;
          }, 1600);
        });
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var tx = (input.value || "").trim();
      if (!HASH_RE.test(tx)) {
        setStatus(status, "err", MSG.format);
        return;
      }

      go.disabled = true;
      var label = go.textContent;
      go.textContent = i18n.work || "Checking the chain…";
      setStatus(status, "work", "Reading transaction <code>" + tx.slice(0, 14) + "…</code> on Ethereum…");

      var body = {
        tx: tx.toLowerCase(),
        product: root.getAttribute("data-product") || "",
        price: root.getAttribute("data-price") || "0",
        file: root.getAttribute("data-file") || "",
        token: root.getAttribute("data-token") || ""
      };

      fetch(cfg().rest, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body)
      })
        .then(function (r) {
          return r.json().then(function (j) {
            return { status: r.status, json: j };
          });
        })
        .then(function (res) {
          go.disabled = false;
          go.textContent = label;
          var j = res.json || {};
          if (j.ok && j.url) {
            setStatus(status, "ok", j.msg || "✓ Payment confirmed.");
            var a = document.createElement("a");
            a.className = "usdt-deliver__dl";
            a.href = j.url;
            a.textContent = "Download your file ✓";
            status.appendChild(a);
            return;
          }
          setStatus(status, j.slug === "wait" ? "wait" : "err", j.msg || "Something went wrong. Please try again.");
        })
        .catch(function () {
          go.disabled = false;
          go.textContent = label;
          setStatus(status, "err", "Could not reach the server. Please try again in a moment.");
        });
    });
  }

  function boot() {
    var boxes = document.querySelectorAll(".usdt-deliver");
    for (var i = 0; i < boxes.length; i++) wire(boxes[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

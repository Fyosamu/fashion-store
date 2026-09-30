(function () {
  "use strict";
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  if (toggle) toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.querySelectorAll("#navLinks a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("is-open"); });
  });

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  var toast = document.getElementById("toast"), tTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add("is-on");
    clearTimeout(tTimer); tTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 2200);
  }

  var bag = 0, bagEl = document.getElementById("bagCount");
  document.querySelectorAll("[data-buy]").forEach(function (b) {
    b.addEventListener("click", function () {
      bag++; if (bagEl) bagEl.textContent = String(bag);
      var card = b.closest(".prod");
      say((card ? card.querySelector(".prod__name").textContent : "Item") + " added to bag");
    });
  });
  var bagBtn = document.getElementById("bagBtn");
  if (bagBtn) bagBtn.addEventListener("click", function () {
    say(bag ? bag + " item(s) in your bag" : "Your bag is empty");
  });

  var form = document.querySelector("[data-signup]");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault(); var i = form.querySelector("input");
    say("Thanks — check your inbox"); i.value = "";
  });

  var grid = document.querySelector(".grid");
  function sort(mode) {
    if (!grid) return;
    var cards = [].slice.call(grid.children);
    if (mode === "low") cards.sort(function (a, b) { return a.dataset.price - b.dataset.price; });
    else if (mode === "high") cards.sort(function (a, b) { return b.dataset.price - a.dataset.price; });
    else cards.sort(function (a, b) { return (+a.dataset.orig) - (+b.dataset.orig); });
    cards.forEach(function (c) { grid.appendChild(c); });
  }
  if (grid) [].slice.call(grid.children).forEach(function (c, i) { c.dataset.orig = i; });
  var sortEl = document.getElementById("sort");
  if (sortEl) sortEl.addEventListener("change", function () { sort(sortEl.value); });

  var q = document.getElementById("q"), chips = document.getElementById("chips");
  var count = document.getElementById("count"), active = "all";
  function filter() {
    if (!grid) return;
    var term = q ? q.value.trim().toLowerCase() : "";
    var shown = 0;
    [].slice.call(grid.children).forEach(function (c) {
      var okTerm = !term || c.dataset.name.indexOf(term) > -1;
      var cat = (c.querySelector(".prod__cat") || {}).textContent || "";
      var okCat = active === "all" || cat.toLowerCase().indexOf(active) > -1;
      var on = okTerm && okCat;
      c.classList.toggle("is-hidden", !on);
      if (on) shown++;
    });
    if (count) count.textContent = shown + (shown === 1 ? " piece" : " pieces");
  }
  if (q) q.addEventListener("input", filter);
  if (chips) chips.addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    [].slice.call(chips.children).forEach(function (c) { c.classList.remove("is-on"); });
    b.classList.add("is-on"); active = b.dataset.cat; filter();
  });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }
  /* Safety net — never leave content invisible if the observer stalls
     (background tab, unusual browser, throttled paint). */
  setTimeout(function () {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }, 1500);

  var link = location.hash;
  if (link) {
    var target = document.querySelector(link);
    if (target) setTimeout(function () { target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }, 60);
  }
})();

/* ==========================================================
   Terra Ceramics — front-end script (bag, nav, forms)
   ========================================================== */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

/* ---------- year ---------- */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- mobile nav ---------- */
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => navLinks.classList.toggle("is-open"));
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => navLinks.classList.remove("is-open")));
}

/* ---------- toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-show"), 2600);
}

/* ---------- bag (localStorage) ---------- */
const KEY = "terra-ceramics_bag";
let bag = [];
try { bag = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { bag = []; }

function saveBag() {
  try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) {}
  renderBag();
}

function renderBag() {
  const count = bag.reduce((n, i) => n + i.qty, 0);
  const total = bag.reduce((n, i) => n + i.qty * i.price, 0);

  const countEl = $("#bagCount");
  if (countEl) countEl.textContent = count;

  const totalEl = $("#bagTotal");
  if (totalEl) totalEl.textContent = "$" + total;

  const box = $("#drawerItems");
  if (!box) return;

  if (!bag.length) {
    box.innerHTML = '<p class="drawer__empty">Your bag is empty.<br />Discover the new arrivals.</p>';
    return;
  }

  box.innerHTML = bag
    .map(
      (i) => `
      <div class="bag-item" data-id="${i.id}">
        <img src="${i.img}" alt="${i.name}" />
        <div>
          <b>${i.name}</b>
          <span>$${i.price} × ${i.qty}</span>
        </div>
        <button class="rm" title="Remove" data-rm="${i.id}">×</button>
      </div>`
    )
    .join("");

  $$("[data-rm]", box).forEach((btn) =>
    btn.addEventListener("click", () => {
      bag = bag.filter((i) => i.id !== btn.dataset.rm);
      saveBag();
      toast("Removed from bag");
    })
  );
}

function addToBag(product) {
  const found = bag.find((i) => i.id === product.id);
  if (found) found.qty += 1;
  else bag.push({ ...product, qty: 1 });
  saveBag();
  toast(`${product.name} added to bag`);
}

$$(".product").forEach((card) => {
  const btn = $(".product__add", card);
  if (!btn) return;
  btn.addEventListener("click", () =>
    addToBag({
      id: card.dataset.id,
      name: card.dataset.name,
      price: Number(card.dataset.price),
      img: card.dataset.img,
    })
  );
});

/* ---------- drawer open / close ---------- */
const drawer = $("#drawer");
const bagBtn = $("#bagBtn");
if (drawer && bagBtn) {
  bagBtn.addEventListener("click", () => drawer.classList.add("is-open"));
  $$("[data-close]", drawer).forEach((el) => el.addEventListener("click", () => drawer.classList.remove("is-open")));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") drawer.classList.remove("is-open");
  });
}

/* ---------- checkout → order email ---------- */
const CONFIG = {
  supportEmail: "hkay7645@gmail.com",
  wallet: "0xE1E3e1c2978c74f43Bb095023135C3278303aF34",
};

const checkoutBtn = $("#checkoutBtn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (!bag.length) {
      toast("Your bag is empty");
      return;
    }
    const total = bag.reduce((n, i) => n + i.qty * i.price, 0);
    const lines = bag.map((i) => `- ${i.name} × ${i.qty} — $${i.qty * i.price}`).join("%0D%0A");
    const body =
      `Hello Terra Ceramics,%0D%0A%0D%0AI would like to order:%0D%0A${lines}%0D%0A%0D%0ASubtotal: $${total}` +
      `%0D%0A%0D%0AName:%0D%0AAddress:%0D%0ACountry:%0D%0APhone:%0D%0A%0D%0AThank you!`;
    window.location.href = `mailto:${CONFIG.supportEmail}?subject=${encodeURIComponent("Order — Terra Ceramics")}&body=${body}`;
  });
}

/* ---------- newsletter ---------- */
const newsForm = $("#newsForm");
if (newsForm) {
  newsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    newsForm.reset();
    toast("Welcome aboard — check your inbox for 10% off");
  });
}

/* ---------- contact form → mailto ---------- */
const contactForm = $("#contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const body = encodeURIComponent(
      `Name: ${data.get("name") || ""}\nEmail: ${data.get("email") || ""}\nTopic: ${data.get("topic") || ""}\n\n${data.get("message") || ""}`
    );
    const subject = encodeURIComponent(`Contact form — ${data.get("topic") || "General"}`);
    window.location.href = `mailto:${CONFIG.supportEmail}?subject=${subject}&body=${body}`;
    toast("Opening your email app…");
  });
}

/* ---------- reveal on scroll ----------
   Belt and braces: an immediate pass (so the first screen never depends
   on an observer), scroll/resize listeners, and timed fallbacks. */
(function revealSetup() {
  const els = $$(".reveal");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) return; // stay fully visible

  document.documentElement.classList.add("has-js");

  function show() {
    const h = window.innerHeight || document.documentElement.clientHeight || 800;
    els.forEach((el) => {
      if (el.classList.contains("is-in")) return;
      if (el.getBoundingClientRect().top < h * 0.94) el.classList.add("is-in");
    });
  }

  show();
  window.addEventListener("scroll", show, { passive: true });
  window.addEventListener("resize", show);

  // fallbacks: timers run even if scrolling/painting is throttled
  let ticks = 0;
  const iv = setInterval(() => {
    show();
    if (++ticks > 40 || ticks > 0 && els.every((e) => e.classList.contains("is-in"))) clearInterval(iv);
  }, 500);

  // absolute safety net — never leave content hidden
  setTimeout(() => els.forEach((el) => el.classList.add("is-in")), 9000);
})();

/* ---------- category filtering (categories.html) ----------
   Clicking a category opens categories.html?cat=xxx and shows ONLY the
   products of that category — never a generic list. */
(function categoryFilter() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const valid = ["women", "men", "shoes", "accessories", "kids", "new", "all"];
  const meta = {
    all: {
      title: "Shop by category",
      crumb: "Categories",
      desc: "Six collections, one palette — everything is designed to work together, season after season.",
    },
    women: {
      title: "Women",
      crumb: "Women",
      desc: "Fluid dresses, sharp tailoring and knitwear cut for movement — silk, linen, organic cotton and traceable wool.",
    },
    men: {
      title: "Men",
      crumb: "Men",
      desc: "Workwear-inspired jackets, oxford shirts and ties with a proper drape — built to be worn hard and washed often.",
    },
    shoes: {
      title: "Shoes",
      crumb: "Shoes",
      desc: "Leather mules and canvas high-tops on comfort lasts — resoleable soles and vegetable-tanned leather.",
    },
    accessories: {
      title: "Accessories",
      crumb: "Accessories",
      desc: "Full-grain leather bags, sunglasses and straw hats, made in small European workshops.",
    },
    kids: {
      title: "Kids",
      crumb: "Kids",
      desc: "Soft, washable and built for playgrounds — the same natural fabrics as our adult lines.",
    },
    new: {
      title: "New in",
      crumb: "New in",
      desc: "Fresh off the cutting table — new pieces land every second Thursday, in runs of 80.",
    },
  };

  function apply(next, push) {
    if (!valid.includes(next)) next = "all";

    if (push) {
      const url = next === "all" ? location.pathname : location.pathname + "?cat=" + next;
      try { history.pushState({ cat: next }, "", url); } catch (e) {}
    }

    const m = meta[next];
    const title = document.getElementById("catTitle");
    if (title) title.textContent = m.title;
    const desc = document.getElementById("catDesc");
    if (desc) desc.textContent = m.desc;
    const crumb = document.getElementById("catCrumb");
    if (crumb) crumb.textContent = m.crumb;
    document.title = m.title + " — Terra Ceramics";

    $$("[data-chip]").forEach((ch) => ch.classList.toggle("is-active", ch.dataset.chip === next));

    let shown = 0;
    $$(".product", grid).forEach((p) => {
      const match =
        next === "all" ||
        p.dataset.cat === next ||
        (next === "new" && p.dataset.new === "1");
      p.hidden = !match;
      if (match) { p.classList.add("is-in"); shown++; }
    });

    $$("[data-block]").forEach((b) => {
      b.hidden = !(next === "all" || b.dataset.block === next);
    });

    const cnt = document.getElementById("catCount");
    if (cnt) cnt.textContent = shown + (shown === 1 ? " piece" : " pieces");

    const empty = document.getElementById("catEmpty");
    if (empty) empty.hidden = shown !== 0;
  }

  const start = new URLSearchParams(location.search).get("cat");
  apply(start || "all", false);

  $$("[data-chip]").forEach((ch) =>
    ch.addEventListener("click", (e) => {
      e.preventDefault();
      apply(ch.dataset.chip, true);
      const head = document.getElementById("catHead");
      if (head) head.scrollIntoView({ behavior: "smooth", block: "start" });
    })
  );

  window.addEventListener("popstate", () => {
    apply(new URLSearchParams(location.search).get("cat") || "all", false);
  });
})();

renderBag();

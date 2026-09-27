/* ==========================================================
   Glow Ritual — front-end script (bag, nav, forms)
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
const KEY = "glow-ritual_bag";
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

  updatePayAmt(); // keep the USDT box in step with the bag

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

/* ---------- checkout → USDT payment box → order email ---------- */
const CONFIG = {
  supportEmail: "hkay7645@gmail.com",
  wallet: "0xE1E3e1c2978c74f43Bb095023135C3278303aF34",
};

function bagTotal() {
  return bag.reduce((n, i) => n + i.qty * i.price, 0);
}

/* the order email — with the on-chain receipt attached once payment verified */
function orderEmail(paidTx, received) {
  const total = bagTotal();
  const lines = bag.map((i) => `- ${i.name} × ${i.qty} — $${i.qty * i.price}`).join("%0D%0A");
  let body =
    `Hello Glow Ritual,%0D%0A%0D%0AI would like to order:%0D%0A${lines}%0D%0A%0D%0ASubtotal: $${total}`;
  if (paidTx) body += `%0D%0A%0D%0APaid in USDT: ${received} USDT%0D%0ATx: ${paidTx}`;
  body += `%0D%0A%0D%0AName:%0D%0AAddress:%0D%0ACountry:%0D%0APhone:%0D%0A%0D%0AThank you!`;
  window.location.href = `mailto:${CONFIG.supportEmail}?subject=${encodeURIComponent("Order — Glow Ritual")}&body=${body}`;
}

const checkoutBtn = $("#checkoutBtn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (!bag.length) {
      toast("Your bag is empty");
      return;
    }
    const panel = $("#payPanel");
    /* drawers without the payment box keep the plain order email */
    if (!panel) {
      orderEmail("", "");
      return;
    }
    panel.hidden = false;
    updatePayAmt();
    drawPayQr();
    const tx = $("#payTx");
    if (tx) {
      tx.focus({ preventScroll: true });
      try { tx.scrollIntoView({ block: "nearest" }); } catch (e) {}
    }
  });
}

/* ---------- USDT on-chain check (same keyless flow as get.html) ---------- */
const PAY_USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const PAY_TT = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const PAY_WTOPIC = "0x000000000000000000000000" + CONFIG.wallet.slice(2).toLowerCase();
const PAY_RPCS = [
  "https://ethereum-rpc.publicnode.com",
  "https://eth.drpc.org",
  "https://1rpc.io/eth",
  "https://eth-mainnet.public.blastapi.io",
  "https://ethereum.public.blockpi.network/v1/rpc/public",
  "https://cloudflare-eth.com",
];

function payRpc(method, params) {
  let i = 0;
  return new Promise((resolve, reject) => {
    (function attempt() {
      if (i >= PAY_RPCS.length) {
        reject(new Error("err|Could not reach the Ethereum network. Please try again in a moment."));
        return;
      }
      const url = PAY_RPCS[i++];
      const ctl = "AbortController" in window ? new AbortController() : null;
      const timer = setTimeout(() => { if (ctl) ctl.abort(); }, 9000);
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: method, params: params }),
        signal: ctl ? ctl.signal : undefined,
      })
        .then((r) => r.json())
        .then((j) => { clearTimeout(timer); if (j.result !== undefined) resolve(j.result); else attempt(); })
        .catch(() => { clearTimeout(timer); attempt(); });
    })();
  });
}

function verifyUsdt(tx, minTotal) {
  return payRpc("eth_getTransactionReceipt", [tx]).then((rec) => {
    if (!rec) throw new Error("wait|The transaction is not on the network yet. Wait ~60 seconds and try again.");
    if (rec.status !== "0x1") throw new Error("err|The transaction exists but failed (reverted). Check the hash.");
    let amount = 0n;
    (rec.logs || []).forEach((l) => {
      if (!l.address || !l.topics) return;
      if (l.address.toLowerCase() !== PAY_USDT) return;
      if ((l.topics[0] || "").toLowerCase() !== PAY_TT) return;
      /* ERC-20 Transfer: [signature, from, to] — the recipient is topics[2] */
      if ((l.topics[2] || "").toLowerCase() !== PAY_WTOPIC) return;
      try { amount += BigInt(l.data); } catch (e) {}
    });
    if (amount === 0n) throw new Error("err|This transaction does not contain a USDT transfer to our wallet. Most likely the wrong network was used.");
    if (amount < BigInt(minTotal) * 1000000n) {
      throw new Error("err|Amount received: " + Number(amount) / 1e6 + " USDT — but your bag costs " + minTotal + " USDT.");
    }
    return { amount: amount };
  });
}

/* ---------- payment box wiring ---------- */
function updatePayAmt() {
  const a = $("#payAmt");
  if (a) { const t = bagTotal(); a.textContent = "$" + t + " = " + t + " USDT"; }
}

function setPayStatus(kind, html) {
  const s = $("#payStatus");
  if (s) s.innerHTML = '<p class="s-' + kind + '">' + html + "</p>";
}

function legacyCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); done(); } catch (e) {}
  document.body.removeChild(ta);
}

function drawPayQr() {
  const qr = $("#payQr");
  if (!qr || qr.dataset.done || !window.QRCode) return;
  try {
    new QRCode(qr, {
      text: CONFIG.wallet,
      width: 132,
      height: 132,
      colorDark: "#16151a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M,
    });
    qr.dataset.done = "1";
  } catch (e) {}
}

const payWallet = $("#payWallet");
if (payWallet) payWallet.textContent = CONFIG.wallet;

const payCopy = $("#payCopy");
if (payCopy) {
  payCopy.addEventListener("click", () => {
    const done = () => {
      payCopy.textContent = "Copied ✓";
      setTimeout(() => (payCopy.textContent = "Copy"), 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(CONFIG.wallet).then(done, () => legacyCopy(CONFIG.wallet, done));
    } else legacyCopy(CONFIG.wallet, done);
  });
}

const payForm = $("#payForm");
if (payForm) {
  payForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#payTx");
    const btn = $("#payGo");
    if (!bag.length) {
      setPayStatus("wait", "Your bag is empty.");
      return;
    }
    let tx = (input.value || "").trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(tx)) {
      setPayStatus("err", "That does not look like a transaction hash. It should start with <b>0x</b> and be 66 characters long.");
      return;
    }
    tx = tx.toLowerCase();
    const min = bagTotal();
    btn.disabled = true;
    btn.textContent = "Checking the chain…";
    setPayStatus("work", "Reading transaction <code>" + tx.slice(0, 14) + "…</code> on Ethereum…");
    verifyUsdt(tx, min)
      .then((r) => {
        btn.disabled = false;
        btn.textContent = "Verify on-chain & place order";
        const amt = Number(r.amount) / 1e6;
        setPayStatus("ok", "✓ Payment confirmed — <b>" + amt + " USDT</b> received. Your bag is paid.");
        const s = $("#payStatus");
        if (s) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "pay__mail";
          b.textContent = "Open order email ✓";
          b.addEventListener("click", () => orderEmail(tx, amt));
          s.appendChild(b);
        }
      })
      .catch((err) => {
        btn.disabled = false;
        btn.textContent = "Verify on-chain & place order";
        const parts = String(err && err.message ? err.message : err).split("|");
        setPayStatus(parts[0] === "wait" ? "wait" : "err", parts[1] || "Something went wrong. Please try again.");
      });
  });
}

window.addEventListener("load", drawPayQr);

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
    document.title = m.title + " — Glow Ritual";

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

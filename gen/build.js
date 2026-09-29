/* ============================================================================
   VERA template generator — site builder
   Turns a niche definition into a complete, standalone storefront:
   index.html (SEO + JSON-LD), style.css, script.js, buy.html, README and a
   set of generated SVG product images. No build step is needed by the buyer.
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const { PALETTES, FONTS, garmentFor, fontUrl, accentText, mixHex } = require("./design.js");
const { BASE_CSS, LAYOUT_BY_ID } = require("./layouts.js");
const { NICHES } = require("./niches.js");

const ROOT = path.resolve(__dirname, "..");
const SITES = path.join(ROOT, "sites");

/* Public URL of the shop, used for canonical links and Open Graph. */
const SITE_BASE = "https://fyosamu.github.io/fashion-store/sites";

/* ------------------------------------------------------------------ utils */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const money = (n) => (n % 1 === 0 ? String(n) : n.toFixed(2));

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}
const pick = (arr, seed) => arr[seed % arr.length];
const shuffled = (arr, seed) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* Mood -> font families that suit it, rotated per niche so neighbours differ. */
const FONT_BY_MOOD = {
  luxe:     ["fraunces", "playfair", "cormorant", "bodoni", "instrument"],
  boutique: ["dmserif", "instrument", "playfair", "cormorant"],
  modern:   ["bricolage", "sora", "syne", "fraunces"],
  street:   ["bebas", "unbounded", "syne", "bricolage"],
  sport:    ["sora", "unbounded", "plexmono", "bricolage"],
  retro:    ["plexmono", "fraunces", "dmserif", "instrument"],
  resort:   ["dmserif", "syne", "sora", "playfair"],
};

/* Skins are assigned for the whole catalogue at once, not per niche.

   The old rule indexed the palette pool with `i % pool.length` and the font
   list with `floor(i / pool.length)`. Both are periodic in i, so any layout
   that recurred on a cycle dividing the pool size pulled the same palette every
   time — three stores ended up with an identical skin. Scoring each candidate
   against what has already gone out removes that, and because the map is built
   from the full NICHES array it still resolves the same way when build.js is
   asked for one slug. */
const ASSIGN = (() => {
  const chosen = new Map();
  const pair = new Map();
  const triplet = new Map();
  for (const niche of NICHES) {
    const pool = PALETTES.filter((p) => p.m === niche.m);
    const fams = FONT_BY_MOOD[niche.m] || ["fraunces"];
    const order = shuffled(pool, hash(niche.s));
    const rotate = hash(niche.s) % fams.length;
    let best = null;
    for (const pal of order) {
      for (let f = 0; f < fams.length; f++) {
        const font = FONTS.find((x) => x.k === fams[(f + rotate) % fams.length]) || FONTS[0];
        const p = `${niche.l}|${pal.k}`;
        const t = `${p}|${font.k}`;
        /* An unused skin for this layout is worth an order of magnitude more
           than an unused palette, so triplets break before pairs do. */
        const score = (triplet.get(t) || 0) * 1000 + (pair.get(p) || 0);
        if (!best || score < best.score) best = { pal, font, score };
      }
    }
    const p = `${niche.l}|${best.pal.k}`;
    const t = `${p}|${best.font.k}`;
    pair.set(p, (pair.get(p) || 0) + 1);
    triplet.set(t, (triplet.get(t) || 0) + 1);
    chosen.set(niche.s, { pal: best.pal, font: best.font });
  }
  return chosen;
})();

function choose(niche, i) {
  const hit = ASSIGN.get(niche.s);
  const pool = PALETTES.filter((p) => p.m === niche.m);
  const pal = hit ? hit.pal : pool[i % pool.length];
  const font = hit ? hit.font : FONTS[0];
  const layout = LAYOUT_BY_ID[niche.l];
  return { pal, font, layout };
}

/* --------------------------------------------------------------- artwork */
/* Generated SVG: a gradient field, one soft shape and the garment itself.
   Every tile differs by silhouette, palette, gradient angle and circle. */
function svg(name, palette, seed, title, opts = {}) {
  const g = opts.garment || null;
  const on = palette.on;
  const a1 = seed % 360;
  const cx = 70 + (seed % 260);
  const cy = 70 + ((seed >> 3) % 330);
  const r = 90 + ((seed >> 5) % 130);
  const bgA = palette.bg;
  const bgB = on ? palette.sf : palette.ln;
  const ink = on ? palette.ink : palette.ink;
  const accent = palette.ac;

  const art = g ? `
  <g transform="${opts.transform || ""}">
    ${g.fill.map((d) => `<path d="${d}" fill="${opts.gfill || ink}" fill-opacity="${opts.gop || 0.92}"/>`).join("\n    ")}
    ${(g.line || []).map((l) => `<path d="${l.d}" fill="none" stroke="${accent}" stroke-opacity="${opts.lop || 0.85}" stroke-width="4" stroke-linecap="round"/>`).join("\n    ")}
  </g>` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500" role="img" aria-label="${esc(title)}">
  <title>${esc(title)}</title>
  <defs>
    <linearGradient id="bg${seed}" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${a1} .5 .5)">
      <stop offset="0" stop-color="${bgA}"/>
      <stop offset="1" stop-color="${bgB}"/>
    </linearGradient>
    <radialGradient id="gl${seed}" cx="${(cx / 400) * 100}%" cy="${(cy / 500) * 100}%" r="${r}">
      <stop offset="0" stop-color="${accent}" stop-opacity="${on ? 0.3 : 0.22}"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="400" height="500" fill="url(#bg${seed})"/>
  <rect width="400" height="500" fill="url(#gl${seed})"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.45}" fill="${accent}" fill-opacity="0.1"/>
${art}
</svg>
`;
}

/* ------------------------------------------------------------ copy pools */
const FITS = [
  "True to size, cut for everyday wear.", "Relaxed through the body, true at the shoulder.",
  "Fitted but never tight.", "Cut a half-size roomier for layering.",
  "Pre-shrunk, so it still fits after washing.", "Falls straight from the chest.",
  "Designed to be worn oversized.", "Shorter in the body, longer in the sleeve.",
];
const USP = (n) => [
  [money(n.goods[0][1]), "entry price, no subscription"],
  ["30 days", "returns, no questions asked"],
  ["48h", "dispatch, tracked worldwide"],
  ["100%", "cut and sewn in our own workshop"],
];
const STAT_LINES = (n) => [
  [String(2 + (hash(n.s) % 9)), "years making"],
  [String(1200 + (hash(n.s) % 40) * 137).replace(/\B(?=(\d{3})+(?!\d))/g, ","), "orders shipped"],
  [String(4.6 + ((hash(n.s) % 4) / 10)).slice(0, 3), "average rating"],
];
const BUYERS = [
  "ordered twice in the same month", "wore it for a full week before reviewing",
  "came back for a second colour", "found us through a friend",
  "asked for it in her size and bought it anyway", "wears it to work now",
];
const FIRST = ["Amara", "Jonas", "Priya", "Malik", "Elena", "Tomas", "Nia", "Ivan", "Sofia", "Rahul", "Mei", "Diego"];
const LAST = ["O.", "K.", "M.", "R.", "B.", "S.", "D.", "T.", "V.", "A."];
const REVIEW_TPL = [
  (n, g) => `The ${g} arrived in two days and the ${n.fab[0]} is heavier than I expected for the price. I have washed it four times and it has not changed shape.`,
  (n, g) => `I bought the ${g} after months of looking. The ${n.craft[0]} is the detail that sold me — it does not feel like anything else I own.`,
  (n, g) => `Sizing was exactly as the chart said. The ${n.fab[1]} is soft without being delicate, and the ${n.craft[1]} holds up to a week of wear.`,
  (n, g) => `Third order from ${n.n}. The ${g} fits like the photos, which is rarer than it should be, and the finishing is genuinely clean inside.`,
  (n, g) => `Bought the ${g} for an event and wore it twice more that month. Nothing has pilled, nothing has stretched. Worth what I paid.`,
  (n, g) => `The ${n.fab[0]} was the reason I ordered, but the ${n.craft[0]} is why I came back. Packaging was minimal, which I appreciated.`,
];
const FAQ_TPL = (n) => [
  ["How does it fit?", `Every product page carries a full measurement chart in centimetres and inches. If you are between two sizes, take the larger — the ${n.fab[0]} has limited give.`],
  ["What is your return policy?", "Thirty days, unworn, tags on, no explanation needed. Return postage is on us inside the UK and EU; elsewhere it is deducted from the refund."],
  ["How should I wash it?", `Machine wash cold with like colours and hang to dry. The ${n.craft[0]} is the one thing that will not survive a hot tumble dry.`],
  ["Do you ship worldwide?", "Yes. Tracked worldwide, free over $120. UK and EU orders clear customs pre-paid; US orders under $800 are duty free."],
  ["Is it made in a factory?", `No. Everything is cut and sewn in our own ${4 + (hash(n.s) % 9)}-person workshop in small runs, which is why some sizes sell out before others.`],
];
const JOURNAL = (n) => [
  `How we cut the ${n.cats[0].toLowerCase()} range`,
  `Inside the ${n.fab[0]} sourcing trip`,
  `Five ways to wear the ${n.goods[0][0].toLowerCase()}`,
];
const MARQUEE = (n) => [
  n.cat, "Small runs", "Free returns", n.fab[0], "Tracked worldwide",
  "Made to last", n.cats[0], "No subscription", n.craft[0],
];

/* ------------------------------------------------------------- sections */
function secUsp(n) {
  return `<section class="sec sec--tint" aria-label="Why shop here">
  <div class="container">
    <div class="usp">
      ${USP(n).map(([b, s]) => `<div class="usp__item"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("\n      ")}
    </div>
  </div>
</section>`;
}

function secMarquee(n) {
  const items = MARQUEE(n).concat(MARQUEE(n));
  return `<div class="marquee" aria-hidden="true">
  <div class="marquee__track">${items.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
</div>`;
}

function secCategories(n, imgs) {
  const tiles = n.cats.map((c, i) => `
      <a class="cat" href="#shop">
        <img src="img/${imgs.cats[i]}" alt="${esc(c)} collection" loading="lazy" width="400" height="400" />
        <span>${esc(c)}</span>
      </a>`).join("");
  return `<section class="sec" aria-label="Categories">
  <div class="container">
    <div class="sec-head">
      <div><span class="eyebrow">Shop by category</span><h2>${esc(n.cats[0])}, ${esc(n.cats[1])} &amp; more</h2></div>
      <a class="link-arrow" href="#shop">See everything <span>&rarr;</span></a>
    </div>
    <div class="cat-grid">${tiles}
    </div>
  </div>
</section>`;
}

function prodCard(n, g, i, imgs, extraClass) {
  const [title, price, list] = g;
  const garment = garmentFor(title);
  const badge = i === 0 ? "Bestseller" : i === 1 ? "New in" : i === 4 ? "Low stock" : "";
  return `<article class="prod ${extraClass || ""}" data-price="${price}" data-name="${esc(title.toLowerCase())}">
      <div class="prod__media">
        <img src="img/${imgs.prods[i]}" alt="${esc(title)}" loading="${i < 2 ? "eager" : "lazy"}" width="400" height="500" />
        ${badge ? `<span class="prod__badge">${badge}</span>` : ""}
      </div>
      <div class="prod__body">
        <span class="prod__cat">${esc(garment.t)} &middot; ${esc(n.cat)}</span>
        <h3 class="prod__name">${esc(title)}</h3>
        <p class="prod__desc">${esc(cap(n.fab[i % n.fab.length]))} with ${esc(n.craft[i % n.craft.length])}. ${esc(FITS[(i + hash(n.s)) % FITS.length])}</p>
        <div class="prod__foot">
          <span class="prod__price"><s>$${money(list)}</s>$${money(price)}</span>
          <button class="prod__cta" type="button" data-buy>Add to bag</button>
        </div>
      </div>
    </article>`;
}

function secProducts(n, imgs, layout) {
  const toolbar = layout.id === "catalog" ? `
    <div class="toolbar">
      <span id="count">${n.goods.length} pieces</span>
      <label>Sort
        <select id="sort">
          <option value="featured">Featured</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
      </label>
    </div>` : "";
  return `<section class="sec" id="shop" aria-label="Shop">
  <div class="container">
    <div class="sec-head">
      <div><span class="eyebrow">The collection</span><h2>${esc(n.cats[0])} &amp; ${esc(n.cats[1])}</h2>
      <p>Six pieces from this season, each made in a run of forty or fewer.</p></div>
      <a class="link-arrow" href="buy.html">Get this template <span>&rarr;</span></a>
    </div>${toolbar}
    <div class="grid" style="--cols:${layout.gridCols};--gap:${layout.gap}px">
${n.goods.map((g, i) => "      " + prodCard(n, g, i, imgs)).join("\n")}
    </div>
  </div>
</section>`;
}

function secEditorial(n, imgs) {
  return `<section class="sec sec--tint" aria-label="About">
  <div class="container">
    <div class="split">
      <div class="split__media"><img src="img/${imgs.editorial}" alt="${esc(n.n)} workshop detail" loading="lazy" width="400" height="300" /></div>
      <div>
        <span class="eyebrow">How it is made</span>
        <h2>Forty pieces at a time, then we stop.</h2>
        <p class="lead">${esc(n.n)} is a ${esc(n.cat.toLowerCase())} label working from a ${4 + (hash(n.s) % 9)}-person workshop. We buy the ${esc(n.fab[0])} first and design around whatever arrives, rather than ordering fabric to fit a sketch.</p>
        <ul class="tick">
          <li><b>${esc(cap(n.craft[0]))}</b> on every stress point</li>
          <li><b>${esc(cap(n.fab[1]))}</b> sourced from a mill we have used since day one</li>
          <li><b>Free repairs</b> for the first three years, whatever went wrong</li>
          <li><b>Nothing destroyed</b> at the end of a season — leftovers become the next run</li>
        </ul>
        <div class="stats">
          ${STAT_LINES(n).map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("\n          ")}
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function secStory(n) {
  return `<section class="sec" aria-label="Our approach">
  <div class="container container--narrow" style="text-align:center">
    <span class="eyebrow">The idea</span>
    <h2>Buy less, but buy the ${esc(n.cats[0].toLowerCase())} you keep.</h2>
    <p class="lead" style="margin:18px auto 0;text-align:center">${esc(n.n)} publishes one range per season and keeps it in stock until the ${esc(n.fab[0])} runs out. No drops that vanish, no restock you have to chase.</p>
    <div class="stats" style="justify-content:center">
      ${STAT_LINES(n).map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("\n      ")}
    </div>
  </div>
</section>`;
}

function secSpec(n) {
  const cards = [
    ["01 / Fabric", cap(n.fab[0]), `Milled for us and tested through forty wash cycles before it entered the range.`],
    ["02 / Construction", cap(n.craft[0]), `Applied at every stress point, then pulled to failure on a sample from each run.`],
    ["03 / Fit", "Graded, not scaled", `Drafted on a real block for this size range rather than graded up from a sample size.`],
  ];
  return `<section class="sec sec--tint" aria-label="Specification">
  <div class="container">
    <div class="sec-head"><div><span class="eyebrow">Specification</span><h2>What is actually in it</h2></div></div>
    <div class="spec-grid">
      ${cards.map(([n2, t, d]) => `<div class="spec-card"><span class="num">${esc(n2)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join("\n      ")}
    </div>
    <div class="spec-table" style="margin-top:26px">
      <div><dt>Category</dt><dd>${esc(n.cat)}</dd></div>
      <div><dt>Primary fabric</dt><dd>${esc(n.fab[0])}</dd></div>
      <div><dt>Detail</dt><dd>${esc(n.craft[0])}</dd></div>
      <div><dt>Run size</dt><dd>40 units maximum</dd></div>
      <div><dt>Dispatch</dt><dd>Within 48 hours, tracked</dd></div>
    </div>
  </div>
</section>`;
}

function secReviews(n) {
  const idx = shuffled(n.goods.map((g) => g[0]), hash(n.s));
  const revs = REVIEW_TPL.slice(0, 3).map((fn, i) => {
    const seed = hash(n.s + i);
    const who = FIRST[seed % FIRST.length] + " " + LAST[(seed >> 4) % LAST.length];
    return `<figure class="review">
      <div class="stars" aria-label="5 out of 5">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
      <blockquote><p>${esc(fn(n, idx[i % idx.length]))}</p></blockquote>
      <footer><span class="who" aria-hidden="true">${esc(who.charAt(0))}</span>
        <span><b>${esc(who)}</b><br />${esc(BUYERS[seed % BUYERS.length])}</span></footer>
    </figure>`;
  });
  return `<section class="sec" aria-label="Reviews">
  <div class="container">
    <div class="sec-head"><div><span class="eyebrow">Reviews</span><h2>4.7 from 1,240 orders</h2></div>
      <a class="link-arrow" href="#shop">Shop the ${esc(n.cats[0].toLowerCase())} <span>&rarr;</span></a></div>
    <div class="reviews">${revs.join("\n")}
    </div>
  </div>
</section>`;
}

function secJournal(n, imgs) {
  const titles = JOURNAL(n);
  return `<section class="sec sec--tint" aria-label="Journal">
  <div class="container">
    <div class="sec-head"><div><span class="eyebrow">Journal</span><h2>Notes from the workshop</h2></div></div>
    <div class="grid" style="--cols:3;--gap:26px">
      ${titles.map((t, i) => `<a class="prod" href="#shop">
        <div class="prod__media" style="aspect-ratio:16/10"><img src="img/${imgs.journal[i]}" alt="${esc(t)}" loading="lazy" width="400" height="250" /></div>
        <div class="prod__body"><span class="prod__cat">Journal &middot; ${4 + i} min</span>
        <h3 class="prod__name">${esc(t)}</h3><p class="prod__desc">Read the full note on how this was made, tested and corrected.</p></div>
      </a>`).join("\n      ")}
    </div>
  </div>
</section>`;
}

function secLookbook(n, imgs) {
  const caps = n.goods.map((g) => g[0]);
  return `<section class="sec" aria-label="Lookbook">
  <div class="container">
    <div class="sec-head"><div><span class="eyebrow">Lookbook</span><h2>Season ${20 + (hash(n.s) % 9)}</h2></div>
      <a class="link-arrow" href="#shop">Shop the looks <span>&rarr;</span></a></div>
    <div class="lookbook">
      ${imgs.looks.map((f, i) => `<figure><img src="img/${f}" alt="${esc(caps[i % caps.length])} styled" loading="lazy" width="400" height="533" /><figcaption>Look 0${i + 1} &middot; ${esc(caps[i % caps.length])}</figcaption></figure>`).join("\n      ")}
    </div>
  </div>
</section>`;
}

function secDrop(n) {
  const items = [
    [String(n.goods.length), "pieces this season"],
    ["40", "units per run"],
    ["48h", "dispatch window"],
    ["30", "day returns"],
  ];
  return `<section class="sec" aria-label="The numbers">
  <div class="container">
    <div class="drop">
      ${items.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("\n      ")}
    </div>
  </div>
</section>`;
}

function secFaq(n) {
  return `<section class="sec sec--tint" aria-label="FAQ">
  <div class="container container--narrow">
    <div class="sec-head"><div><span class="eyebrow">FAQ</span><h2>Before you order</h2></div></div>
    <div class="faq">
      ${FAQ_TPL(n).map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n      ")}
    </div>
  </div>
</section>`;
}

function secCta(n) {
  return `<section class="sec">
  <div class="container">
    <div class="cta">
      <div>
        <h2>${esc(n.n)} &mdash; the whole range, one list.</h2>
        <p>Get first access to the next ${esc(n.cats[2].toLowerCase())} run, plus $15 off your first order. Two emails a month, never more.</p>
      </div>
      <form class="cta__form" data-signup>
        <label class="sr" for="nl">Email</label>
        <input id="nl" type="email" placeholder="you@example.com" required />
        <button class="btn" type="submit">Join</button>
      </form>
    </div>
  </div>
</section>`;
}

const SECTION_FN = {
  usp: secUsp, marquee: secMarquee, categories: secCategories, products: secProducts,
  editorial: secEditorial, story: secStory, spec: secSpec, reviews: secReviews,
  journal: secJournal, lookbook: secLookbook, drop: secDrop, faq: secFaq, cta: secCta,
};

/* ------------------------------------------------------------------ heroes */
function heroFor(id, n, imgs) {
  const s = {
    split: () => `<section class="hero" id="top">
  <div class="container hero__grid">
    <div class="hero__text reveal">
      <span class="eyebrow">${esc(n.cat)}</span>
      <h1>${n.hero[0]}</h1>
      <p class="lead">${esc(n.hero[1])}</p>
      <div class="hero__cta">
        <a href="#shop" class="btn">Shop the collection</a>
        <a href="buy.html" class="btn btn--ghost">Get this template</a>
      </div>
      <ul class="hero__stats">
        ${STAT_LINES(n).map(([b, l]) => `<li><b>${esc(b)}</b><span>${esc(l)}</span></li>`).join("\n        ")}
      </ul>
    </div>
    <div class="hero__media reveal">
      <div class="frame"><img src="img/${imgs.hero}" alt="${esc(n.n)} hero look" width="400" height="500" fetchpriority="high" /></div>
      <div class="hero__float"><b>${esc(n.goods[0][0])}</b><span>$${money(n.goods[0][1])} &middot; ${esc(n.fab[0])}</span></div>
    </div>
  </div>
</section>`,

    fullbleed: () => `<section class="hero" id="top">
  <div class="hero__bg"><img src="img/${imgs.hero}" alt="${esc(n.n)} campaign image" width="400" height="500" fetchpriority="high" /></div>
  <div class="container hero__inner reveal">
    <span class="eyebrow">${esc(n.cat)}</span>
    <h1>${n.hero[0]}</h1>
    <p class="lead">${esc(n.hero[1])}</p>
    <div class="hero__cta"><a href="#shop" class="btn">Shop now</a><a href="#story" class="btn btn--ghost">Our story</a></div>
    <div class="hero__meta">
      ${n.cats.map((c) => `<span>${esc(c)}</span>`).join("\n      ")}
    </div>
  </div>
</section>`,

    centered: () => `<section class="hero" id="top">
  <div class="container reveal">
    <div class="hero__rule"></div>
    <span class="eyebrow">${esc(n.cat)}</span>
    <h1>${n.hero[0]}</h1>
    <p class="lead">${esc(n.hero[1])}</p>
    <div class="hero__cta"><a href="#shop" class="btn">Shop the collection</a><a href="buy.html" class="btn btn--ghost">Get this template</a></div>
    <p class="hero__price">From <b>$${money(Math.min(...n.goods.map((g) => g[1])))}</b> &middot; free returns for 30 days</p>
    <div class="hero__rule hero__rule--b"></div>
    <div class="hero__thumbs">
      ${imgs.thumbs.map((f, i) => `<img src="img/${f}" alt="${esc(n.cats[i % n.cats.length])}" loading="lazy" width="400" height="400" />`).join("\n      ")}
    </div>
  </div>
</section>`,

    index: () => `<section class="hero" id="top">
  <div class="container hero__grid">
    <div class="reveal">
      <span class="eyebrow">${esc(n.cat)}</span>
      <h1>${n.hero[0]}</h1>
      <p class="lead">${esc(n.hero[1])}</p>
      <ul class="hero__list">
        ${n.cats.map((c, i) => `<li><span>${esc(c)}</span><span>${3 + i * 2} pieces</span></li>`).join("\n        ")}
      </ul>
      <div class="hero__cta"><a href="#shop" class="btn btn--sm">Enter the shop</a></div>
    </div>
    <div class="hero__media reveal"><img src="img/${imgs.hero}" alt="${esc(n.n)} editorial" width="400" height="533" fetchpriority="high" /></div>
  </div>
</section>`,

    overlap: () => `<section class="hero" id="top">
  <div class="container hero__grid">
    <div class="reveal">
      <span class="eyebrow">${esc(n.cat)}</span>
      <h1>${n.hero[0]}</h1>
      <p class="lead">${esc(n.hero[1])}</p>
      <div class="hero__cta"><a href="#shop" class="btn">Shop the collection</a><a href="buy.html" class="btn btn--ghost">Get this template</a></div>
      <div class="stats">${STAT_LINES(n).map(([b, l]) => `<div><b>${esc(b)}</b><span>${esc(l)}</span></div>`).join("")}</div>
    </div>
    <div class="stack reveal">
      <img class="a" src="img/${imgs.hero}" alt="${esc(n.goods[0][0])}" width="400" height="533" fetchpriority="high" />
      <img class="b" src="img/${imgs.thumbs[0]}" alt="${esc(n.goods[1][0])}" loading="lazy" width="400" height="500" />
      <img class="c" src="img/${imgs.thumbs[1]}" alt="${esc(n.goods[2][0])}" loading="lazy" width="400" height="400" />
    </div>
  </div>
</section>`,

    spec: () => `<section class="hero" id="top">
  <div class="container hero__grid">
    <div class="reveal">
      <div class="hero__label">${esc(n.cat)} / 01</div>
      <h1>${n.hero[0]}</h1>
      <p class="lead">${esc(n.hero[1])}</p>
      <div class="hero__cta"><a href="#shop" class="btn">View range</a><a href="#spec" class="btn btn--ghost">Specification</a></div>
    </div>
    <div class="reveal">
      <dl class="spec-table">
        <div><dt>Fabric</dt><dd>${esc(n.fab[0])}</dd></div>
        <div><dt>Detail</dt><dd>${esc(n.craft[0])}</dd></div>
        <div><dt>Run</dt><dd>40 units</dd></div>
        <div><dt>Dispatch</dt><dd>48 hours</dd></div>
        <div><dt>Returns</dt><dd>30 days, free</dd></div>
      </dl>
    </div>
  </div>
</section>`,

    brutal: () => `<section class="hero" id="top">
  <div class="container hero__grid">
    <div class="hero__text reveal">
      <span class="eyebrow">${esc(n.cat)}</span>
      <h1>${n.hero[0]}</h1>
      <p class="lead">${esc(n.hero[1])}</p>
      <div class="hero__cta"><a href="#shop" class="btn">Shop now</a><a href="buy.html" class="btn btn--ghost">Get this template</a></div>
    </div>
    <div class="hero__side reveal">
      ${STAT_LINES(n).map(([b, l]) => `<div><b>${esc(b)}</b><span>${esc(l)}</span></div>`).join("\n      ")}
    </div>
  </div>
</section>`,

    lookbook: () => `<section class="hero" id="top">
  <div class="container">
    <div class="hero__head reveal">
      <div><span class="eyebrow">${esc(n.cat)}</span><h1>${n.hero[0]}</h1><p class="lead">${esc(n.hero[1])}</p></div>
      <span class="hero__no">Lookbook / ${new Date().getFullYear()}</span>
    </div>
    <div class="hero__strip">
      ${imgs.strip.map((f, i) => `<img src="img/${f}" alt="Look ${i + 1} from ${esc(n.n)}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} width="400" height="533" />`).join("\n      ")}
    </div>
  </div>
</section>`,

    retro: () => `<section class="hero" id="top">
  <div class="container">
    <div class="hero__kicker"><span>${esc(n.n)}</span><span>${esc(n.cat)}</span><span>Est. ${2008 + (hash(n.s) % 15)}</span></div>
    <h1 class="reveal">${n.hero[0]}</h1>
    <p class="hero__dek reveal">${esc(n.hero[1])}</p>
    <div class="hero__cta reveal"><a href="#shop" class="btn">Shop the range</a><a href="buy.html" class="btn btn--ghost">Get this template</a></div>
    <div class="hero__figs">
      ${imgs.strip.map((f, i) => `<img src="img/${f}" alt="${esc(n.cats[i % n.cats.length])}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} width="400" height="300" />`).join("\n      ")}
    </div>
  </div>
</section>`,

    catalog: () => `<section class="hero" id="top">
  <div class="container">
    <span class="eyebrow">${esc(n.cat)}</span>
    <h1 class="reveal">${n.hero[0]}</h1>
    <p class="lead reveal">${esc(n.hero[1])}</p>
    <div class="hero__bar reveal">
      <div class="search"><span aria-hidden="true">&#9906;</span><input id="q" type="search" placeholder="Search ${esc(n.cat.toLowerCase())}…" aria-label="Search products" /></div>
      <a href="#shop" class="btn">Browse all</a>
    </div>
    <div class="chips reveal" id="chips">
      <button class="chip is-on" data-cat="all">All</button>
      ${n.cats.map((c) => `<button class="chip" data-cat="${esc(c.toLowerCase())}">${esc(c)}</button>`).join("\n      ")}
    </div>
  </div>
</section>`,

    boutique: () => `<section class="hero" id="top">
  <div class="container">
    <div class="hero__panel reveal">
      <div>
        <span class="eyebrow">${esc(n.cat)}</span>
        <h1>${n.hero[0]}</h1>
        <p class="lead">${esc(n.hero[1])}</p>
        <div class="hero__cta"><a href="#shop" class="btn">Shop the collection</a><a href="buy.html" class="btn btn--ghost">Get this template</a></div>
        <div class="hero__pills">${n.cats.map((c) => `<span>${esc(c)}</span>`).join("")}</div>
      </div>
      <div class="hero__cards">
        <img src="img/${imgs.hero}" alt="${esc(n.goods[0][0])}" width="400" height="250" fetchpriority="high" />
        <img src="img/${imgs.thumbs[0]}" alt="${esc(n.goods[1][0])}" loading="lazy" width="400" height="533" />
        <img src="img/${imgs.thumbs[1]}" alt="${esc(n.goods[2][0])}" loading="lazy" width="400" height="533" />
      </div>
    </div>
  </div>
</section>`,

    street: () => `<section class="hero" id="top">
  <div class="container">
    <span class="hero__num" aria-hidden="true">${String(20 + (hash(n.s) % 79)).slice(0, 2)}</span>
    <span class="eyebrow">${esc(n.cat)}</span>
    <h1 class="reveal">${n.hero[0]}</h1>
    <p class="lead reveal">${esc(n.hero[1])}</p>
    <div class="hero__cta reveal"><a href="#shop" class="btn">Shop the drop</a><a href="buy.html" class="btn btn--ghost">Get this template</a></div>
    <div class="hero__meta"><span>Season ${new Date().getFullYear()}</span><span>${n.goods.length} pieces</span><span>Free returns</span><span>Tracked worldwide</span></div>
  </div>
</section>`,
  };
  return (s[id] || s.split)();
}

/* -------------------------------------------------------- chrome: nav/footer */
/* Which anchor + label each section type exposes to the navigation. */
const SECTION_ANCHOR = {
  categories: ["categories", "Categories"],
  products:   ["shop", "Shop"],
  editorial:  ["story", "Our story"],
  story:      ["story", "Our story"],
  spec:       ["spec", "Spec"],
  journal:    ["journal", "Journal"],
  lookbook:   ["lookbook", "Lookbook"],
  reviews:    ["reviews", "Reviews"],
  faq:        ["faq", "FAQ"],
  drop:       ["drop", "The drop"],
  usp:        ["why", "Why us"],
};

let _curLayout = null;

function navFor(n) {
  const links = [`<a href="#top" class="is-active">Home</a>`, `<a href="#shop">Shop</a>`];
  const seen = new Set(["products"]);
  for (const id of _curLayout.sections) {
    if (seen.has(id) || !SECTION_ANCHOR[id]) continue;
    seen.add(id);
    const [href, label] = SECTION_ANCHOR[id];
    if (href === "shop") continue;
    links.push(`<a href="#${href}">${label}</a>`);
    break; /* one extra link keeps the bar tidy at every width */
  }
  links.push(`<a href="buy.html">Template</a>`);

  return `  <div class="topbar">Free tracked shipping over $120 &nbsp;&middot;&nbsp; <a href="buy.html">Get this store as a template &mdash; $19</a></div>

  <header class="nav" id="nav">
    <div class="container nav__inner">
      <a class="brand" href="#top"><b>${esc(n.n.split(" ")[0])}</b><small>${esc(n.n.split(" ").slice(1).join(" ") || n.cat)}</small></a>
      <nav class="nav__links" id="navLinks" aria-label="Main">
        ${links.join("\n        ")}
      </nav>
      <div class="nav__tools">
        <button class="bag-btn" id="bagBtn" type="button">Bag <span class="bag-count" id="bagCount">0</span></button>
        <button class="nav__toggle" id="navToggle" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>`;
}

function footerFor(n) {
  return `<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div>
        <a class="brand" href="#top"><b>${esc(n.n.split(" ")[0])}</b><small>${esc(n.n.split(" ").slice(1).join(" ") || n.cat)}</small></a>
        <p class="footer__about">${esc(n.n)} is a ${esc(n.cat.toLowerCase())} label working in small runs from its own workshop. Free returns for thirty days, worldwide tracked shipping.</p>
      </div>
      <div>
        <h3>Shop</h3>
        <ul>${n.cats.map((c) => `<li><a href="#shop">${esc(c)}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h3>Help</h3>
        <ul><li><a href="#faq">Shipping</a></li><li><a href="#faq">Returns</a></li><li><a href="#faq">Size guide</a></li><li><a href="#faq">Contact</a></li></ul>
      </div>
      <div>
        <h3>This template</h3>
        <ul><li><a href="buy.html">Buy for $19</a></li><li><a href="INSTALL.md">Install notes</a></li><li><a href="#top">Live demo</a></li><li>MIT licensed</li></ul>
      </div>
    </div>
    <div class="footer__bottom">
      <span>&copy; <span id="year">${new Date().getFullYear()}</span> ${esc(n.n)}. All rights reserved.</span>
      <span>Powered by VERA Templates &middot; USDT accepted</span>
    </div>
  </div>
</footer>
<div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}

/* --------------------------------------------------------------- script.js */
const SCRIPT_JS = `(function () {
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
`;

/* ------------------------------------------------------------ style.css */
function styleCss(niche, pal, font, layout) {
  const on = !!pal.on;
  const card = on ? pal.sf : "#ffffff";
  const sf2 = on ? pal.ln : pal.sf;
  /* The accent paints type as well as filling buttons, so derive a second,
     hue-preserving value that stays legible on every surface in this theme —
     including the 12–20% tints the layouts mix it into for pills and avatars. */
  const acT = accentText(pal.ac, [
    pal.bg, pal.sf, card, sf2,
    mixHex(pal.bg, pal.ac, 0.20),
    mixHex(pal.sf, pal.ac, 0.20),
  ]);
  const tokens = `
:root{
  /* palette: ${pal.k} */
  --bg:${pal.bg}; --sf:${pal.sf}; --sf2:${sf2};
  --card:${card};
  --ink:${pal.ink}; --mut:${pal.mut}; --line:${pal.ln}; --ln:${pal.ln};
  --ac:${pal.ac}; --ack:${pal.ack}; --ac-t:${acT};
  --display:"${font.h}",Georgia,serif;
  --sans:"${font.b}",system-ui,sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  --hweight:600; --htrack:-.02em;
  --w:1220px; --r:${layout.r || 12}px; --cr:${layout.r || 12}px;
  --gap:${layout.gap || 24}px; --ar:${layout.ar || "4/5"};
  --sh:0 24px 56px -34px rgba(0,0,0,${on ? 0.75 : 0.42});
}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
/* category tiles */
.cat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
@media(max-width:820px){.cat-grid{grid-template-columns:1fr 1fr}}
.cat{position:relative;display:block;border-radius:var(--cr);overflow:hidden;background:var(--sf2)}
.cat img{aspect-ratio:1/1;object-fit:cover;width:100%;transition:transform .5s cubic-bezier(.2,.7,.3,1)}
.cat:hover img{transform:scale(1.07)}
.cat span{position:absolute;left:14px;bottom:14px;background:var(--ac);color:var(--ack);
  font-size:.76rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  padding:8px 14px;border-radius:999px}
`;
  return `/* ==========================================================================
   ${niche.n} — ${niche.cat} store template
   Layout: ${layout.id} · Palette: ${pal.k} · Type: ${font.h} / ${font.b}
   --------------------------------------------------------------------------
   Re-skin in one edit: everything visual is driven by the :root block below.
   ========================================================================== */
${tokens}${BASE_CSS}${layout.css}
`;
}

/* ----------------------------------------------------------------- SEO */
function head(niche, pal, font, layout) {
  const title = `${niche.n} — ${niche.cat}`;
  const desc = `${niche.n}: ${niche.hero[1]} ${niche.cat} from $${money(Math.min(...niche.goods.map((g) => g[1])))}. Free returns for 30 days, tracked worldwide.`;
  const url = `${SITE_BASE}/${niche.s}/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="${url}" />
  <meta name="theme-color" content="${pal.bg}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${esc(niche.n)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${url}img/hero.svg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fontUrl(font)}" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
  <script type="application/ld+json">
${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "ClothingStore", "@id": url + "#store", name: niche.n, description: desc, url, image: url + "img/hero.svg",
        priceRange: "$" + money(Math.min(...niche.goods.map((g) => g[1]))) + "-" + money(Math.max(...niche.goods.map((g) => g[2]))),
        address: { "@type": "PostalAddress", addressLocality: "Online" },
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", reviewCount: "1240" } },
      { "@type": "ItemList", name: niche.n + " — featured products",
        itemListElement: niche.goods.map((g, i) => ({
          "@type": "ListItem", position: i + 1,
          item: { "@type": "Product", name: g[0], description: `${cap(niche.fab[0])} with ${niche.craft[0]}.`,
            image: `${url}img/p${i + 1}.svg`,
            offers: { "@type": "Offer", price: g[1], priceCurrency: "USD", availability: "https://schema.org/InStock" } } })) },
    ],
  }, null, 2)}
  </script>
  <script>document.documentElement.classList.add("js");</script>
</head>
<body data-layout="${layout.id}" data-palette="${pal.k}">
<a class="skip" href="#shop">Skip to products</a>
`;
}

/* ------------------------------------------------------------ buy.html */
function buyHtml(niche, pal, font, layout) {
  const sku = niche.s;
  const url = `${SITE_BASE}/${niche.s}/`;
  const checkout = `https://fyosamu.github.io/fashion-store/get.html?sku=${sku}`;
  const price = 19, list = 49;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Buy ${esc(niche.n)} — store template, $${price}</title>
  <meta name="description" content="Buy the ${esc(niche.n)} ${esc(niche.cat.toLowerCase())} store template: complete HTML, CSS and JavaScript, delivered instantly for ${price} USDT." />
  <meta name="robots" content="noindex" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fontUrl(font)}" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body data-layout="${layout.id}">
  <div class="topbar">Instant delivery &nbsp;&middot;&nbsp; pay in USDT, paste the hash, download</div>

  <header class="nav" id="nav">
    <div class="container nav__inner">
      <a class="brand" href="index.html"><b>${esc(niche.n.split(" ")[0])}</b><small>template</small></a>
      <nav class="nav__links" id="navLinks" aria-label="Main">
        <a href="index.html">Live demo</a>
        <a href="#inside">What you get</a>
        <a href="#buy" class="is-active">Buy</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div class="nav__tools">
        <button class="nav__toggle" id="navToggle" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>

  <section class="hero" id="buy">
    <div class="container reveal">
      <span class="eyebrow">${esc(niche.cat)} store template</span>
      <h1>${esc(niche.n)} &mdash; ${esc(layout.id)} build</h1>
      <p class="lead">A complete, responsive storefront: semantic HTML, one comment design system in CSS, vanilla JavaScript, generated product art and full SEO markup. No framework, no build step, no licence key.</p>
      <p class="hero__price"><b>$${price}</b> one-time &nbsp;&middot;&nbsp; <s>$${list}</s> &nbsp;&middot;&nbsp; MIT licensed</p>
      <div class="hero__cta">
        <a class="btn" href="${checkout}">Buy for ${price} USDT &rarr;</a>
        <a class="btn btn--ghost" href="index.html">Open the live demo</a>
      </div>
    </div>
  </section>

  <section class="sec sec--tint" id="inside">
    <div class="container">
      <div class="sec-head"><div><span class="eyebrow">What you get</span><h2>The whole folder</h2></div></div>
      <div class="usp">
        <div class="usp__item"><b>index.html</b><span>Semantic markup, meta tags, Open Graph and ClothingStore + ItemList JSON-LD.</span></div>
        <div class="usp__item"><b>style.css</b><span>One <code>:root</code> palette block repaints the entire site. Mobile-first, no framework.</span></div>
        <div class="usp__item"><b>script.js</b><span>4 KB of vanilla JS: nav, filtering, sorting, bag, reveal-on-scroll.</span></div>
        <div class="usp__item"><b>img/</b><span>Generated SVG product art — tiny, sharp at any size, recoloured by your palette.</span></div>
      </div>
      <div class="story__box" style="margin-top:26px">
        <h3>Pay in USDT from Trust Wallet</h3>
        <p class="lead">Network <b>BNB Smart Chain (BEP-20)</b> is the cheapest route at roughly $0.0025 per transfer. The checkout also accepts Ethereum, Tron, Polygon and Solana, or card.</p>
        <ul class="tick">
          <li><b>Instant</b> — the file unlocks seconds after your transaction confirms</li>
          <li><b>No account</b> — the check runs in your own browser against the chain</li>
          <li><b>Lifetime</b> — re-download any time with the same hash</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="sec" id="faq">
    <div class="container container--narrow">
      <div class="sec-head"><div><span class="eyebrow">FAQ</span><h2>Template questions</h2></div></div>
      <div class="faq">
        <details open><summary>Do I need a build tool?</summary><p>No. Unzip, open <code>index.html</code>, it runs. Upload the folder to GitHub Pages, Netlify drop or any shared host.</p></details>
        <details><summary>Can I change the colours?</summary><p>Yes — the <code>:root</code> block at the top of <code>style.css</code> holds every colour, font and radius used on the page.</p></details>
        <details><summary>What can I do with it?</summary><p>MIT licence. Use it for client projects, sell with it, keep everything you charge. Attribution is appreciated but not required.</p></details>
        <details><summary>How do I take payments?</summary><p><code>get.html</code> at the shop root verifies USDT on-chain and releases a download automatically. Point your own buy button at it.</p></details>
        <details><summary>Where do I edit the copy?</summary><p>All text is plain HTML in <code>index.html</code>. <code>INSTALL.md</code> lists every block worth changing first.</p></details>
      </div>
    </div>
  </section>

  <section class="sec" style="padding-top:0">
    <div class="container">
      <div class="cta">
        <div><h2>${esc(niche.n)} &mdash; ${price} USDT, delivered instantly</h2>
        <p>Open the demo first if you want to check it on a phone. Then pay, paste the hash, and the ZIP unlocks in your browser.</p></div>
        <div class="hero__cta" style="margin-top:0">
          <a class="btn" href="${checkout}">Buy for ${price} USDT</a>
          <a class="btn btn--ghost" href="${url}" style="border-color:currentColor;color:inherit">Live demo</a>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <div class="footer__bottom" style="margin-top:0;border-top:0;padding-top:0">
        <span>&copy; ${new Date().getFullYear()} VERA Templates</span>
        <span>USDT accepted &middot; MIT licensed &middot; instant delivery</span>
      </div>
    </div>
  </footer>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <script src="script.js"></script>
</body>
</html>
`;
}

/* ---------------------------------------------------------- README / INSTALL */
function readmeMd(niche, pal, font, layout) {
  return `# ${niche.n} — ${niche.cat} store template

| | |
|---|---|
| **Layout** | \`${layout.id}\` (${layout.gridCols}-column product grid) |
| **Palette** | \`${pal.k}\` — ${pal.on ? "dark" : "light"} surface, accent \`${pal.ac}\` |
| **Type** | ${font.h} (display) + ${font.b} (body), one Google Fonts request |
| **Products** | ${niche.goods.length}, with generated SVG artwork |
| **SEO** | meta, canonical, Open Graph, Twitter card, ClothingStore + ItemList JSON-LD |
| **Licence** | MIT — use it in client projects and keep what you charge |

## Run it

Open \`index.html\`. That is the whole instruction — no build step, no dependencies
beyond one Google Fonts stylesheet.

## Pages

- \`index.html\` — the storefront
- \`buy.html\` — purchase page for this template, with the checkout link
- \`style.css\` — design system; \`:root\` at the top drives every visual
- \`script.js\` — nav, filtering, sorting, bag, scroll reveal
- \`img/\` — generated SVG product art
- \`INSTALL.md\` — what to edit first

## Products

${niche.goods.map((g) => `- **${g[0]}** — $${money(g[1])} (was $${money(g[2])})`).join("\n")}
`;
}

function installMd(niche) {
  return `# Installing ${niche.n}

Everything lives in this folder. There is no build step.

## 1. See it

Double-click \`index.html\`. If images or fonts look wrong, you are probably
opening it from inside a zip preview — extract the folder first.

## 2. Put it online

- **GitHub Pages** — push the folder into a repo, Settings → Pages → deploy from \`main\`.
- **Netlify** — drag the folder onto https://app.netlify.com/drop.
- **Any host** — upload via FTP/SFTP; \`.htaccess\` is not required.

## 3. Edit these first

| Where | What |
|---|---|
| \`style.css\` → \`:root\` | every colour, font, radius and shadow |
| \`index.html\` → \`.brand\` | your brand name |
| \`index.html\` → \`<title>\` and \`meta[name=description]\` | your SEO |
| \`index.html\` → \`link[rel=canonical]\` and \`og:url\` | your real URL |
| \`index.html\` → JSON-LD block | your store name, prices, ratings |
| \`index.html\` → \`.hero\` | headline and lead |
| \`index.html\` → \`.prod\` blocks | products, prices, copy |
| \`index.html\` → \`.footer\` | links and legal line |
| \`img/\` | swap generated SVGs for your own photography |

## 4. Take payments

The shop root ships \`get.html\`: paste a USDT transaction hash, it reads the
chain in the visitor's browser and releases the file automatically. Set your own
wallet address at the top of its script:

\`\`\`js
var WALLET = "0xYourAddressHere";
var USDT   = "0xdac17f958d2ee523a2206206994597c13d831ec7"; // USDT contract
\`\`\`

Change \`network\` in the copy if you accept BEP-20 instead of ERC-20.

## 5. Swap the buy link

Every "buy" button in this template points at \`get.html?sku=${niche.s}\`.
Replace it with your own product URL before you go live.
`;
}

/* ------------------------------------------------------------- asset names */
function imageNames(niche, seed) {
  const g = niche.goods;
  return {
    prods: g.map((_, i) => `p${i + 1}.svg`),
    hero: "hero.svg",
    editorial: "editorial.svg",
    cats: niche.cats.map((_, i) => `c${i + 1}.svg`),
    thumbs: ["t1.svg", "t2.svg", "t3.svg"],
    looks: ["l1.svg", "l2.svg", "l3.svg"],
    strip: ["s1.svg", "s2.svg", "s3.svg"],
    journal: ["j1.svg", "j2.svg", "j3.svg"],
  };
}

function writeImages(dir, niche, pal, imgs) {
  const im = path.join(dir, "img");
  fs.mkdirSync(im, { recursive: true });
  const dark = !!pal.on;
  const gfill = dark ? pal.ink : pal.ink;
  const gline = pal.ac;

  niche.goods.forEach((g, i) => {
    const seed = hash(niche.s + "g" + i);
    fs.writeFileSync(path.join(im, `p${i + 1}.svg`),
      svg(`p${i + 1}`, pal, seed, `${g[0]} — ${niche.n}`,
        { garment: garmentFor(g[0]), gfill, lop: 0.9 }));
  });
  fs.writeFileSync(path.join(im, "hero.svg"),
    svg("hero", pal, hash(niche.s + "hero"), `${niche.n} hero look`,
      { garment: garmentFor(niche.goods[0][0]), gfill, transform: "translate(0,20) scale(1.02)", lop: 0.95 }));
  fs.writeFileSync(path.join(im, "editorial.svg"),
    svg("edi", pal, hash(niche.s + "ed"), `${niche.n} workshop`,
      { garment: garmentFor(niche.goods[3][0]), gfill, transform: "translate(0,-10) scale(.96)", lop: 0.8 }));
  niche.cats.forEach((c, i) => {
    fs.writeFileSync(path.join(im, `c${i + 1}.svg`),
      svg(`c${i + 1}`, pal, hash(niche.s + "c" + i), `${c} — ${niche.n}`,
        { garment: garmentFor(niche.goods[i % niche.goods.length][0]), gfill, lop: 0.75 }));
  });
  ["t1", "t2", "t3"].forEach((k, i) => {
    fs.writeFileSync(path.join(im, `${k}.svg`),
      svg(k, pal, hash(niche.s + "t" + i), `${niche.n} detail ${i + 1}`,
        { garment: garmentFor(niche.goods[(i + 2) % niche.goods.length][0]), gfill, lop: 0.85 }));
  });
  ["l1", "l2", "l3"].forEach((k, i) => {
    fs.writeFileSync(path.join(im, `${k}.svg`),
      svg(k, pal, hash(niche.s + "l" + i), `${niche.n} look ${i + 1}`,
        { garment: garmentFor(niche.goods[(i + 1) % niche.goods.length][0]), gfill, transform: "translate(0,10)", lop: 0.9 }));
  });
  ["s1", "s2", "s3"].forEach((k, i) => {
    fs.writeFileSync(path.join(im, `${k}.svg`),
      svg(k, pal, hash(niche.s + "s" + i), `${niche.n} season image ${i + 1}`,
        { garment: garmentFor(niche.goods[(i + 4) % niche.goods.length][0]), gfill, lop: 0.82 }));
  });
  ["j1", "j2", "j3"].forEach((k, i) => {
    fs.writeFileSync(path.join(im, `${k}.svg`),
      svg(k, pal, hash(niche.s + "j" + i), `${niche.n} journal image ${i + 1}`,
        { garment: garmentFor(niche.goods[(i + 3) % niche.goods.length][0]), gfill, lop: 0.7 }));
  });
}

/* ------------------------------------------------------------------- build */
function buildSite(niche, i) {
  const { pal, font, layout } = choose(niche, i);
  _curLayout = layout;
  const imgs = imageNames(niche, hash(niche.s));
  const dir = path.join(SITES, niche.s);
  fs.mkdirSync(path.join(dir, "img"), { recursive: true });

  const sections = layout.sections
    .map((id) => SECTION_FN[id](niche, imgs, layout))
    .join("\n\n");

  /* Sections are authored with aria-label only; give each one the anchor the
     navigation points at so in-page links actually land somewhere. */
  const ANCHOR = {
    "Why shop here": "why", "Categories": "categories", "About": "story",
    "Our approach": "story", "Specification": "spec", "Reviews": "reviews",
    "Journal": "journal", "Lookbook": "lookbook", "FAQ": "faq",
    "The numbers": "drop",
  };
  const withAnchors = sections.replace(
    /<section class="([^"]*)" aria-label="([^"]+)">/g,
    (m, cls, label) =>
      ANCHOR[label] ? `<section class="${cls}" id="${ANCHOR[label]}" aria-label="${label}">` : m
  );

  let html = head(niche, pal, font, layout)
    + navFor(niche) + "\n\n"
    + heroFor(layout.hero, niche, imgs) + "\n\n"
    + withAnchors + "\n\n"
    + footerFor(niche) + "\n"
    + `  <script src="script.js"></script>\n</body>\n</html>\n`;

  /* Every nav link must resolve to a real anchor. */
  const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
  html = html.replace(/<a href="#([a-z]+)"[^>]*>([^<]*)<\/a>/g, (m, id, label) =>
    ids.has(id) ? m : `<a href="index.html">${label}</a>`
  );

  fs.writeFileSync(path.join(dir, "index.html"), html);
  fs.writeFileSync(path.join(dir, "style.css"), styleCss(niche, pal, font, layout));
  fs.writeFileSync(path.join(dir, "script.js"), SCRIPT_JS);
  fs.writeFileSync(path.join(dir, "buy.html"), buyHtml(niche, pal, font, layout));
  fs.writeFileSync(path.join(dir, "README.md"), readmeMd(niche, pal, font, layout));
  fs.writeFileSync(path.join(dir, "INSTALL.md"), installMd(niche));
  writeImages(dir, niche, pal, imgs);

  return { slug: niche.s, name: niche.n, cat: niche.cat, pal: pal.k, font: font.k,
           layout: layout.id, dir,
           blurb: `${niche.cat} store: ${niche.hero[1].replace(/<[^>]+>/g, "").slice(0, 96)}` };
}

function main() {
  const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
  const list = only ? NICHES.filter((n) => n.s === only || n.s === only.replace(/\/$/, "")) : NICHES;
  const out = [];
  for (let i = 0; i < NICHES.length; i++) {
    const niche = NICHES[i];
    if (only && !list.includes(niche)) continue;
    out.push(buildSite(niche, i));
  }
  const manifest = path.resolve(__dirname, "manifest.json");
  fs.writeFileSync(manifest, JSON.stringify(out, null, 2));
  console.log(`built ${out.length} sites -> ${SITES}`);
  const bytes = out.reduce((a, s) => a + fs.statSync(path.join(s.dir, "index.html")).size, 0);
  console.log(`index.html total: ${(bytes / 1024).toFixed(0)} KB`);
}

if (require.main === module) main();
module.exports = { buildSite, svg, choose, SITE_BASE, esc, money, cap, hash, NICHES };

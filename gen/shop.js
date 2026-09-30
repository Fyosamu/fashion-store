/* ============================================================================
   VERA template generator — shop wiring
   1) Appends every generated clothing template to catalog.js so get.html?sku=
      can price it and release the encrypted ZIP after a USDT transfer.
   2) Builds apparel.html, a searchable/filterable listing of all of them.
   3) Links the new page from the existing shop navigation.
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PRICE = 19;      // USDT charged by get.html
const LIST = 49;       // struck-through price on the cards
const PAGE = "apparel.html";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function load() {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "manifest.json"), "utf8"));
  const packed = JSON.parse(fs.readFileSync(path.join(__dirname, "packed.json"), "utf8"));
  const bySlug = Object.fromEntries(packed.map((p) => [p.slug, p]));
  return manifest.map((m) => ({ ...m, ...bySlug[m.slug] }));
}

/* ------------------------------------------------------------- catalog.js */
function updateCatalog(items) {
  const file = path.join(ROOT, "catalog.js");
  let src = fs.readFileSync(file, "utf8");

  const entries = [];
  for (const it of items) {
    if (src.includes(`"${it.slug}"`)) continue;
    const blurb = `${it.cat} store — ${stripTags(it.hero || it.blurb)} Built with the ${it.layout} layout.`;
    entries.push(
      `  "${it.slug}": { name: ${JSON.stringify(it.name)}, cat: ${JSON.stringify(it.cat)}, ` +
      `price: ${PRICE}, list: ${LIST}, blurb: ${JSON.stringify(blurb)}, ` +
      `demo: "sites/${it.slug}/index.html", enc: "dl/${it.slug}.bin", ` +
      `pass: ${JSON.stringify(require("crypto").createHash("sha256").update("vera-delivery-2026-xk9|" + it.slug, "utf8").digest("hex"))}, file: ${JSON.stringify(it.slug + "-store-template.zip")} },`
    );
  }

  if (entries.length) {
    const close = src.lastIndexOf("};");
    if (close < 0) throw new Error("catalog.js: closing brace not found");
    const needsComma = !src.slice(0, close).trimEnd().endsWith(",");
    src = src.slice(0, close).trimEnd() + (needsComma ? "," : "") + "\n" +
          entries.join("\n") + "\n" + src.slice(close);
    fs.writeFileSync(file, src);
  }
  return entries.length;
}
function stripTags(s) { return String(s).replace(/<[^>]+>/g, ""); }

/* ------------------------------------------------------------ apparel.html */
const FILTERS = [
  ["all", "All"],
  ["street", "Street & casual"],
  ["luxe", "Luxury & formal"],
  ["boutique", "Boutique"],
  ["modern", "Modern & minimal"],
  ["sport", "Sport & utility"],
  ["retro", "Vintage & print"],
  ["resort", "Resort & natural"],
];

function card(it) {
  const save = Math.round((1 - PRICE / LIST) * 100);
  return `        <article class="tpl reveal" data-mood="${it.mood}" data-name="${esc((it.name + " " + it.cat).toLowerCase())}">
          <a class="tpl__media" href="sites/${it.slug}/index.html">
            <img src="sites/${it.slug}/img/p1.svg" alt="${esc(it.name)} ${esc(it.cat)} store demo" loading="lazy" width="400" height="500" />
            <span class="tpl__chip">${esc(it.cat)}</span>
          </a>
          <div class="tpl__body">
            <h3>${esc(it.name)}</h3>
            <p>${esc(it.line)}</p>
            <div class="tpl__foot">
              <span class="tpl__price"><s>$${LIST}</s> ${PRICE} <small>USDT</small></span>
              <em class="tpl__save">${save}% off</em>
              <a class="btn btn--sm" href="sites/${it.slug}/buy.html">Buy template</a>
              <a class="btn btn--ghost btn--sm" href="sites/${it.slug}/index.html">Live demo</a>
            </div>
          </div>
        </article>`;
}

function buildPage(items) {
  const cards = items.map(card).join("\n\n");
  const groups = {};
  items.forEach((i) => { groups[i.mood] = (groups[i.mood] || 0) + 1; });
  const moodCounts = FILTERS.map(([k, label]) => {
    if (k === "all") return `<button class="tab is-on" data-mood="all">All ${items.length}</button>`;
    return `<button class="tab" data-mood="${k}">${label} <span>${groups[k] || 0}</span></button>`;
  }).join("\n        ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${items.length} clothing store templates — apparel, fashion &amp; streetwear · VERA Atelier</title>
  <meta name="description" content="${items.length} complete clothing store templates: streetwear, luxury, bridal, denim, activewear, vintage, kidswear and more. Each with its own palette, typography and page architecture. Fully responsive, SEO markup included. List $49, standing price 19 USDT, paid on-chain and unlocked in seconds." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://fyosamu.github.io/fashion-store/apparel.html" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${items.length} clothing store templates — 19 USDT each" />
  <meta property="og:description" content="${items.length} responsive clothing store templates, each with a different palette, type pairing and layout. Instant on-chain delivery." />
  <meta property="og:url" content="https://fyosamu.github.io/fashion-store/apparel.html" />
  <meta property="og:image" content="https://fyosamu.github.io/fashion-store/lookbook.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="100 clothing store templates — 19 USDT each" />
  <meta name="twitter:description" content="One hundred responsive clothing store templates, each with a different palette, type pairing and layout. Instant on-chain delivery." />
  <meta name="twitter:image" content="https://fyosamu.github.io/fashion-store/lookbook.jpg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
  <style>
    /* Apparel listing — a search box, mood tabs and a live count on top of
       the shared .tpl grid. Kept local so templates.html is untouched. */
    .shop-tools{display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin:26px 0 8px}
    .shop-search{flex:1;min-width:250px;display:flex;align-items:center;gap:10px;
      background:#fff;border:1px solid var(--line,#e6e2da);border-radius:12px;padding:13px 16px}
    .shop-search input{border:0;outline:0;background:none;width:100%;font:inherit}
    .tabbar{display:flex;gap:9px;flex-wrap:wrap;margin:6px 0 28px}
    .tab{background:#fff;border:1px solid var(--line,#e6e2da);border-radius:999px;
      padding:9px 17px;font:inherit;font-size:.86rem;font-weight:600;cursor:pointer;transition:.16s}
    .tab:hover{border-color:currentColor}
    .tab.is-on{background:var(--ink,#17171a);color:var(--bg,#fff);border-color:var(--ink,#17171a)}
    .tab span{opacity:.6;margin-left:5px;font-weight:500}
    .shop-count{font-size:.9rem;opacity:.7;margin-bottom:18px}
    .tpl.is-hidden{display:none}
    .shop-empty{display:none;padding:50px 0;text-align:center;opacity:.7}
    .shop-empty.is-on{display:block}
    .shop-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:30px 0 6px}
    @media(max-width:760px){.shop-stats{grid-template-columns:1fr 1fr}}
    .shop-stats div{background:#fff;border:1px solid var(--line,#e6e2da);border-radius:12px;padding:18px}
    .shop-stats b{display:block;font-family:Fraunces,Georgia,serif;font-size:1.7rem;line-height:1.1}
    .shop-stats span{font-size:.76rem;letter-spacing:.12em;text-transform:uppercase;opacity:.65}
  </style>
  <script type="application/ld+json">
{"@context":"https://schema.org","@type":"ItemList","name":"Clothing store templates","numberOfItems":${items.length},
 "itemListElement":[${items.map((it, i) => `{"@type":"ListItem","position":${i + 1},"item":{"@type":"Product","name":${JSON.stringify(it.name + " — clothing store template")},"description":${JSON.stringify(it.line)},"image":"https://fyosamu.github.io/fashion-store/sites/${it.slug}/img/p1.svg","offers":{"@type":"Offer","price":"${PRICE}","priceCurrency":"USD","availability":"https://schema.org/InStock","url":"https://fyosamu.github.io/fashion-store/get.html?sku=${it.slug}"}}}`).join(",")}]}
  </script>
</head>
<body>

  <div class="topbar">100 clothing store templates &nbsp;&mdash;&nbsp; <span>Was $${LIST}, now ${PRICE} USDT &middot; instant on-chain delivery, no account</span></div>

  <header class="nav">
    <div class="container nav__inner">
      <a href="index.html" class="brand"><b>VERA</b><small>Atelier</small></a>
      <nav class="nav__links" id="navLinks">
        <a href="index.html">Home</a>
        <a href="templates.html">Templates</a>
        <a href="${PAGE}" class="is-active">Clothing</a>
        <a href="kit.html">Kit</a>
        <a href="plugin.html">WP Plugin</a>
        <a href="about.html">About us</a>
        <a href="contact.html">Contact</a>
      </nav>
      <div class="nav__tools">
        <button class="nav__toggle" id="navToggle" aria-label="Menu"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>

  <section class="page-head">
    <div class="container">
      <div class="crumbs reveal"><a href="templates.html">Templates</a> / <span>Clothing stores</span></div>
      <span class="eyebrow reveal">100 complete storefronts</span>
      <h1 class="reveal">Clothing store templates</h1>
      <p class="lead reveal">Every one is a different shop: its own palette, its own type pairing, its own page architecture. Streetwear, bridal, denim, scrubs, sneakers, modest wear, vintage — all responsive, all SEO-marked, all built from plain HTML, CSS and a few kilobytes of JavaScript.</p>
      <div class="shop-stats reveal">
        <div><b>100</b><span>storefronts</span></div>
        <div><b>11</b><span>page architectures</span></div>
        <div><b>31</b><span>colour palettes</span></div>
        <div><b>${PRICE} USDT</b><span>each, one-time</span></div>
      </div>
    </div>
  </section>

  <section class="section" id="grid">
    <div class="container">
      <div class="shop-tools reveal">
        <div class="shop-search">
          <span aria-hidden="true">&#9906;</span>
          <input id="shopQ" type="search" placeholder="Search bridal, denim, sneakers, scrubs…" aria-label="Search templates" />
        </div>
        <a class="btn btn--sm" href="templates.html">All templates</a>
      </div>

      <div class="tabbar reveal" id="shopTabs">
        ${moodCounts}
      </div>

      <p class="shop-count" id="shopCount">${items.length} templates</p>

      <div class="tpl-grid" id="shopGrid">
${cards}
      </div>

      <p class="shop-empty" id="shopEmpty">No template matches that. Try “denim”, “bridal” or clear the search.</p>
    </div>
  </section>

  <section class="section section--tint" id="how">
    <div class="container">
      <div class="section__head reveal">
        <div><span class="eyebrow">How it works</span><h2>Pay, paste the hash, download</h2></div>
        <a class="link-arrow" href="get.html?sku=${items[0].slug}">Open a checkout &#8594;</a>
      </div>
      <div class="steps steps--2">
        <div class="step reveal"><span class="num">01</span><h3>Send ${PRICE} USDT</h3><p>The checkout shows a QR for your Trust Wallet. Ethereum, Tron, BSC, Polygon and Solana are accepted; a card also works.</p></div>
        <div class="step reveal"><span class="num">02</span><h3>Paste your transaction hash</h3><p>Your browser reads the transfer straight off the chain — six public nodes are tried in turn. No account, nothing stored.</p></div>
        <div class="step reveal"><span class="num">03</span><h3>The ZIP unlocks</h3><p>Decrypted locally in the page and handed to you as a normal download, usually within a minute of the transfer confirming.</p></div>
        <div class="step reveal"><span class="num">04</span><h3>Open index.html</h3><p>It runs offline. One <code>:root</code> block repaints the whole site, and <code>INSTALL.md</code> lists what to change first.</p></div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div>
          <a href="index.html" class="brand"><b>VERA</b><small>Atelier</small></a>
          <p>Complete store templates sold in USDT — verified on-chain and delivered automatically.</p>
        </div>
        <div>
          <h4>Templates</h4>
          <ul>
            <li><a href="templates.html">All templates</a></li>
            <li><a href="${PAGE}">100 clothing stores</a></li>
            <li><a href="kit.html">Elementor Kit</a></li>
            <li><a href="plugin.html">USDT Deliver plugin</a></li>
          </ul>
        </div>
        <div>
          <h4>Delivery</h4>
          <ul><li>Automatic, 24/7</li><li>Verified on-chain</li><li>MIT licensed</li><li>Backup link by email</li></ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul><li><a href="contact.html">hkay7645@gmail.com</a></li><li><a href="contact.html">Support</a></li><li>USDT (ERC-20 / BEP-20)</li></ul>
        </div>
      </div>
      <div class="footer__bottom">
        <span>&copy; <span id="year"></span> VERA Templates. All rights reserved.</span>
        <span>Automatic delivery &mdash; No account required</span>
      </div>
    </div>
  </footer>

  <div class="toast" id="toast"></div>
  <script src="script.js"></script>
  <script>
  (function () {
    "use strict";
    var q = document.getElementById("shopQ"),
        tabs = document.getElementById("shopTabs"),
        grid = document.getElementById("shopGrid"),
        count = document.getElementById("shopCount"),
        empty = document.getElementById("shopEmpty");
    if (!grid) return;
    var cards = [].slice.call(grid.querySelectorAll(".tpl"));
    var mood = "all";

    function apply() {
      var term = (q.value || "").trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var okMood = mood === "all" || c.dataset.mood === mood;
        var okTerm = !term || c.dataset.name.indexOf(term) > -1;
        var on = okMood && okTerm;
        c.classList.toggle("is-hidden", !on);
        if (on) shown++;
      });
      count.textContent = shown + (shown === 1 ? " template" : " templates");
      empty.classList.toggle("is-on", shown === 0);
    }

    q.addEventListener("input", apply);
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest(".tab");
      if (!b) return;
      [].slice.call(tabs.children).forEach(function (t) { t.classList.remove("is-on"); });
      b.classList.add("is-on");
      mood = b.dataset.mood;
      apply();
    });

    if (location.hash === "#grid") {
      setTimeout(function () {
        var el = document.getElementById("grid");
        if (el) el.scrollIntoView();
      }, 100);
    }
  })();
  </script>
</body>
</html>
`;
}

/* ----------------------------------------------------- navigation back-links */
function linkFromTemplates(items) {
  const file = path.join(ROOT, "templates.html");
  let src = fs.readFileSync(file, "utf8");
  let changed = false;

  if (!src.includes(PAGE)) {
    src = src.replace(
      `<a href="templates.html" class="is-active">Templates</a>`,
      `<a href="templates.html" class="is-active">Templates</a>\n        <a href="${PAGE}">Clothing &times;100</a>`
    );
    if (!src.includes(PAGE)) {
      src = src.replace(`</nav>`, `  <a href="${PAGE}">Clothing &times;100</a>\n      </nav>`);
    }
    changed = true;
  }
  if (changed) fs.writeFileSync(file, src);
  return changed;
}

function linkFromIndex() {
  const file = path.join(ROOT, "index.html");
  if (!fs.existsSync(file)) return false;
  let src = fs.readFileSync(file, "utf8");
  if (src.includes(PAGE)) return false;
  const nav = `<a href="templates.html" class="is-active">Templates</a>`;
  if (src.includes(nav)) {
    src = src.replace(nav, `${nav}\n        <a href="${PAGE}">Clothing &times;100</a>`);
  } else {
    const other = `<a href="templates.html">Templates</a>`;
    if (!src.includes(other)) return false;
    src = src.replace(other, `${other}\n        <a href="${PAGE}">Clothing &times;100</a>`);
  }
  fs.writeFileSync(file, src);
  return true;
}

/* One sitemap for the whole shop so search engines can find 115 templates,
   and a robots.txt that points at it while keeping the encrypted payloads
   and the generator out of the index. */
function buildSitemap(items) {
  const BASE = "https://fyosamu.github.io/fashion-store";
  const now = new Date().toISOString().slice(0, 10);
  const urls = [
    [`${BASE}/`, "1.0", "daily"],
    [`${BASE}/templates.html`, "0.9", "weekly"],
    [`${BASE}/${PAGE}`, "0.9", "weekly"],
    [`${BASE}/get.html`, "0.8", "weekly"],
    [`${BASE}/kit.html`, "0.8", "weekly"],
    [`${BASE}/plugin.html`, "0.8", "weekly"],
    [`${BASE}/categories.html`, "0.7", "weekly"],
    [`${BASE}/about.html`, "0.6", "monthly"],
    [`${BASE}/contact.html`, "0.6", "monthly"],
    /* manifest.json knows only the 100 apparel templates, but the catalogue
       also sells the 13 originals that predate it. Read the site list from
       catalog.js so every demo we can sell is declared, not just the ones the
       manifest happens to contain. */
    ...[...new Set([
      ...items.map((i) => i.slug),
      ...[...fs.readFileSync(path.join(ROOT, "catalog.js"), "utf8")
        .matchAll(/demo:\s*"sites\/([^/]+)\//g)].map((m) => m[1]),
    ])].map((slug) => [`${BASE}/sites/${slug}/`, "0.8", "monthly"]),
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(([loc, pri, freq]) =>
      `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`
    ).join("\n") +
    `\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);

  const rfile = path.join(ROOT, "robots.txt");
  if (!fs.existsSync(rfile)) {
    fs.writeFileSync(rfile,
      `User-agent: *\nAllow: /\nDisallow: /dl/\nDisallow: /gen/\n\n` +
      `# ${items.length} clothing store templates (full catalogue in catalog.js)\n` +
      `Sitemap: ${BASE}/sitemap.xml\n`);
  }
  return urls.length;
}

function main() {
  const items = load();
  const missing = items.filter((i) => !i.pass);
  if (missing.length) throw new Error("no packed data for: " + missing.map((m) => m.slug).join(", "));
  /* mood comes from the niche, so pull it back in for filtering */
  const { NICHES } = require("./niches.js");
  const bySlug = Object.fromEntries(NICHES.map((n) => [n.s, n]));
  items.forEach((i) => {
    const n = bySlug[i.slug];
    i.mood = n ? n.m : "modern";
    i.hero = n ? n.hero[1] : i.blurb;
    i.line = `${i.cat} shop with the ${i.layout} layout, a ${i.palette} palette and ${i.font} type. Responsive, SEO-marked, ${30} files of source.`;
  });

  const added = updateCatalog(items);
  fs.writeFileSync(path.join(ROOT, PAGE), buildPage(items));
  const sitemapUrls = buildSitemap(items);
  const fromTemplates = linkFromTemplates(items);
  const fromIndex = linkFromIndex();

  console.log(`catalog.js  +${added} entries`);
  console.log(`page        ${PAGE} (${(fs.statSync(path.join(ROOT, PAGE)).size / 1024).toFixed(0)} KB)`);
  console.log(`sitemap     ${sitemapUrls} urls + robots.txt`);
  console.log(`nav link on templates.html: ${fromTemplates}, index.html: ${fromIndex}`);
}

main();

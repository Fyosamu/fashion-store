/* ============================================================================
   VERA template generator — audit
   Checks every generated storefront the way a browser and a crawler would:
   structure, link integrity, CSS token closure, contrast, and uniqueness.
   Exits non-zero if anything is broken.
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const { PALETTES, FONTS } = require("./design.js");
const { LAYOUTS } = require("./layouts.js");
const { NICHES } = require("./niches.js");

const ROOT = path.resolve(__dirname, "..");
const SITES = path.join(ROOT, "sites");

/* ------------------------------------------------------------- contrast */
function srgb(c) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function lum(hex) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}
function contrast(a, b) {
  const l1 = lum(a);
  const l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/* --------------------------------------------------------------- helpers */
function balanced(css) {
  let depth = 0;
  for (const ch of css) {
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth < 0) return false;
    }
  }
  return depth === 0;
}
function definedVars(css) {
  const s = new Set();
  for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:/gi)) s.add(m[1]);
  return s;
}
function usedVars(css) {
  const s = new Set();
  for (const m of css.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) s.add(m[1]);
  return s;
}
/* The literal values in the :root block — what the page really paints with. */
function rootTokens(css) {
  const block = css.match(/:root\s*\{([\s\S]*?)\}/);
  if (!block) return {};
  const out = {};
  for (const m of block[1].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)/gi)) out[m[1]] = m[2].trim();
  return out;
}
function resolveTargets(html, dir) {
  const missing = [];
  const seen = new Set();
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = m[1];
    if (/^(https?:|mailto:|tel:|data:|#|\/)/i.test(raw)) continue;
    const clean = raw.split("?")[0].split("#")[0];
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    if (!fs.existsSync(path.join(dir, clean))) missing.push(clean);
  }
  return missing;
}

/* ------------------------------------------------------------------ audit */
function auditSite(niche) {
  const dir = path.join(SITES, niche.s);
  const errs = [];
  const warns = [];
  const files = ["index.html", "style.css", "script.js", "buy.html", "README.md", "INSTALL.md"];

  if (!fs.existsSync(dir)) return { slug: niche.s, errs: ["directory missing"], warns };
  for (const f of files) if (!fs.existsSync(path.join(dir, f))) errs.push("missing " + f);
  if (errs.length) return { slug: niche.s, errs, warns };

  const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(dir, "style.css"), "utf8");
  const js = fs.readFileSync(path.join(dir, "script.js"), "utf8");
  const buy = fs.readFileSync(path.join(dir, "buy.html"), "utf8");

  /* --- structure --------------------------------------------------- */
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) errs.push("h1 count = " + h1s);
  if (!/<meta name="description"/.test(html)) errs.push("no meta description");
  if (!/<link rel="canonical"/.test(html)) errs.push("no canonical");
  if (!/og:image/.test(html)) errs.push("no og:image");
  if (!/theme-color/.test(html)) errs.push("no theme-color");
  if (!/name="viewport"/.test(html)) errs.push("no viewport");
  if (!/<html lang=/.test(html)) errs.push("no lang attribute");
  if (!/class="skip"/.test(html)) errs.push("no skip link");

  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!ld) {
    errs.push("no JSON-LD");
  } else {
    try {
      const parsed = JSON.parse(ld[1]);
      const graph = parsed["@graph"] || [parsed];
      const types = graph.map((n) => n["@type"]);
      if (!types.includes("ClothingStore")) errs.push("JSON-LD missing ClothingStore");
      if (!types.includes("ItemList")) errs.push("JSON-LD missing ItemList");
      const items = graph.find((n) => n["@type"] === "ItemList");
      if (items && items.itemListElement.length !== niche.goods.length) {
        errs.push("ItemList has " + items.itemListElement.length + ", expected " + niche.goods.length);
      }
      const store = graph.find((n) => n["@type"] === "ClothingStore");
      if (store && !/fyosamu\.github\.io/.test(store.url || "")) errs.push("ClothingStore url not absolute");
    } catch (e) {
      errs.push("JSON-LD does not parse: " + e.message.slice(0, 60));
    }
  }

  /* heading order: nothing should jump more than one level */
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      warns.push("heading jump h" + levels[i - 1] + "->h" + levels[i]);
      break;
    }
  }

  /* --- link integrity ---------------------------------------------- */
  const missingLinks = resolveTargets(html, dir);
  if (missingLinks.length) errs.push("broken refs: " + missingLinks.slice(0, 4).join(", "));
  const missingBuy = resolveTargets(buy, dir);
  if (missingBuy.length) errs.push("buy.html broken refs: " + missingBuy.slice(0, 3).join(", "));

  const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
  const anchors = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))];
  const dead = anchors.filter((a) => !ids.has(a));
  if (dead.length) errs.push("dead anchors: " + dead.join(", "));

  /* --- CSS --------------------------------------------------------- */
  if (!balanced(css)) errs.push("style.css braces unbalanced");

  /* --cols and --gap are declared on the element that needs them, so a token
     can legitimately be absent from the stylesheet. Collect the inline ones. */
  const inline = new Set();
  for (const m of html.matchAll(/style="([^"]+)"/g)) {
    for (const v of m[1].matchAll(/(--[a-z0-9-]+)\s*:/gi)) inline.add(v[1]);
  }
  const def = definedVars(css);
  const used = usedVars(css);
  const undef = [...used].filter((v) => !def.has(v) && !inline.has(v));
  if (undef.length) errs.push("undefined css vars: " + undef.slice(0, 5).join(", "));

  /* Every pair the generated rules actually paint. --ac-t is derived in
     build.js precisely so these hold; if it ever stops being derived, or the
     derivation drifts from the surfaces it is used on, this is what catches it. */
  const root = rootTokens(css);
  /* Two border tokens ship as 8-digit hex on purpose (a hairline that fades out
     with the page). Alpha is not what the contrast ratio is about, so read the
     RGB. */
  const H = (v) => (v && /^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(v) ? v.slice(0, 7) : null);
  const pairs = [
    ["body text on bg", "ink", "bg", 4.5],
    ["body text on sf", "ink", "sf", 4.5],
    ["body text on card", "ink", "card", 4.5],
    ["muted text on bg", "mut", "bg", 4.5],
    ["muted text on sf", "mut", "sf", 4.5],
    ["button label on accent", "ack", "ac", 4.5],
    ["accent type on bg", "ac-t", "bg", 4.5],
    ["accent type on sf", "ac-t", "sf", 4.5],
    ["accent type on card", "ac-t", "card", 4.5],
    ["accent type on sf2", "ac-t", "sf2", 4.5],
  ];
  for (const [label, a, b, min] of pairs) {
    const A = H(root["--" + a]), B = H(root["--" + b]);
    if (!A || !B) { errs.push("missing token --" + (A ? b : a)); continue; }
    const c = contrast(A, B);
    if (c < min) errs.push(label + " = " + c.toFixed(2));
  }
  if (!root["--ln"]) errs.push("no --ln token (BASE_CSS draws borders from it)");
  if (!root["--ac-t"]) errs.push("no --ac-t token");
  if (!/prefers-reduced-motion/.test(css)) warns.push("no reduced-motion block");
  if (!/@media[^{]*max-width:\s*900px/.test(css)) warns.push("no 900px breakpoint");
  if (!/@media[^{]*max-width:\s*6[0-9][0-9]px/.test(css)) warns.push("no phone breakpoint");

  /* --- JS ---------------------------------------------------------- */
  try {
    new Function(js);
  } catch (e) {
    errs.push("script.js syntax: " + e.message.slice(0, 60));
  }
  if (js.length > 6 * 1024) warns.push("script.js " + (js.length / 1024).toFixed(1) + " KB");
  if (!/prefers-reduced-motion/.test(js)) warns.push("script.js ignores reduced motion");

  /* --- assets ------------------------------------------------------ */
  const imgDir = path.join(dir, "img");
  const imgs = fs.existsSync(imgDir) ? fs.readdirSync(imgDir) : [];
  if (imgs.length !== 24) errs.push("img count " + imgs.length + ", expected 24");
  for (const i of imgs) {
    const s = fs.readFileSync(path.join(imgDir, i), "utf8");
    if (!/^<svg/.test(s.trim())) errs.push(i + " is not SVG");
    if (!/<title>/.test(s)) warns.push(i + " has no <title>");
  }
  const declared = [...html.matchAll(/<img src="img\/([^"]+)"/g)].map((m) => m[1]);
  const unresolved = [...new Set(declared)].filter((f) => !imgs.includes(f));
  if (unresolved.length) errs.push("img refs with no file: " + unresolved.join(", "));

  /* --- page weight -------------------------------------------------- */
  const kb = (html.length + css.length + js.length + buy.length) / 1024;
  if (kb > 90) warns.push("page weight " + kb.toFixed(0) + " KB");

  return { slug: niche.s, errs, warns, kb: +kb.toFixed(1) };
}

/* ---------------------------------------------------------- uniqueness */
function auditUniqueness() {
  const combos = new Map();
  const tri = new Map();
  const byLayout = {};
  const byPal = {};
  const byFont = {};
  const problems = [];

  /* Use the real chooser, not a re-implementation — the point of this check
     is to catch the generator drifting from what it is meant to produce. */
  const { choose } = require("./build.js");

  NICHES.forEach((n, i) => {
    const chosen = choose(n, i);
    const pal = chosen.pal;
    const font = chosen.font;
    const layout = chosen.layout;
    const pair = n.l + "|" + pal.k;
    const triplet = pair + "|" + font.k;
    combos.set(pair, (combos.get(pair) || 0) + 1);
    tri.set(triplet, (tri.get(triplet) || 0) + 1);
    byLayout[n.l] = (byLayout[n.l] || 0) + 1;
    byPal[pal.k] = (byPal[pal.k] || 0) + 1;
    byFont[font.k] = (byFont[font.k] || 0) + 1;
    if (pal.m !== n.m) problems.push(n.s + ": palette mood " + pal.m + " != niche mood " + n.m);
    if (layout.id !== n.l) problems.push(n.s + ": layout " + layout.id + " != " + n.l);
  });

  const dupes = [...combos.entries()].filter(([, c]) => c > 1);
  const triDupes = [...tri.entries()].filter(([, c]) => c > 1);
  return {
    layoutsUsed: Object.keys(byLayout).length,
    palettesUsed: Object.keys(byPal).length,
    fontsUsed: Object.keys(byFont).length,
    layoutsTotal: LAYOUTS.length,
    palettesTotal: PALETTES.length,
    fontsTotal: FONTS.length,
    maxPairReuse: Math.max(...combos.values()),
    maxTripletReuse: Math.max(...tri.values()),
    distinctPairs: combos.size,
    distinctTriplets: tri.size,
    dupePairs: dupes.slice(0, 5),
    dupeTriplets: triDupes.slice(0, 5),
    problems,
  };
}

/* WCAG AA on the token pairs the generated CSS actually paints.

   Note the accent: `--ac` only ever fills a block behind `--ack`, a pair the
   palette itself has to guarantee. The accent *as type* is derived per theme by
   accentText(), so this checks the derivation rather than the raw hex — a bright
   signal yellow is a perfectly good fill and an unreadable headline. */
function auditContrast() {
  const { accentText, mixHex } = require("./design.js");
  const fails = [];
  for (const p of PALETTES) {
    const checks = [
      ["body text (ink on bg)", p.ink, p.bg, 4.5],
      ["body on surface", p.ink, p.sf, 4.5],
      ["muted on bg", p.mut, p.bg, 4.5],
      ["muted on surface", p.mut, p.sf, 4.5],
      ["button label (ack on ac)", p.ack, p.ac, 4.5],
    ];
    for (const [label, fg, bg, min] of checks) {
      const c = contrast(fg, bg);
      if (c < min) fails.push(p.k + ": " + label + " = " + c.toFixed(2) + " (needs " + min + ")");
    }

    const card = p.on ? p.sf : "#ffffff";
    const sf2 = p.on ? p.ln : p.sf;
    const tint = mixHex(p.bg, p.ac, 0.2);
    const acT = accentText(p.ac, [p.bg, p.sf, card, sf2, tint, mixHex(p.sf, p.ac, 0.2)]);
    const surfaces = { bg: p.bg, sf: p.sf, card, sf2, "20% tint": tint };
    for (const where of Object.keys(surfaces)) {
      const c = contrast(acT, surfaces[where]);
      if (c < 4.5) fails.push(p.k + ": accent type on " + where + " = " + c.toFixed(2) + " (needs 4.5)");
    }
  }
  return fails;
}

/* ------------------------------------------------------------------- main */
function main() {
  const results = NICHES.map(auditSite);
  const bad = results.filter((r) => r.errs.length);
  const allWarns = results.flatMap((r) => r.warns.map((w) => r.slug + ": " + w));
  const warnCounts = {};
  allWarns.forEach((w) => {
    const k = w.split(": ").slice(1).join(": ");
    warnCounts[k] = (warnCounts[k] || 0) + 1;
  });

  console.log("audited " + results.length + " templates");
  console.log("  pass          " + (results.length - bad.length));
  console.log("  fail          " + bad.length);
  const kbs = results.map((r) => r.kb).filter(Boolean);
  const avgKb = kbs.reduce((a, b) => a + b, 0) / kbs.length;
  console.log(
    "  page weight   min " + Math.min(...kbs) + " / avg " + avgKb.toFixed(1) + " / max " + Math.max(...kbs) + " KB"
  );

  if (bad.length) {
    console.log("\nFAILURES");
    bad.slice(0, 25).forEach((r) => console.log("  " + r.slug + ": " + r.errs.join(" | ")));
  }
  const entries = Object.entries(warnCounts).sort((a, b) => b[1] - a[1]);
  if (entries.length) {
    console.log("\nWARNINGS (count)");
    entries.slice(0, 12).forEach(([k, v]) => console.log("  " + v + "  " + k));
  }

  const cf = auditContrast();
  console.log("\nCONTRAST");
  console.log("  palettes " + PALETTES.length + ", WCAG AA failures " + cf.length);
  cf.slice(0, 10).forEach((f) => console.log("    " + f));

  const u = auditUniqueness();
  console.log("\nUNIQUENESS");
  console.log("  layouts used      " + u.layoutsUsed + " / " + u.layoutsTotal);
  console.log("  palettes used     " + u.palettesUsed + " / " + u.palettesTotal);
  console.log("  fonts used        " + u.fontsUsed + " / " + u.fontsTotal);
  console.log("  layout+palette pairs       " + u.distinctPairs);
  console.log("  max reuse of one pair      " + u.maxPairReuse);
  console.log("  layout+palette+font sets   " + u.distinctTriplets);
  console.log("  max reuse of one triplet   " + u.maxTripletReuse);
  if (u.dupeTriplets.length) {
    console.log("  repeated triplets:");
    u.dupeTriplets.forEach(([k, c]) => console.log("    " + c + "x  " + k));
  }
  if (u.problems.length) {
    console.log("  MISMATCHES");
    u.problems.forEach((p) => console.log("    " + p));
  }

  process.exit(bad.length || u.problems.length || cf.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { auditSite, contrast, auditContrast, auditUniqueness };

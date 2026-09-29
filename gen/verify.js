/* ============================================================================
   VERA template generator — live delivery check

   Everything else in gen/ tests the files on disk. This tests the thing a
   buyer actually touches: the catalogue the browser loads, the encrypted
   payload GitHub Pages serves, and the decryption get.html performs in the
   visitor's browser. A push can leave those three out of step — the payload
   re-encrypted with a password the deployed catalogue no longer holds — and
   nothing local would notice.

   Run after every deploy:  node gen/verify.js
   Exits non-zero if the store could not hand a paying customer their ZIP.
   ========================================================================== */
"use strict";

const BASE = "https://fyosamu.github.io/fashion-store";
const ITERATIONS = 150000;
const crypto = require("crypto");
const vm = require("vm");

async function get(path, binary) {
  /* Pages occasionally drops a connection mid-burst; a delivery check should
     not report the store as broken because of one refused socket. */
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(BASE + path, { redirect: "follow" });
      if (!r.ok) throw new Error(`${path} -> HTTP ${r.status}`);
      return binary ? Buffer.from(await r.arrayBuffer()) : r.text();
    } catch (e) {
      last = e;
      const cause = e && e.cause ? ` (${e.cause.message || e.cause.code || ""})` : "";
      if (e && e.message && e.message.startsWith(`${path} -> HTTP`)) throw e;
      if (attempt < 2) {
        console.log(`    retry ${path}${cause}`);
        await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
      }
    }
  }
  throw new Error(`${path}: ${last.message}${last.cause ? " (" + (last.cause.message || last.cause.code) + ")" : ""}`);
}

/* The same container walk get.html does. */
function openContainer(bin, pass) {
  if (bin.subarray(0, 5).toString("ascii") !== "VERA1") throw new Error("bad magic");
  const salt = bin.subarray(5, 21);
  const iv = bin.subarray(21, 37);
  const mac = bin.subarray(37, 69);
  const ct = bin.subarray(69);
  const bits = crypto.pbkdf2Sync(Buffer.from(pass, "utf8"), salt, ITERATIONS, 64, "sha256");
  const ok = crypto
    .createHmac("sha256", bits.subarray(32, 64))
    .update(Buffer.concat([bin.subarray(0, 37), ct]))
    .digest()
    .equals(mac);
  if (!ok) throw new Error("HMAC rejected — password does not match this payload");
  const dec = crypto.createDecipheriv("aes-256-cbc", bits.subarray(0, 32), iv);
  return Buffer.concat([dec.update(ct), dec.final()]);
}

function zipNames(plain) {
  const names = [];
  let p = 0;
  while (p + 30 <= plain.length && plain.readUInt32LE(p) === 0x04034b50) {
    const nlen = plain.readUInt16LE(p + 26);
    const csz = plain.readUInt32LE(p + 18);
    names.push(plain.subarray(p + 30, p + 30 + nlen).toString("utf8"));
    p += 30 + nlen + csz;
  }
  return names;
}

/* Read the catalogue the way the browser does: it is a script that assigns a
   global, not a JSON document — the property names are unquoted. */
function parseCatalog(src) {
  const box = { window: {} };
  vm.runInNewContext(src, box, { timeout: 5000, filename: "catalog.js" });
  const cat = box.window.VERA_CATALOG;
  if (!cat || typeof cat !== "object") throw new Error("window.VERA_CATALOG not set");
  return cat;
}

async function main() {
  const failures = [];
  const report = [];

  /* Node's first few sockets to Pages time out on this machine, every run,
     while PowerShell fetches the same URL on the first try. Warm one up so the
     results below describe the store rather than the network stack. */
  for (let i = 0; i < 5; i++) {
    try { await get("/robots.txt", false); break; }
    catch (e) { if (i === 4) { console.error("cannot reach " + BASE + ": " + e.message); process.exit(2); } }
  }

  /* --- shop shell ---------------------------------------------------- */
  for (const page of ["/apparel.html", "/sitemap.xml", "/robots.txt", "/get.html"]) {
    try {
      const t = await get(page, false);
      report.push(`  ok   ${page.padEnd(16)} ${t.length} B`);
    } catch (e) {
      failures.push(`${page}: ${e.message}`);
      report.push(`  FAIL ${page} — ${e.message}`);
    }
  }

  /* --- catalogue ----------------------------------------------------- */
  let cat;
  try {
    const src = await get("/catalog.js", false);
    cat = parseCatalog(src);
    const keys = Object.keys(cat);
    const missing = keys.filter((k) => !cat[k].enc || !cat[k].pass);
    report.push(`  ok   catalogue       ${keys.length} SKUs, ${missing.length} without delivery keys`);
    if (missing.length) failures.push("catalogue entries missing enc/pass: " + missing.slice(0, 5).join(", "));
    if (keys.length < 110) failures.push(`catalogue has only ${keys.length} SKUs, expected 115`);
  } catch (e) {
    failures.push("catalogue unreadable: " + e.message);
  }

  /* --- delivery: newest batch plus a sample of the older themes ------ */
  if (cat) {
    const keys = Object.keys(cat);
    const fresh = ["plain-theory", "static-hearts", "hemline", "nocturne-supply", "sovereign-prom"];
    const sample = fresh.filter((k) => keys.includes(k)).slice(0, 3);
    /* plus two from the original 13 so the older payloads stay covered */
    sample.push(...keys.filter((k) => !fresh.includes(k)).slice(0, 2));

    for (const slug of sample) {
      try {
        const bin = await get(`/dl/${slug}.bin`, true);
        const zip = openContainer(bin, cat[slug].pass);
        const names = zipNames(zip);
        if (!names.includes("index.html")) throw new Error("no index.html in archive");
        if (!names.includes("style.css")) throw new Error("no style.css in archive");
        if (!names.some((n) => n.startsWith("img/"))) throw new Error("no artwork in archive");
        report.push(
          `  ok   ${slug.padEnd(16)} ${(bin.length / 1024).toFixed(0)} KB, ${names.length} files, decrypts`
        );
      } catch (e) {
        failures.push(`${slug}: ${e.message}`);
        report.push(`  FAIL ${slug} — ${e.message}`);
      }
    }
  }

  /* --- demo pages resolve ------------------------------------------- */
  try {
    const html = await get("/apparel.html", false);
    const demos = [...html.matchAll(/sites\/([a-z0-9-]+)\//g)].map((m) => m[1]);
    const unique = [...new Set(demos)];
    report.push(`  ok   listing links   ${unique.length} demo storefronts`);
    if (unique.length < 100) failures.push(`apparel.html links only ${unique.length} demos`);
  } catch (e) {
    /* already reported above */
  }

  console.log("live store check — " + BASE);
  report.forEach((r) => console.log(r));
  if (failures.length) {
    console.log("\nFAILED");
    failures.forEach((f) => console.log("  " + f));
    process.exit(1);
  }
  console.log("\nall delivery paths healthy");
}

main().catch((e) => {
  console.error("live check crashed: " + e.message);
  process.exit(1);
});

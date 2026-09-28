/* ============================================================================
   VERA template generator — packer
   Zips each generated store and encrypts it in exactly the format get.html
   decrypts, so the shop can release it the moment a USDT payment lands.

   VERA1 container layout:
     0   .. 5    magic  "VERA1"
     5   .. 21   PBKDF2 salt (16)
     21  .. 37   AES-CBC iv  (16)
     37  .. 69   HMAC-SHA256 (32) over magic+salt+iv+ciphertext
     69  .. end  AES-CBC ciphertext
   Key derivation: PBKDF2-SHA256, 150000 iterations, 512 bits
                    -> encKey = bits[0..32], macKey = bits[32..64]
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const SITES = path.join(ROOT, "sites");
const DL = path.join(ROOT, "dl");
const ITERATIONS = 150000;

/* --------------------------------------------------------------- crc32 */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/* ----------------------------------------------------------------- zip */
/* Minimal ZIP writer: deflate each file, store one central directory.
   Directory entries are skipped; only files are archived. */
function zipEntries(files) {
  const enc = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;

  const dosTime = (d) => ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() / 2)) & 0xffff;
  const dosDate = (d) => (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff;
  const time = dosTime(new Date());
  const date = dosDate(new Date());

  for (const f of files) {
    const name = Buffer.from(f.name, "utf8");
    const raw = f.data;
    let method = 8;
    let body = zlib.deflateRawSync(raw, { level: 9 });
    if (body.length >= raw.length) { method = 0; body = raw; }
    const crc = crc32(raw);

    const local = Buffer.alloc(30 + name.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);          // version needed
    local.writeUInt16LE(0x0800, 6);      // flags: UTF-8 names
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    name.copy(local, 30);

    chunks.push(local, body);

    const cd = Buffer.alloc(46 + name.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);             // version made by
    cd.writeUInt16LE(20, 6);             // version needed
    cd.writeUInt16LE(0x0800, 8);
    cd.writeUInt16LE(method, 10);
    cd.writeUInt16LE(time, 12);
    cd.writeUInt16LE(date, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(body.length, 20);
    cd.writeUInt32LE(raw.length, 24);
    cd.writeUInt16LE(name.length, 28);
    cd.writeUInt16LE(0, 30);             // extra
    cd.writeUInt16LE(0, 32);             // comment
    cd.writeUInt16LE(0, 34);             // disk
    cd.writeUInt16LE(0, 36);             // internal attrs
    cd.writeUInt32LE(0, 38);             // external attrs
    cd.writeUInt32LE(offset, 42);
    name.copy(cd, 46);
    central.push(cd);

    offset += local.length + body.length;
  }

  const centralBuf = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...chunks, centralBuf, eocd]);
}

/* Recursively collect every file under `dir`, paths relative to it. */
function collect(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, base, out);
    else out.push({ name: path.relative(base, full).split(path.sep).join("/"), data: fs.readFileSync(full) });
  }
  return out;
}

/* -------------------------------------------------------------- encrypt */
function encrypt(plain, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(16);
  const magic = Buffer.from("VERA1", "ascii");
  const head = Buffer.concat([magic, salt, iv]);          // 37 bytes

  const bits = crypto.pbkdf2Sync(Buffer.from(password, "utf8"), salt, ITERATIONS, 64, "sha256");
  const encKey = bits.subarray(0, 32);
  const macKey = bits.subarray(32, 64);

  const cipher = crypto.createCipheriv("aes-256-cbc", encKey, iv);
  const ct = Buffer.concat([cipher.update(plain), cipher.final()]);

  const mac = crypto.createHmac("sha256", macKey)
    .update(Buffer.concat([head, ct])).digest();

  return Buffer.concat([head, mac, ct]);
}

/* --------------------------------------------------------------- driver */
function derivePassword(slug, i) {
  /* Deterministic so a lost file can be rebuilt, but not guessable from the
     slug alone. Matches the opaque hashes already stored in catalog.js. */
  return crypto.createHash("sha256")
    .update(`VERA::${slug}::${i}::dreamer-prompt-lab`)
    .digest("hex");
}

function pack() {
  const manifestPath = path.join(__dirname, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  fs.mkdirSync(DL, { recursive: true });

  const added = [];
  for (let i = 0; i < manifest.length; i++) {
    const m = manifest[i];
    const dir = m.dir || path.join(SITES, m.slug);
    if (!fs.existsSync(path.join(dir, "index.html"))) {
      console.warn("skip (missing) " + m.slug);
      continue;
    }
    const files = collect(dir);
    const zip = zipEntries(files);
    const pass = derivePassword(m.slug, i);
    const bin = encrypt(zip, pass);
    const out = path.join(DL, `${m.slug}.bin`);
    fs.writeFileSync(out, bin);

    /* sanity: the header must read back exactly like get.html parses it */
    const head = bin.subarray(0, 5).toString("ascii");
    if (head !== "VERA1") throw new Error("bad magic for " + m.slug);
    if (bin.length < 69) throw new Error("truncated container for " + m.slug);

    added.push({ slug: m.slug, name: m.name, cat: m.cat, blurb: m.blurb,
                 layout: m.layout, palette: m.pal, font: m.font,
                 zip: zip.length, bin: bin.length, pass });
  }
  fs.writeFileSync(path.join(__dirname, "packed.json"), JSON.stringify(added, null, 2));

  const totalZip = added.reduce((a, x) => a + x.zip, 0);
  const totalBin = added.reduce((a, x) => a + x.bin, 0);
  console.log(`packed ${added.length} templates`);
  console.log(`  zip  ${(totalZip / 1048576).toFixed(1)} MB`);
  console.log(`  bin  ${(totalBin / 1048576).toFixed(1)} MB`);
  console.log(`  avg  ${(totalBin / added.length / 1024).toFixed(0)} KB each`);
}

/* Self-test: round-trip one archive through the same path get.html uses. */
function selfTest() {
  const files = [
    { name: "index.html", data: Buffer.from("<h1>hello</h1>") },
    { name: "img/p1.svg", data: Buffer.from("<svg/>") },
  ];
  const zip = zipEntries(files);
  const pass = "abc123";
  const bin = encrypt(zip, pass);
  if (bin.subarray(0, 5).toString("ascii") !== "VERA1") throw new Error("magic");

  const b = bin;
  const salt = b.subarray(5, 21), iv = b.subarray(21, 37), mac = b.subarray(37, 69), ct = b.subarray(69);
  const bits = crypto.pbkdf2Sync(Buffer.from(pass), salt, ITERATIONS, 64, "sha256");
  const ok = crypto.createHmac("sha256", bits.subarray(32, 64))
    .update(Buffer.concat([b.subarray(0, 37), ct])).digest().equals(mac);
  if (!ok) throw new Error("hmac mismatch");
  const dec = crypto.createDecipheriv("aes-256-cbc", bits.subarray(0, 32), iv);
  const plain = Buffer.concat([dec.update(ct), dec.final()]);
  if (!plain.equals(zip)) throw new Error("round trip mismatch");

  const names = [];
  let p = 0;
  while (p < plain.length && plain.readUInt32LE(p) === 0x04034b50) {
    const nlen = plain.readUInt16LE(p + 26);
    const csz = plain.readUInt32LE(p + 18);
    names.push(plain.subarray(p + 30, p + 30 + nlen).toString("utf8"));
    p += 30 + nlen + csz;
  }
  console.log("self-test ok — headers:", names.join(", "));
}

if (process.argv.includes("--selftest")) selfTest();
else if (require.main === module) pack();

module.exports = { zipEntries, encrypt, collect, derivePassword, crc32 };

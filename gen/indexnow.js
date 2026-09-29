/* Ping IndexNow with every URL that went live in this batch. */
"use strict";
const fs = require("fs");
const path = require("path");
const https = require("https");

const KEY = fs.readFileSync(path.join(__dirname, "..", "..", "portfolio", "indexnow-key.txt"), "utf8").trim();
const HOST = "fyosamu.github.io";
const BASE = "https://fyosamu.github.io/fashion-store";

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "manifest.json"), "utf8"));

const urlList = [
  `${BASE}/`,
  `${BASE}/apparel.html`,
  `${BASE}/templates.html`,
  `${BASE}/get.html`,
  ...manifest.map((m) => `${BASE}/sites/${m.slug}/`),
];

const payload = JSON.stringify({ host: HOST, key: KEY, urlList });

const req = https.request(
  {
    hostname: "api.indexnow.org",
    path: "/indexnow",
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(payload) },
    timeout: 30000,
  },
  (res) => {
    let body = "";
    res.on("data", (c) => (body += c));
    res.on("end", () => {
      console.log(`submitted ${urlList.length} URLs`);
      console.log(`HTTP ${res.statusCode} ${res.statusMessage || ""}`.trim());
      if (body) console.log(body.slice(0, 300));
      console.log(
        res.statusCode === 200
          ? "accepted — submitted URLs are queued for crawl"
          : "see https://www.indexnow.org/documentation for this status"
      );
    });
  }
);
req.on("timeout", () => { console.log("timeout"); req.destroy(); });
req.on("error", (e) => console.log("ERR " + e.message));
req.write(payload);
req.end();

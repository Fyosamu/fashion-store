/* ============================================================================
   VERA template generator — design system
   Palettes, font pairings and garment silhouettes used to make every
   generated store look like a different studio built it.
   ========================================================================== */
"use strict";

/* ---------------------------------------------------------------------------
   Palettes. Each entry is a complete, contrast-checked token set.
   `on` marks a dark surface (body text is light, lines are lightened).
   --------------------------------------------------------------------------- */
const PALETTES = [
  /* --- luxe ------------------------------------------------------------ */
  { k: "noir-gold",    m: "luxe",   on: 1, bg: "#0b0b0d", sf: "#141417", ink: "#f4f2ee", mut: "#a29d94", ln: "#26262b", ac: "#c9a227", ack: "#12100a" },
  { k: "onyx-rose",    m: "luxe",   on: 1, bg: "#0e0c0f", sf: "#171317", ink: "#f7eff1", mut: "#a89aa0", ln: "#2a222a", ac: "#d98a9c", ack: "#1a0d11" },
  { k: "midnight-ice", m: "luxe",   on: 1, bg: "#080d14", sf: "#101824", ink: "#eef4fa", mut: "#93a3b4", ln: "#1d2836", ac: "#8fb6d9", ack: "#08101a" },
  { k: "marble",       m: "luxe",   on: 0, bg: "#faf8f5", sf: "#ffffff", ink: "#16141a", mut: "#6f6a63", ln: "#e6e1d8", ac: "#8a6f4e", ack: "#ffffff" },
  { k: "ivory-forest", m: "luxe",   on: 0, bg: "#f7f6f1", sf: "#ffffff", ink: "#12211a", mut: "#5f6b64", ln: "#e0ddd2", ac: "#1f5d45", ack: "#ffffff" },

  /* --- boutique -------------------------------------------------------- */
  { k: "clay",         m: "boutique", on: 0, bg: "#fdf8f4", sf: "#ffffff", ink: "#241a15", mut: "#7b6a60", ln: "#eee2d8", ac: "#b55d3a", ack: "#ffffff" },
  { k: "blush",        m: "boutique", on: 0, bg: "#fff7f7", sf: "#ffffff", ink: "#2a1c20", mut: "#7d666c", ln: "#f2e2e5", ac: "#c2506a", ack: "#ffffff" },
  { k: "honey",        m: "boutique", on: 0, bg: "#fffaf0", sf: "#ffffff", ink: "#241d10", mut: "#7a6c4e", ln: "#efe4cc", ac: "#9d6b19", ack: "#ffffff" },
  { k: "sage",         m: "boutique", on: 0, bg: "#f6f7f0", sf: "#ffffff", ink: "#1d2418", mut: "#68705c", ln: "#e4e7d7", ac: "#5e7f4b", ack: "#ffffff" },
  { k: "peach",        m: "boutique", on: 0, bg: "#fff6f1", sf: "#ffffff", ink: "#26191a", mut: "#7e6462", ln: "#f4e3da", ac: "#dd7a5b", ack: "#2b1008" },
  { k: "lilac-soft",   m: "boutique", on: 0, bg: "#f9f7ff", sf: "#ffffff", ink: "#1c1730", mut: "#6d688a", ln: "#e8e4f7", ac: "#7a5fd0", ack: "#ffffff" },

  /* --- modern ---------------------------------------------------------- */
  { k: "concrete",     m: "modern", on: 0, bg: "#f4f4f5", sf: "#ffffff", ink: "#17171a", mut: "#6c6c73", ln: "#e2e2e6", ac: "#2b2b30", ack: "#ffffff" },
  { k: "north",        m: "modern", on: 0, bg: "#ffffff", sf: "#f7f9fc", ink: "#0e1116", mut: "#5f6672", ln: "#e3e7ee", ac: "#1f5fd0", ack: "#ffffff" },
  { k: "stone",        m: "modern", on: 0, bg: "#f2f1ee", sf: "#fbfbfa", ink: "#1a1a1c", mut: "#6a6a6d", ln: "#dedcd7", ac: "#4d5c6b", ack: "#ffffff" },
  { k: "glacier",      m: "modern", on: 0, bg: "#f7fbfd", sf: "#ffffff", ink: "#0b1a22", mut: "#58707a", ln: "#dde9ee", ac: "#0d7a8f", ack: "#ffffff" },
  { k: "graphite-blue",m: "modern", on: 1, bg: "#0d1117", sf: "#151b23", ink: "#e7edf4", mut: "#93a1b0", ln: "#222b35", ac: "#5b9cf8", ack: "#06101f" },

  /* --- street ---------------------------------------------------------- */
  { k: "hazard",       m: "street", on: 1, bg: "#0a0a0a", sf: "#131313", ink: "#ffffff", mut: "#a5a5a5", ln: "#242424", ac: "#f2ff00", ack: "#0a0a0a" },
  { k: "cobalt-pop",   m: "street", on: 1, bg: "#0c0c12", sf: "#14141c", ink: "#ffffff", mut: "#a3a3b2", ln: "#23232f", ac: "#ff3d71", ack: "#1b000d" },
  { k: "signal-yellow",m: "street", on: 0, bg: "#f2f2f0", sf: "#ffffff", ink: "#111111", mut: "#5f5f5c", ln: "#d6d6d2", ac: "#ffd400", ack: "#111111" },
  { k: "redline",      m: "street", on: 0, bg: "#ffffff", sf: "#f7f7f7", ink: "#111111", mut: "#616161", ln: "#dedede", ac: "#e11d2e", ack: "#ffffff" },
  { k: "monochrome",   m: "street", on: 0, bg: "#ffffff", sf: "#f1f1f1", ink: "#0a0a0a", mut: "#5e5e5e", ln: "#d9d9d9", ac: "#0a0a0a", ack: "#ffffff" },

  /* --- sport ----------------------------------------------------------- */
  { k: "carbon-neon",  m: "sport", on: 1, bg: "#080f0d", sf: "#0e1a17", ink: "#eafff5", mut: "#8ba79d", ln: "#17272350", ac: "#22ffb2", ack: "#04120d" },
  { k: "volt",         m: "sport", on: 0, bg: "#fbfdfc", sf: "#ffffff", ink: "#0b1512", mut: "#5b6d67", ln: "#dce9e4", ac: "#008558", ack: "#ffffff" },
  { k: "ice-cyan",     m: "sport", on: 1, bg: "#050a12", sf: "#0a1220", ink: "#e9f6ff", mut: "#8296ab", ln: "#15233500", ac: "#37d5ff", ack: "#031017" },

  /* --- retro ----------------------------------------------------------- */
  { k: "newsprint",    m: "retro", on: 0, bg: "#f4efe4", sf: "#fbf8f1", ink: "#1c1a17", mut: "#6d6759", ln: "#ded5c4", ac: "#a33b2a", ack: "#ffffff" },
  { k: "ochre",        m: "retro", on: 0, bg: "#f7ead7", sf: "#fdf6e9", ink: "#26190f", mut: "#776349", ln: "#e6d3b6", ac: "#9c5a1e", ack: "#ffffff" },
  { k: "olive-film",   m: "retro", on: 0, bg: "#efeee3", sf: "#f8f7ee", ink: "#1f2118", mut: "#686a56", ln: "#d9d7c6", ac: "#6b7042", ack: "#ffffff" },

  /* --- resort / eco ---------------------------------------------------- */
  { k: "ocean",        m: "resort", on: 0, bg: "#f2f9fb", sf: "#ffffff", ink: "#07202a", mut: "#4e6d78", ln: "#d9ecf1", ac: "#0a7ea4", ack: "#ffffff" },
  { k: "terracotta",   m: "resort", on: 0, bg: "#fdf6f0", sf: "#ffffff", ink: "#2a1a12", mut: "#78645a", ln: "#f0e0d5", ac: "#b4543a", ack: "#ffffff" },
  { k: "mint",         m: "resort", on: 0, bg: "#f3fbf7", sf: "#ffffff", ink: "#0f241c", mut: "#547167", ln: "#d9eee5", ac: "#13875d", ack: "#ffffff" },
  { k: "sky-lilac",    m: "resort", on: 0, bg: "#f6f7ff", sf: "#ffffff", ink: "#161731", mut: "#63658c", ln: "#e2e4f7", ac: "#4f4fd8", ack: "#ffffff" },
];

/* ---------------------------------------------------------------------------
   Font pairings. `h` and `b` are Google Fonts families; `url` builds one
   stylesheet request for both so the page pays a single round trip.
   --------------------------------------------------------------------------- */
const FONTS = [
  { k: "fraunces",   h: "Fraunces",           b: "Inter",          hq: "ital,opsz,wght@0,9..144,400..600;1,9..144,400..600", bq: "wght@400;500;600" },
  { k: "playfair",   h: "Playfair Display",   b: "Jost",           hq: "ital,wght@0,400..700;1,400..600", bq: "wght@300;400;500;600" },
  { k: "cormorant",  h: "Cormorant Garamond", b: "Jost",           hq: "ital,wght@0,400..700;1,400..600", bq: "wght@300;400;500" },
  { k: "dmserif",    h: "DM Serif Display",   b: "DM Sans",        hq: "ital@0;1",                        bq: "wght@400;500;700" },
  { k: "bodoni",     h: "Bodoni Moda",        b: "Karla",          hq: "ital,opsz,wght@0,6..96,400..700;1,6..96,400..600", bq: "wght@400;500;600" },
  { k: "instrument", h: "Instrument Serif",   b: "Hanken Grotesk", hq: "ital@0;1",                        bq: "wght@400;500;600" },
  { k: "syne",       h: "Syne",               b: "Space Grotesk",  hq: "wght@400..800",                   bq: "wght@300;400;500" },
  { k: "bricolage",  h: "Bricolage Grotesque",b: "Inter",          hq: "opsz,wght@12..96,400..700",       bq: "wght@400;500;600" },
  { k: "unbounded",  h: "Unbounded",          b: "Manrope",        hq: "wght@300..700",                   bq: "wght@400;500;700" },
  { k: "bebas",      h: "Bebas Neue",         b: "Inter",          hq: "",                                bq: "wght@400;500;600" },
  { k: "plexmono",   h: "IBM Plex Mono",      b: "IBM Plex Sans",  hq: "ital,wght@0,400;0,600;1,400",     bq: "wght@400;500;600" },
  { k: "sora",       h: "Sora",               b: "Inter",          hq: "wght@400..700",                   bq: "wght@400;500;600" },
];

function fontUrl(f) {
  const parts = [];
  parts.push(`family=${f.h.replace(/ /g, "+")}:${f.hq || "wght@400;600"}`);
  parts.push(`family=${f.b.replace(/ /g, "+")}:${f.bq || "wght@400;500;600"}`);
  parts.push("display=swap");
  return `https://fonts.googleapis.com/css2?${parts.join("&")}`;
}

/* ---------------------------------------------------------------------------
   Garment silhouettes. viewBox is 0 0 400 500 for all of them, so any
   silhouette can drop into any product tile. `fill` shapes are solid, `line`
   shapes are stroked detail (collars, seams, laces) drawn on top.
   --------------------------------------------------------------------------- */
const GARMENTS = [
  { k: "tee", t: "T-shirt",
    fill: ["M140,78 L200,112 L260,78 L332,138 L316,202 L278,180 L278,432 L122,432 L122,180 L84,202 L68,138 Z"],
    line: [{ d: "M172,94 Q200,132 228,94" }, { d: "M122,414 L278,414" }] },
  { k: "hoodie", t: "Hoodie",
    fill: ["M146,112 L200,138 L254,112 L342,178 L322,258 L286,236 L286,442 L114,442 L114,236 L78,258 L58,178 Z",
           "M152,116 Q200,62 248,116 Q200,166 152,116 Z", "M156,330 L244,330 L238,392 L162,392 Z"],
    line: [{ d: "M186,152 L186,214" }, { d: "M214,152 L214,214" }] },
  { k: "shirt", t: "Shirt",
    fill: ["M142,84 L200,116 L258,84 L330,142 L314,204 L278,182 L278,436 L122,436 L122,182 L86,204 L70,142 Z",
           "M200,116 L172,86 L188,134 Z", "M200,116 L228,86 L212,134 Z"],
    line: [{ d: "M200,124 L200,436" }, { d: "M122,420 L278,420" }] },
  { k: "sweater", t: "Knit sweater",
    fill: ["M144,104 L200,134 L256,104 L336,166 L318,250 L284,230 L284,440 L116,440 L116,230 L82,250 L64,166 Z"],
    line: [{ d: "M116,412 L284,412" }, { d: "M174,116 Q200,150 226,116" },
           { d: "M150,240 L150,404" }, { d: "M200,236 L200,404" }, { d: "M250,240 L250,404" }] },
  { k: "blazer", t: "Blazer",
    fill: ["M150,88 L200,124 L250,88 L320,146 L306,214 L276,196 L276,446 L124,446 L124,196 L94,214 L80,146 Z",
           "M200,124 L152,90 L176,208 L200,170 Z", "M200,124 L248,90 L224,208 L200,170 Z"],
    line: [{ d: "M132,300 L172,300 L172,336 L132,336 Z" }, { d: "M228,300 L268,300 L268,336 L228,336 Z" }] },
  { k: "coat", t: "Wool coat",
    fill: ["M148,92 L200,126 L252,92 L318,150 L304,224 L276,206 L276,472 L124,472 L124,206 L96,224 L82,150 Z",
           "M200,126 L154,94 L178,214 L200,176 Z", "M200,126 L246,94 L222,214 L200,176 Z",
           "M124,306 L276,306 L276,334 L124,334 Z"],
    line: [{ d: "M200,182 L200,472" }] },
  { k: "dress", t: "Dress",
    fill: ["M146,96 L200,128 L254,96 L304,146 L288,238 L322,456 L78,456 L112,238 L96,146 Z"],
    line: [{ d: "M176,104 Q200,142 224,104" }, { d: "M114,272 L286,272" }] },
  { k: "gown", t: "Evening gown",
    fill: ["M148,98 L200,130 L252,98 L300,150 L286,244 L348,478 L52,478 L114,244 L100,150 Z"],
    line: [{ d: "M174,108 Q200,146 226,108" }, { d: "M118,268 L282,268" }, { d: "M200,268 L200,478" }] },
  { k: "skirt", t: "Skirt",
    fill: ["M136,152 L264,152 L336,432 L64,432 Z", "M136,152 L264,152 L266,184 L134,184 Z"],
    line: [{ d: "M170,192 L146,428" }, { d: "M200,192 L200,428" }, { d: "M230,192 L254,428" }] },
  { k: "trouser", t: "Trousers",
    fill: ["M132,110 L268,110 L284,452 L216,452 L200,252 L184,452 L116,452 Z", "M132,110 L268,110 L270,144 L130,144 Z"],
    line: [{ d: "M162,152 L156,448" }, { d: "M238,152 L244,448" }] },
  { k: "jeans", t: "Denim jeans",
    fill: ["M132,112 L268,112 L284,454 L216,454 L200,254 L184,454 L116,454 Z", "M132,112 L268,112 L270,148 L130,148 Z"],
    line: [{ d: "M146,166 Q170,196 184,168" }, { d: "M254,166 Q230,196 216,168" },
           { d: "M200,148 L200,454" }, { d: "M140,300 L260,300" }] },
  { k: "shorts", t: "Shorts",
    fill: ["M132,152 L268,152 L278,332 L216,332 L200,240 L184,332 L122,332 Z", "M132,152 L268,152 L270,186 L130,186 Z"],
    line: [{ d: "M200,186 L200,332" }] },
  { k: "jumpsuit", t: "Jumpsuit",
    fill: ["M150,96 L200,128 L250,96 L300,150 L286,226 L302,454 L222,454 L200,288 L178,454 L98,454 L114,226 L100,150 Z"],
    line: [{ d: "M176,104 Q200,140 224,104" }, { d: "M116,272 L284,272" }, { d: "M200,136 L200,272" }] },
  { k: "scarf", t: "Scarf",
    fill: ["M152,88 L248,88 L268,408 L132,408 Z"],
    line: [{ d: "M132,408 L268,408" }, { d: "M144,408 L144,442" }, { d: "M172,408 L172,446" },
           { d: "M200,408 L200,442" }, { d: "M228,408 L228,446" }, { d: "M256,408 L256,442" }] },
  { k: "cap", t: "Cap",
    fill: ["M112,270 Q200,150 288,270 L288,282 L112,282 Z", "M286,264 Q356,268 372,304 L282,298 Z", "M196,144 a10,10 0 1,0 0.1,0 Z"],
    line: [{ d: "M200,156 L200,282" }, { d: "M156,182 L144,282" }, { d: "M244,182 L256,282" }] },
  { k: "beanie", t: "Beanie",
    fill: ["M120,266 Q200,152 280,266 Z", "M114,262 L286,262 L286,308 L114,308 Z"],
    line: [{ d: "M146,274 L146,302" }, { d: "M174,274 L174,302" }, { d: "M200,274 L200,302" },
           { d: "M226,274 L226,302" }, { d: "M254,274 L254,302" }] },
  { k: "sneaker", t: "Sneakers",
    fill: ["M64,352 L64,286 Q66,252 104,246 L188,246 Q230,262 272,288 Q322,318 338,342 L338,362 Q338,378 318,378 L84,378 Q64,378 64,362 Z",
           "M60,360 L342,360 L342,394 Q342,404 330,404 L72,404 Q60,404 60,394 Z"],
    line: [{ d: "M116,258 L164,290" }, { d: "M134,250 L186,282" }, { d: "M154,248 L206,280" }] },
  { k: "boot", t: "Boots",
    fill: ["M128,132 L272,132 L280,330 L330,346 L338,392 L128,392 Z", "M300,392 L338,392 L340,448 L302,448 Z"],
    line: [{ d: "M128,316 L276,316" }, { d: "M156,148 L156,316" }, { d: "M200,148 L200,316" }, { d: "M244,148 L244,316" }] },
  { k: "heel", t: "Heels",
    fill: ["M104,336 L104,244 Q108,216 148,214 L226,214 Q264,230 302,272 L324,320 L332,366 L300,366 L136,366 Q104,366 104,344 Z",
           "M298,366 L334,366 L346,452 L312,452 Z"],
    line: [{ d: "M140,232 L216,244" }] },
  { k: "tote", t: "Tote bag",
    fill: ["M112,192 L288,192 L310,438 L90,438 Z"],
    line: [{ d: "M154,192 Q154,116 200,116 Q246,116 246,192" }, { d: "M120,240 L300,240" }] },
  { k: "glasses", t: "Eyewear",
    fill: ["M76,214 h104 a18,18 0 0 1 18,18 v40 a18,18 0 0 1 -18,18 h-104 a18,18 0 0 1 -18,-18 v-40 a18,18 0 0 1 18,-18 Z",
           "M220,214 h104 a18,18 0 0 1 18,18 v40 a18,18 0 0 1 -18,18 h-104 a18,18 0 0 1 -18,-18 v-40 a18,18 0 0 1 18,-18 Z"],
    line: [{ d: "M198,244 Q200,232 202,244" }, { d: "M58,238 L22,222" }, { d: "M342,238 L378,222" }] },
  { k: "cami", t: "Cami top",
    fill: ["M146,154 L178,110 L200,156 L222,110 L254,154 L272,312 L128,312 Z"],
    line: [{ d: "M178,110 L166,88" }, { d: "M222,110 L234,88" }, { d: "M130,286 L270,286" }] },
  { k: "swimsuit", t: "Swimwear",
    fill: ["M146,118 L200,170 L254,118 L274,222 L258,332 L234,434 L200,362 L166,434 L142,332 L126,222 Z"],
    line: [{ d: "M172,132 Q200,168 228,132" }, { d: "M138,278 L262,278" }] },
  { k: "tie", t: "Necktie",
    fill: ["M200,106 L236,146 L224,200 L246,382 L200,424 L154,382 L176,200 L164,146 Z",
           "M176,104 L224,104 L234,152 L166,152 Z"],
    line: [{ d: "M200,214 L200,410" }] },
  { k: "belt", t: "Belt",
    fill: ["M40,222 L360,222 L360,278 L40,278 Z", "M160,206 L240,206 L240,294 L160,294 Z"],
    line: [{ d: "M176,232 L224,232" }, { d: "M176,268 L224,268" }] },
  { k: "sock", t: "Socks",
    fill: ["M158,132 L238,132 L238,318 Q238,356 276,366 Q316,378 316,418 L142,418 Q134,372 158,342 Z"],
    line: [{ d: "M158,168 L238,168" }, { d: "M158,196 L238,196" }] },
];

const GARMENT_BY_KEY = Object.fromEntries(GARMENTS.map(g => [g.k, g]));

/* Pick a silhouette from a product title. */
function garmentFor(title) {
  const t = title.toLowerCase();
  const rules = [
    [/hood|sweat|jogger/, "hoodie"], [/shirt|button|oxford|camp collar/, "shirt"],
    [/knit|jumper|sweater|cardigan|pullover/, "sweater"],
    [/blazer|suit jacket|sport coat/, "blazer"],
    [/coat|parka|overcoat|peacoat|trench/, "coat"],
    [/gown|evening|prom|ball dress/, "gown"],
    [/dress|frock|sundress|maxi|mini dress/, "dress"],
    [/skirt|sarong|wrap skirt/, "skirt"],
    [/jean|denim/, "jeans"], [/short|swim trunks/, "shorts"],
    [/jumpsuit|romper|playsuit|overall/, "jumpsuit"],
    [/scarf|stole|muffler/, "scarf"], [/cap|bucket hat|visor/, "cap"],
    [/beanie|knit hat|tuque/, "beanie"],
    [/sneaker|trainer|runner|court shoe/, "sneaker"],
    [/boot|wellington|timber/, "boot"],
    [/heel|stiletto|pump/, "heel"],
    [/tote|bag|pouch|clutch|backpack/, "tote"],
    [/glasses|sunnies|shade|eyewear|spectacle/, "glasses"],
    [/cami|vest|tank|camisole|bralette|lingerie/, "cami"],
    [/swim|swimsuit|bikini|one-piece|maillot/, "swimsuit"],
    [/tie|bow tie|cravat/, "tie"],
    [/belt|strap|sash/, "belt"],
    [/sock|tights|legging|stocking/, "sock"],
    [/trouser|pant|chino|slack|culotte|jogger/, "trouser"],
    [/tee|t-shirt|top|tun/, "tee"],
  ];
  for (const [re, key] of rules) if (re.test(t)) return GARMENT_BY_KEY[key];
  return GARMENT_BY_KEY.tee;
}

/* ---------------------------------------------------------------------------
   Colour maths.

   The accent does two jobs: it fills buttons and badges (with `ack` written on
   it), and it paints small bits of type on the page — the eyebrow label, the
   emphasised word in the headline, stars, the active nav rule. Those two jobs
   pull in opposite directions. A bright signal yellow is perfect as a fill and
   illegible as a headline on a near-white page.

   So `accentText()` derives a second token from the same hue: the nearest
   colour that still clears 4.5:1 against every surface it can land on. The
   fill keeps its punch, the type stays readable, and nobody has to hand-tune
   31 palettes for a case they will not think about until it ships.
   --------------------------------------------------------------------------- */
function hexToRgb(h) {
  h = h.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}
function rgbToHex(r, g, b) {
  const p = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return "#" + p(r) + p(g) + p(b);
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  let h = 0, s = 0;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
function lum(hex) {
  const [r, g, b] = hexToRgb(hex);
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastHex(a, b) {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/* Nearest hue-preserving colour that clears `min` against every target. */
/* srgb lerp — used to predict what an accent looks like after the site mixes
   it into a surface at low alpha, so the derived text colour is fitted against
   the tint too and not only against the raw background. */
function mixHex(a, b, p) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A[0] + (B[0] - A[0]) * p, A[1] + (B[1] - A[1]) * p, A[2] + (B[2] - A[2]) * p);
}

function accentText(ac, targets, min = 4.5) {
  const [h, s, l] = rgbToHsl(...hexToRgb(ac));
  const mk = (L) => { const [r, g, b] = hslToRgb(h, s, L); return rgbToHex(r, g, b); };
  const ok = (L) => targets.every((t) => contrastHex(mk(L), t) >= min);
  if (ok(l)) return ac;
  /* Walk outward from the original lightness so the accent stays recognisably
     itself — the first step that passes is the smallest change that works. */
  for (let d = 0.005; d <= 1; d += 0.005) {
    for (const sgn of [1, -1]) {
      const L = l + sgn * d;
      if (L < 0 || L > 1) continue;
      if (ok(L)) return mk(L);
    }
  }
  return ac;
}

module.exports = { PALETTES, FONTS, GARMENTS, GARMENT_BY_KEY, garmentFor, fontUrl, contrastHex, accentText, mixHex, lum };

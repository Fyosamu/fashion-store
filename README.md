# VERA Atelier

Static store template shop — HTML, CSS and vanilla JavaScript, no build step,
no framework, no runtime dependencies beyond one Google Fonts request.

**Live:** <https://fyosamu.github.io/fashion-store/> ·
**100 clothing templates:** <https://fyosamu.github.io/fashion-store/apparel.html> ·
**Sitemap:** <https://fyosamu.github.io/fashion-store/sitemap.xml>

## What is here

| | |
|---|---|
| `apparel.html` | searchable, mood-filterable grid of all 100 clothing storefronts |
| `templates.html` | the original 13 templates — furniture, coffee, skincare, ceramics, audio |
| `get.html` | on-chain checkout: paste a USDT transaction hash, the ZIP unlocks |
| `catalog.js` | 115 SKUs — price, demo path, encrypted payload, decryption password |
| `dl/` | AES-256-CBC payloads, one per template |
| `sites/` | the generated storefronts themselves |
| `gen/` | the generator that produced 100 of them |
| `kit.html`, `plugin.html` | Elementor kit and the USDT Deliver WordPress plugin |

## The generator

`gen/` turns a niche definition into a complete storefront.

- **`niches.js`** — 100 apparel concepts: streetwear, bridal, denim, scrubs,
  modest wear, adaptive clothing, vintage, kidswear, footwear.
- **`build.js`** — 12 page architectures × 31 palettes × 12 type pairings,
  assigned by mood so a bridal shop and a skate shop never share a silhouette.
  Emits `index.html` (ClothingStore + ItemList JSON-LD, canonical, Open Graph),
  `style.css`, `script.js`, `buy.html`, `README.md`, `INSTALL.md`.
- **`design.js`** — contrast-checked palettes, Google Font pairings, and 26
  garment silhouettes that are drawn straight into SVG. There is not one
  raster image in 3,000 files.
- **`pack.js`** — zips each folder and encrypts it into the container
  `get.html` decrypts: PBKDF2-SHA256 at 150,000 iterations, AES-256-CBC,
  HMAC-SHA256 over header + ciphertext.
- **`shop.js`** — writes the catalogue entries, `apparel.html`, `sitemap.xml`
  and `robots.txt`.

```powershell
node gen/build.js            # regenerate all 100 storefronts
node gen/build.js --only nocturne-supply
node gen/pack.js             # re-zip + re-encrypt into dl/
node gen/shop.js             # catalogue, listing page, sitemap
node gen/audit.js            # check all 100 — exits non-zero on any defect
node gen/pack.js --selftest  # round-trip the container against get.html
node gen/verify.js           # after a push: pull the live store and decrypt 5 SKUs
```

`audit.js` is the gate. It walks every storefront the way a browser and a
crawler would — link and anchor integrity, CSS token closure, heading order,
WCAG contrast on the tokens each page actually paints, and uniqueness across
the catalogue — and fails the build if anything regressed.

`verify.js` is the one test that cannot run offline. It reads the deployed
catalogue, downloads the deployed payloads and decrypts them the way
`get.html` does in the visitor's browser, because a push can leave those two
out of step — a payload re-encrypted under a password the live catalogue no
longer holds — and nothing on disk would notice.

Re-skinning a template is one edit: every colour, font, radius and shadow in
`sites/<slug>/style.css` comes from the `:root` block at the top.

## Delivery

Checkout verifies the transfer in the visitor's browser against six public
RPC nodes, then decrypts locally and hands over the ZIP. No account, nothing
stored server-side. Payments settle to a Trust Wallet address in USDT
(BEP-20 cheapest at roughly $0.0025, ERC-20 / TRC-20 / Polygon / Solana also
accepted).

## Licence

MIT. Use any template in client projects, ship it, charge for it.

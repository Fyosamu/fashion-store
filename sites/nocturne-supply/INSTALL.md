# Installing Nocturne Supply

Everything lives in this folder. There is no build step.

## 1. See it

Double-click `index.html`. If images or fonts look wrong, you are probably
opening it from inside a zip preview — extract the folder first.

## 2. Put it online

- **GitHub Pages** — push the folder into a repo, Settings → Pages → deploy from `main`.
- **Netlify** — drag the folder onto https://app.netlify.com/drop.
- **Any host** — upload via FTP/SFTP; `.htaccess` is not required.

## 3. Edit these first

| Where | What |
|---|---|
| `style.css` → `:root` | every colour, font, radius and shadow |
| `index.html` → `.brand` | your brand name |
| `index.html` → `<title>` and `meta[name=description]` | your SEO |
| `index.html` → `link[rel=canonical]` and `og:url` | your real URL |
| `index.html` → JSON-LD block | your store name, prices, ratings |
| `index.html` → `.hero` | headline and lead |
| `index.html` → `.prod` blocks | products, prices, copy |
| `index.html` → `.footer` | links and legal line |
| `img/` | swap generated SVGs for your own photography |

## 4. Take payments

The shop root ships `get.html`: paste a USDT transaction hash, it reads the
chain in the visitor's browser and releases the file automatically. Set your own
wallet address at the top of its script:

```js
var WALLET = "0xYourAddressHere";
var USDT   = "0xdac17f958d2ee523a2206206994597c13d831ec7"; // USDT contract
```

Change `network` in the copy if you accept BEP-20 instead of ERC-20.

## 5. Swap the buy link

Every "buy" button in this template points at `get.html?sku=nocturne-supply`.
Replace it with your own product URL before you go live.

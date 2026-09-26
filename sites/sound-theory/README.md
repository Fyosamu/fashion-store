# Sound Theory - Hi-fi & audio store template

Hi-fi shop with a 45-day home trial and published measurements.

The complete Sound Theory store: one HTML page, one stylesheet, one script and 6 photographs.
No build tools, no framework, no dependencies - open it, change it, ship it.

---

## What is in the folder

| file | what it is |
|---|---|
| `index.html` | the demo home page: hero, shop, about, contact, products |
| `style.css` | the whole design system - commented, token-based, 50 KB |
| `script.js` | bag, slide-in drawer, mobile nav, forms and scroll reveals - vanilla JS, 297 lines, no libraries |
| `img/` | 6 photographs (0.46 MB) - CC0, already compressed for the web |
| `buy.html` | the product page used by the live demo (price, payment form). Delete it, or point its `buy.html` links at your own shop, before you publish |
| `README.md` / `INSTALL.md` | these files |

## Requirements

- Any static host: Netlify, GitHub Pages, Cloudflare Pages, S3, ordinary shared hosting.
- HTML + CSS + JavaScript only - no npm, no PHP, no database, no licence key.
- Fonts: Inter and Fraunces from Google Fonts (self-host them if your visitors cannot reach Google).
- Everything stays readable if JavaScript fails: content is only hidden once JS is confirmed active.

## Do these two things first

1. **Your details.** `script.js` starts with a small `CONFIG` block:

   ```js
   const CONFIG = {
     supportEmail: "orders@yourdomain.com",   // where order and contact emails land
     wallet: "0x…",                            // shown on the checkout panel
   };
   ```

   The demo ships with the original seller's details in there. If you skip this step, every order
   from your shop is emailed to somebody else.

2. **Your prices and names.** Product names, prices and copy are plain HTML text in `index.html`
   (and in `buy.html` if you keep that page).

## Rebrand in minutes

- **Palette** - one `:root` block at the top of `style.css`: 10 colour tokens
  (`--paper`, `--ink`, `--clay`, …) plus radius, shadow and fonts. Change the values, the whole
  site repaints; nothing else to touch.
- **Logo** - the brand is plain text in the header of every page.
- **Photographs** - drop your own into `img/` and keep the filenames (`p1.jpg` … `p6.jpg`),
  so no code changes are needed. Keep them at 1600 px wide or less for a fast page.
- **Bag storage** - the cart key is `sound-theory\_bag` in localStorage, so two stores on the same domain
  never mix their bags.

## What is already verified

- Widths 320 - 1440 px with zero horizontal overflow (checked at 360 / 390 / 768 / 1024 / 1440).
- No broken images, no console errors, across the whole site.
- Content visible with JavaScript switched off.
- Add / remove / quantity / total in the bag, checkout email, newsletter and contact forms tested.

## Licence

- **Code:** MIT - use it on client projects, rebrand it, sell it as part of your own build.
- **Photographs:** CC0 - commercial use, no attribution needed.
- **Fonts:** SIL Open Font License (Google Fonts).

## Support

`INSTALL.md` has the step-by-step setup, a troubleshooting table and a pre-launch checklist.
Your download can always be re-downloaded from your order page on the marketplace.
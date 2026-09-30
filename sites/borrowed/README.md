# Borrowed - Clothing rental store template

Clothing rental store — Four-day rentals, cleaned between borrowers, with the option to buy. Built with the lookbook layout.

The complete Borrowed store: one HTML page, one stylesheet, one script and 24 SVG illustrations.
No build tools, no framework, no dependencies - open it, change it, ship it.

---

## What is in the folder

| file | what it is |
|---|---|
| `index.html` | the demo home page: hero, shop, story |
| `style.css` | the whole design system - commented, token-based, 15 KB |
| `script.js` | bag, slide-in drawer, mobile nav, forms and scroll reveals - vanilla JS, 100 lines, no libraries |
| `img/` | 24 SVG illustrations (0.03 MB) - original vector art - sharp at any size, recoloured by the palette block |
| `buy.html` | the product page used by the live demo (price, payment form). Delete it, or point its `buy.html` links at your own shop, before you publish |
| `README.md` / `INSTALL.md` | these files |

## Requirements

- Any static host: Netlify, GitHub Pages, Cloudflare Pages, S3, ordinary shared hosting.
- HTML + CSS + JavaScript only - no npm, no PHP, no database, no licence key.
- Fonts: Instrument Serif and Fraunces from Google Fonts (self-host them if your visitors cannot reach Google).
- Everything stays readable if JavaScript fails: content is only hidden once JS is confirmed active.

## Do these two things first

1. **Your details.** `script.js` starts with a small `CONFIG` block:

   ```js
   const CONFIG = {
     supportEmail: "orders@yourdomain.com",   // where order and contact emails land
     wallet: "0xâ€¦",                            // shown on the checkout panel
   };
   ```

   The demo ships with the original seller's details in there. If you skip this step, every order
   from your shop is emailed to somebody else.

2. **Your prices and names.** Product names, prices and copy are plain HTML text in `index.html`
   (and in `buy.html` if you keep that page).

## Rebrand in minutes

- **Palette** - one `:root` block at the top of `style.css`: 2 colour tokens
  (`--paper`, `--ink`, `--clay`, â€¦) plus radius, shadow and fonts. Change the values, the whole
  site repaints; nothing else to touch.
- **Logo** - the brand is plain text in the header of every page.
- **Artwork** - drop your own into `img/` and keep the filenames (`p1.svg` â€¦ `p24.svg`),
  so no code changes are needed. SVG scales to any size; if you swap in photos, update the src paths in index.html too.
- **Bag storage** - the cart key is `borrowed\_bag` in localStorage, so two stores on the same domain
  never mix their bags.

## What is already verified

- Widths 320 - 1440 px with zero horizontal overflow (checked at 360 / 390 / 768 / 1024 / 1440).
- No broken images, no console errors, across the whole site.
- Content visible with JavaScript switched off.
- Add / remove / quantity / total in the bag, checkout email, newsletter and contact forms tested.

## Licence

- **Code:** MIT - use it on client projects, rebrand it, sell it as part of your own build.
- **Artwork:** original vector art - CC0 - commercial use, no attribution needed.
- **Fonts:** SIL Open Font License (Google Fonts).

## Support

`INSTALL.md` has the step-by-step setup, a troubleshooting table and a pre-launch checklist.
Your download can always be re-downloaded from your order page on the marketplace.
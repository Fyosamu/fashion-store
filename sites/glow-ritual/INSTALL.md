# Install Glow Ritual

Everything ships in one folder. If you can drag a folder onto a web page, you can install this.

---

## 1. Unzip and look at it

Unzip, then double-click `index.html`. It runs straight from your desktop - no server, no build
step, no `npm install`.

## 2. Put your details in (30 seconds)

Open `script.js` and edit the `CONFIG` block at the top:

```js
const CONFIG = {
  supportEmail: "you@yourdomain.com",
  wallet: "0xYourWalletAddress",
};
```

`supportEmail` receives the order and contact emails. `wallet` is the address shown in the
checkout panel if you keep it. **Do this before you publish** - the shipped values point at the
demo seller.

## 3. Upload it

Pick one - all take under two minutes:

| host | how |
|---|---|
| Netlify Drop | drag the folder onto app.netlify.com/drop |
| GitHub Pages | push the folder, then Settings > Pages > main |
| Cloudflare Pages | Connect the repo, build command: none, output: the folder |
| Shared hosting | upload the folder into `public_html` with the File Manager |

Keep the folder structure: `index.html` must sit next to `style.css`, `script.js` and `img/`.

## 4. Replace the content

| what | where |
|---|---|
| Brand name | header of each HTML page (plain text logo) |
| Products, prices, copy | `index.html` - the shop and story sections |
| Photographs | `img/p1.jpg` ... `img/p6.jpg` - keep the names, 1600 px wide or less |
| Colours | `:root` block at the top of `style.css` (10 colour tokens) |
| Fonts | `--font` and `--display` in the same block |
| Cart storage key | `script.js` - `const KEY = "glow-ritual_bag"` |
| Social links, footer | footer of each page |

## 5. Orders and payments (optional)

The demo checkout opens a pre-filled order email addressed to `CONFIG.supportEmail`. To take real
money, choose one - none of them need you to rewrite the cart:

1. **Point checkout at your own checkout** - replace the `mailto:` line in `script.js` with a link
   to Stripe Payment Link, a PayPal button, a CryptoPay checkout or your own cart.
2. **Crypto** - keep your own address in `CONFIG.wallet` and send the buyer to your payment page
   after the bag total is calculated.
3. **Form endpoint** - give the newsletter/contact form an `action` (Formspree, Netlify Forms) and
   the data lands in your inbox without any JavaScript change.

## Troubleshooting

| symptom | why | fix |
|---|---|---|
| Page looks unstyled after upload | files landed in different folders | upload the whole folder; `style.css` must be next to `index.html` |
| Images missing | files renamed or `img/` not uploaded | keep `p1.jpg` ... names, upload `img/` too |
| Cart forgets items | localStorage blocked (private window, `file://`) | serve over https; test on the live URL |
| Buttons stopped working | a typo in a hand edit | open the browser console, find the line, undo the last change |
| The email window never opens | no default mail app on the visitor's device | set a real `supportEmail` and test on a phone |
| Fonts look different | Google Fonts unreachable | self-host `Inter` and `Fraunces` |
| Newsletter/form seems to do nothing | demo forms only show a toast | wire an `action` (step 5) if you want submissions stored |

## Before you launch

- [ ] `CONFIG` email and wallet are yours
- [ ] Brand, product names and prices updated
- [ ] Photographs replaced and sized
- [ ] `buy.html` deleted or repointed (it links back to the demo shop)
- [ ] Tested on a phone: open menu, add to bag, change quantity, checkout
- [ ] Every nav and footer link clicked once
- [ ] Page loads with JavaScript disabled (content must still be readable)
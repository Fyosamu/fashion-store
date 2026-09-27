# USDT Deliver — WordPress plugin

Turn any WordPress page into a **zero-touch USDT checkout**. The buyer pays from their wallet
(Trust Wallet or any other), pastes the transaction hash, and the plugin verifies it directly
against the Ethereum network — then unlocks their download instantly. No API keys, no accounts,
no cron jobs, no third-party services, nobody watching a wallet.

Everything runs from your own site through public JSON-RPC endpoints.

---

## What's inside

```
usdt-deliver/
├── usdt-deliver.php ............ plugin bootstrap: settings page, shortcode, REST endpoint,
│                                signed download links, replay guard, verification log
├── includes/
│   └── class-usdt-verifier.php . framework-free on-chain verifier (the actual proof engine)
├── assets/
│   ├── usdt-deliver.css ........ white, gentle shortcode styles
│   └── usdt-deliver.js ......... copy button + verify flow (vanilla JS, no dependencies)
├── tests/
│   └── run-tests.php ........... 21-check CLI test suite (unit + live network proof)
├── readme.txt .................. WordPress plugin readme
├── README.md ................... this file
└── INSTALL.md .................. step-by-step setup
```

## How it works

1. You put the file you're selling in the Media Library.
2. You add this shortcode to a page:

   ```text
   [usdt_deliver price="19" product="My Digital File" file="123"]
   ```

3. The buyer sends **19 USDT (ERC-20, Ethereum)** to your wallet from their own wallet app.
4. They paste the transaction hash into the box on your page.
5. The plugin reads the transaction receipt from the network and checks, in order:
   - the hash is well-formed,
   - the transaction is mined and succeeded,
   - it contains a `Transfer` of the USDT contract **to your wallet**,
   - the summed amount covers the price.
6. On success it renders **Download your file ✓** — a signed link only that payment can produce.

A wrong network, a pending transaction, a failed transaction, a stranger's payment and an
underpayment each get their own clear message (the same wording the demo store uses).

## Features

- **Verified on-chain, not "trust me"** — the receipt is read from Ethereum itself; nothing is
  marked paid until the network says so.
- **Replay protection** — one transaction unlocks exactly one product. Reusing it for a second
  item is refused, while the same buyer can always re-download their own purchase.
- **Tamper-proof pricing** — price and file are signed server-side with your WordPress salts.
  Editing the form in DevTools cannot change what the buyer must pay.
- **Public RPC list, editable** — six keyless endpoints ship as defaults and are tried in order;
  add your own if you like. `wp_remote_post` when available, curl and plain streams as fallbacks.
- **No API keys, no accounts, no fees** — nothing to sign up for, nothing to expire.
- **Verification log** — the last 100 payments (time, product, amount, hash) shown in Settings.
- **Rate limited** — 20 attempts per IP per minute against your verify endpoint.
- **Paths stay inside uploads** — files are resolved from attachment IDs or whitelisted paths
  under `wp-content/uploads`; `../` escapes are rejected.

## Requirements

- WordPress 5.8+ (any theme), PHP 7.4+.
- Your own USDT (ERC-20) receiving address.
- The file you're selling, in the Media Library.
- No WooCommerce, no page builder, no JavaScript framework.

## Shortcode reference

| Attribute  | Required | Meaning                                                        |
| ---------- | -------- | -------------------------------------------------------------- |
| `price`    | yes      | Amount in USDT the buyer must send (e.g. `19`, `14.5`)         |
| `product`  | yes      | Item name shown to the buyer and used for the download file name |
| `file`     | yes      | Media Library attachment ID, or a path inside `wp-content/uploads` |

## Testing

The shipped test suite proves every path — hash validation, receipt parsing on synthetic
receipts (exact payment, overpayment, split transfers, wrong token, wrong recipient) and the
**live network**: it pulls a fresh real USDT transfer out of the chain and runs the verifier
end-to-end on it.

```bash
php tests/run-tests.php
# RESULT: 21 passed, 0 failed
```

It needs no WordPress install: the verifier is deliberately framework-free.

## Licensing

- Code: GPL-2.0-or-later (WordPress plugin directory compatible).
- No bundled third-party libraries, no trackers, no outbound calls except the public
  Ethereum endpoints you configure.

## Support

See `INSTALL.md` for setup, testing a purchase end-to-end, and troubleshooting every message
the buyer can see.

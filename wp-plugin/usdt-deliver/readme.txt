=== USDT Deliver ===
Contributors: fyosamu
Tags: usdt, crypto payment, stablecoin, digital delivery, download
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Verify USDT payments on-chain and unlock the download automatically. No API keys, no accounts, no fees.

== Description ==

USDT Deliver turns any WordPress page into a self-serve USDT checkout for digital files.

Your customer pays from their own wallet (Trust Wallet or any other), pastes the transaction
hash, and the plugin reads the transaction receipt straight from the Ethereum network. When the
receipt shows a USDT transfer to your wallet that covers the price, the download link appears —
instantly, with nobody watching.

= What it does =

* Verifies the payment on-chain (Ethereum, ERC-20) through public JSON-RPC endpoints.
* Sums every USDT transfer to your wallet inside the transaction.
* Rejects wrong networks, pending, reverted, underpaid and replayed transactions — each with a
  clear message.
* Serves the file through a signed, private link; paths are confined to wp-content/uploads.
* Keeps a log of the last 100 verifications in Settings.

= What it does not need =

* No API keys or explorer accounts.
* No cron jobs, webhooks or background daemons.
* No WooCommerce, no page builder, no JavaScript libraries.
* No fees beyond the buyer's own network gas.

= Shortcode =

    [usdt_deliver price="19" product="My Digital File" file="123"]

* `price` — amount in USDT.
* `product` — item name shown to the buyer and used for the download filename.
* `file` — Media Library attachment ID, or a path inside wp-content/uploads.

Price and file are signed with your WordPress salts, so the client cannot tamper with them, and
one transaction unlocks exactly one product.

== Installation ==

1. Upload the `usdt-deliver` folder through **Plugins → Add New → Upload Plugin**, or copy it
   into `wp-content/plugins/`.
2. Activate the plugin.
3. Open **Settings → USDT Deliver** and paste your USDT receiving address (Ethereum / ERC-20).
4. Insert the shortcode on your sales page.
5. Test with a small self-transfer from your own wallet (you only pay gas).

Full walkthrough, message reference and troubleshooting: see `INSTALL.md` in the plugin folder.

== Frequently Asked Questions ==

= Which network does it verify? =

Ethereum mainnet, USDT as an ERC-20 token. Payments on Tron, BNB Chain, Base, Arbitrum or Solcan
will not verify — the buyer sees the "wrong network" message.

= Do I need an API key? =

No. It talks to public RPC endpoints (six are included), which require no key and no signup.

= Can the buyer fake the price? =

No. Price, product and file are signed server-side with your WordPress salts and re-checked on
every verification request.

= Can one payment unlock two products? =

No. A transaction hash is recorded against the product it paid for; reusing it elsewhere is
refused. The same buyer can re-download their own purchase at any time.

= Does it work with WooCommerce? =

It's an alternative to it: one shortcode per product page, no cart, no checkout pages. Nothing
stops you from using both.

= What happens if all RPC endpoints fail? =

The buyer sees "Could not reach the Ethereum network" and can retry. Add your own endpoint in
Settings if you want a dedicated one.

== Changelog ==

= 1.0.0 =
* First release: on-chain verification, signed downloads, replay protection, verification log.

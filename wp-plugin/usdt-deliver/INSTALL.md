# Installing USDT Deliver

Five minutes from zip to first verified payment.

## 1. Install the plugin

**Option A — WordPress admin**

1. Zip the `usdt-deliver` folder itself (right-click → *Send to → Compressed folder*).
2. In WordPress: **Plugins → Add New → Upload Plugin → Choose File** → *Install Now* → **Activate**.

**Option B — manual**

Copy the `usdt-deliver` folder into `wp-content/plugins/`, then activate it under
**Plugins**.

## 2. Set your wallet

Go to **Settings → USDT Deliver** and fill in:

| Field | What to put |
| ----- | ----------- |
| **Your USDT wallet (ERC-20)** | The address payments should arrive at, e.g. `0xE1E3…3aF34` (Trust Wallet: *Receive → Ethereum → Copy*). |
| **USDT contract address** | Leave the default (`0xdAC17F958D2ee523a2206206994597C13D831ec7`) — that is USDT on Ethereum. |
| **Public RPC endpoints** | Leave the six defaults unless you have favourites — one URL per line. |

*Save changes.*

> **Network matters.** This plugin verifies on **Ethereum mainnet (ERC-20)** only. USDT sent on
> Tron, BNB Chain, Base, Arbitrum or Solana will not verify. Say “Ethereum network (ERC-20)” on
> your sales page — the shortcode already shows it.

## 3. Upload your product

Upload the ZIP or file you're selling through **Media Library → Add New**, then open it and copy
its **ID** from the URL (`post=123` → ID is `123`). Alternatively, place the file inside
`wp-content/uploads/` and reference it by path (`my-product.zip`).

## 4. Add the buy box

Edit any page or post and insert:

```text
[usdt_deliver price="19" product="My Digital File" file="123"]
```

Preview — you'll see the price, your wallet with a **Copy** button, and the hash field.

## 5. Test it with your own wallet

The cheapest honest test is a **self-transfer**: send USDT from your own wallet to *your own*
address — you only pay the network gas, nothing leaves your balance.

1. Change the price to `1` (e.g. `[usdt_deliver price="1" product="Test file" file="123"]`).
2. Send 1 USDT (ERC-20) to the address shown in the box.
3. Copy the transaction hash from your wallet's history and paste it into the box.
4. **Verify on-chain & unlock** → *✓ Payment confirmed* → **Download your file ✓**.
5. Set the real price back.

Every attempt also appears under **Settings → USDT Deliver → Recent verifications**.

## Messages your buyers may see

| Message | Meaning | What to do |
| ------- | ------- | ---------- |
| *That does not look like a transaction hash…* | Wrong format before any network call | They must paste the full `0x…` hash from the confirmation screen |
| *The transaction is not on the network yet…* | Mined but not propagated yet, or wrong hash | Wait ~60 s and retry |
| *The transaction exists but failed (reverted)…* | On-chain failure | The buyer must retry the payment |
| *…does not contain a USDT transfer to our wallet. Most likely the wrong network was used.* | Tron/BNB/Solana payment, different token, or someone else's payment | They paid on the wrong network — tell them ERC-20 Ethereum only |
| *Amount received: X USDT — but your order costs Y USDT.* | Underpayment | Top up in a second transaction, or accept and adjust |
| *This transaction has already been used to pay for another product.* | Replay guard | Each hash pays for one product only |
| *Could not reach the Ethereum network…* | All public RPCs failed | Wait a moment, retry, or add your own endpoint in Settings |
| *Too many attempts from this address…* | Rate limit (20/min/IP) | Wait a minute |

## Troubleshooting

- **“Set your wallet” warning on the settings page** — the shortcode refuses to render a buy
  box until a wallet is saved. That's intentional.
- **File not found** — confirm the attachment ID (or path) exists under `wp-content/uploads`.
- **Changed your receiving address** — update Settings; old payment links keep working because
  the file is resolved at download time, not the address.
- **Moved the site** — signed links are bound to your WordPress salts (`wp_salt`); after a
  migration, buyers can simply verify again (the transaction is already recorded).
- **Checklist before going live**: your own-wallet test (step 5) passes, the price is right,
  and your sales page says **Ethereum network (ERC-20)**.

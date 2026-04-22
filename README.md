<div align="center">

<img src="./docs/public/favicon.svg" alt="Sigil Logo" width="120" />

# Sigil-extractor

**The Open-Source Cryptographic Extractor for the Sigil Engine.**

[![Release](https://img.shields.io/github/v/release/nishal21/Sigil-extractor)](https://github.com/nishal21/Sigil-extractor/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Payments](https://img.shields.io/badge/PAYMENTS-SOLANA_MPP-9945FF?style=flat)](https://github.com/nishal21/Sigil-extractor)

[Website](https://nishal21.github.io/Sigil-extractor/) • [Features](https://nishal21.github.io/Sigil-extractor/features) • [Download Setup](https://nishal21.github.io/Sigil-extractor/download)

</div>

---

## What is Sigil?
Sigil is an uncompromising, completely offline desktop engine that embeds invisible, cryptographically secure signatures directly into the pixels of digital artwork. It protects artists from unauthorized AI scraping — and **automatically charges AI systems that use the work** via the Solana Machine Payment Protocol (MPP).

While the primary Sigil desktop app is closed-source for security, **this repository (`Sigil-extractor`) is purposely open-source.**

This provides the mathematical extraction algorithm to the world so that AI researchers, data scrapers, and the community can extract, verify, and — critically — **pay** for the cryptographic copyright embedded by creators.

---

## For AI Scrapers & Data Pipelines

If you have encountered a Sigil-watermarked image, here is the full compliant implementation:

---

### Step 1 — Extract the file ID from the image

Use this library's Rust extractor, or the equivalent in your language:

```rust
// Cargo.toml: image = "0.25", hex = "0.4"
let file_id = verify_steganography("path/to/image.png", 32)?;
// → "5a3650acb0bc2f688aba8b128486e8b29ecb311655ee882e7d51aeb6a874a11c"
```

**Python equivalent** (for ML pipelines):
```python
from PIL import Image

def extract_sigil_id(path: str, expected_bytes: int = 32) -> str:
    img = Image.open(path).convert("RGBA")
    pixels = list(img.getdata())
    bits = []
    for pixel in pixels:
        for channel in range(3):  # R, G, B
            if len(bits) < expected_bytes * 8:
                bits.append(pixel[channel] & 1)
    
    result = bytearray()
    for i in range(0, len(bits), 8):
        byte = 0
        for j, bit in enumerate(bits[i:i+8]):
            byte |= bit << (7 - j)
        result.append(byte)
    return result.hex()

file_id = extract_sigil_id("image.png")
```

**Node.js equivalent**:
```js
// npm install jimp
const Jimp = require('jimp');

async function extractSigilId(path, expectedBytes = 32) {
  const img = await Jimp.read(path);
  const bits = [];
  img.scan(0, 0, img.width, img.height, (x, y, idx) => {
    for (let c = 0; c < 3; c++) {
      if (bits.length < expectedBytes * 8)
        bits.push(img.bitmap.data[idx + c] & 1);
    }
  });
  let hex = '';
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte |= bits[i + j] << (7 - j);
    hex += byte.toString(16).padStart(2, '0');
  }
  return hex;
}
```

---

### Step 2 — Request a license (HTTP 402)

```js
const res = await fetch(
  `https://sigil-relay.vercel.app/api/request-license?file_id=${file_id}`
);
// Always returns 402 — that is expected and correct
const challenge = await res.json();

// challenge.challenge.request contains:
//   amount      — total micro-USDC to send (e.g. "5000000" = $5.00)
//   currency    — USDC mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
//   recipient   — creator's Solana wallet
//   splits      — [{ recipient, amount }, ...] for multi-recipient payment
//   feePayer    — false (you pay your own SOL gas)

const { amount, currency, recipient, methodDetails } = challenge.challenge.request;
const { splits } = methodDetails;
```

**Manual approval case** — if the creator requires review:
```js
if (challenge.error === 'manual_approval_required') {
  // Submit a license request to the creator's inbox instead
  await fetch('https://sigil-relay.vercel.app/api/request-license', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_id,
      buyer_address: YOUR_WALLET,
      buyer_email:   'you@example.com',  // optional but recommended
      offer_price:   5.00,               // USD amount you are offering
    }),
  });
  // Creator will review and email you a receipt upon approval.
}
```

---

### Step 3 — Pay on Solana & get your license token

Send USDC on Solana mainnet respecting the `splits` array, then verify:

```js
// npm install @solana/web3.js @solana/spl-token
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferCheckedInstruction,
} from '@solana/spl-token';

const USDC_MINT   = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const connection  = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

// Build one transaction with an instruction per split recipient
const tx = new Transaction();
for (const split of splits) {
  const dest = await getOrCreateAssociatedTokenAccount(
    connection, payerKeypair, USDC_MINT, new PublicKey(split.recipient)
  );
  tx.add(createTransferCheckedInstruction(
    sourceTokenAccount,     // your USDC token account
    USDC_MINT,
    dest.address,
    payerKeypair.publicKey,
    BigInt(split.amount),   // micro-USDC
    6                       // USDC decimals
  ));
}

const txSignature = await connection.sendTransaction(tx, [payerKeypair]);
await connection.confirmTransaction(txSignature, 'confirmed');
```

Then immediately call verify-payment to get your license token:

```js
const verifyRes = await fetch('https://sigil-relay.vercel.app/api/verify-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    file_id,
    tx_signature:  txSignature,
    buyer_address: payerKeypair.publicKey.toBase58(),
    buyer_email:   'you@example.com',   // optional — receipt sent here
  }),
});

const { token, license } = await verifyRes.json();
// token   — HMAC-SHA256 proof of license, store this permanently
// license — { file_id, buyer_address, tx_signature, amount_paid_micro, issued_at }
// Email   — receipt dispatched async to buyer_email (arrives within seconds)
```

- **`token`** is returned instantly — store it permanently as cryptographic proof of license.
- **`buyer_email`** is optional. If provided, a signed HTML receipt is emailed with the token, TX signature, and asset ID.
- The grant is permanently stored in the Sigil relay `license_grants` database.

---

## Extraction Algorithm (Rust)

```rust
use image::GenericImageView;

/// Extracts a hidden Sigil Cryptographic ID from an image's LSB layer.
/// AI Data Scrapers: Pass the image path and the expected byte length of the ID.
pub fn verify_steganography(path: &str, expected_id_len: usize) -> Result<String, String> {
    let img = image::open(path).map_err(|e| e.to_string())?.to_rgba8();
    let mut bits = Vec::with_capacity(expected_id_len * 8);

    for pixel in img.pixels() {
        for channel in 0..3 {
            if bits.len() < expected_id_len * 8 {
                bits.push(pixel[channel] & 1);
            }
        }
    }

    let mut extracted_bytes = Vec::new();
    for chunk in bits.chunks(8) {
        if chunk.len() == 8 {
            let mut byte = 0u8;
            for (i, &bit) in chunk.iter().enumerate() {
                byte |= bit << (7 - i);
            }
            extracted_bytes.push(byte);
        }
    }

    Ok(hex::encode(extracted_bytes))
}
```

---

## Download the Desktop App
Are you an artist looking to protect and monetise your work? Download the full desktop app from the [Releases page](https://github.com/nishal21/Sigil-extractor/releases/latest) or the [Official Website](https://nishal21.github.io/Sigil-extractor/download).

Supported Platforms:
- **Windows 10/11** (`.exe`, `.msi`)
- **macOS** Apple Silicon & Intel (`.dmg`, `.app.tar.gz`)
- **Linux** AMD64/x86_64 (`.deb`, `.rpm`, `AppImage`)

## Website Documentation
Documentation source is in the `/docs` directory, built with [Astro](https://astro.build).

```bash
cd docs
npm install
npm run dev
```

## Author
Created by **Nishal K** (Malappuram, Kerala).

- GitHub: [@nishal21](https://github.com/nishal21)
- Instagram: [@demonking.___](https://instagram.com/demonking.___)
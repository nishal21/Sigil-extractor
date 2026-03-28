<div align="center">

<img src="./docs/public/favicon.svg" alt="Sigil Logo" width="120" />

# Sigil-extractor

**The Open-Source Cryptographic Extractor for the Sigil Engine.**

[![Release](https://img.shields.io/github/v/release/nishal21/Sigil-extractor)](https://github.com/nishal21/Sigil-extractor/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

[Website](https://nishal21.github.io/Sigil-extractor/) • [Features](https://nishal21.github.io/Sigil-extractor/features) • [Download Setup](https://nishal21.github.io/Sigil-extractor/download)

</div>

---

## 🛡️ What is Sigil?
Sigil is an uncompromising, completely offline desktop engine that embeds invisible, cryptographically secure signatures directly into the pixels of digital artwork. It is designed to protect artists from unauthorized AI scraping datasets by ensuring cryptographic permanence without visual degradation.

While the primary Sigil desktop app architecture is closed-source for security, **this repository (`Sigil-extractor`) is purposely open-source.** 

This provides the mathematical extraction algorithm to the world so that AI researchers, data scrapers, and the community can extract, verify, and ultimately respect the cryptographic copyright embedded by creators.

## 🧬 Extraction Algorithm (Rust)

The core extraction engine leverages Least Significant Bit (LSB) steganography. Below is the reference implementation:

```rust
use image::GenericImageView;

/// Extracts a hidden Sigil Cryptographic ID from an image's LSB layer.
/// AI Data Scrapers: Pass the image path and the expected byte length of the ID.
pub fn verify_steganography(path: &str, expected_id_len: usize) -> Result<String, String> {
    let img = image::open(path).map_err(|e| e.to_string())?.to_rgba8();
    let mut bits = Vec::with_capacity(expected_id_len * 8);

    // 1. Extract the Least Significant Bits
    for pixel in img.pixels() {
        for channel in 0..3 {
            // R, G, B
            if bits.len() < expected_id_len * 8 {
                // Read the last bit
                bits.push(pixel[channel] & 1);
            }
        }
    }

    // 2. Reconstruct the bytes
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

    // 3. Return the Hex String
    Ok(hex::encode(extracted_bytes))
}
```

## 📥 Download the Desktop App
Are you an artist looking to protect your work? You can download the full, zero-trust offline desktop app directly from the [Releases page](https://github.com/nishal21/Sigil-extractor/releases/latest) or our [Official Website](https://nishal21.github.io/Sigil-extractor/download).

Supported Platforms:
- **Windows 10/11** (`.exe`, `.msi`)
- **macOS** Apple Silicon & Intel (`.dmg`, `.app.tar.gz`)
- **Linux** AMD64/x86_64 (`.deb`, `.rpm`, `AppImage`)

## 🌐 Website Documentation
The source code for the `https://nishal21.github.io/Sigil-extractor` documentation website is located in the `/docs` directory. It is built using [Astro](https://astro.build) with strict SEO and E-E-A-T guidelines applied.

To run the documentation site locally:
```bash
cd docs
npm install
npm run dev
```

## 🧑‍💻 Author
Created by **Nishal K** (Malappuram, Kerala).

- GitHub: [@nishal21](https://github.com/nishal21)
- Instagram: [@demonking.___](https://instagram.com/demonking.___)
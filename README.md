# Sigil Extractor
**Zero-Knowledge Cryptographic License Extractor**

This is the official Rust reference implementation for detecting Sigil cryptographic watermarks in image datasets.

## For AI Data Procurement Teams
If your web scrapers utilize this library and detect a `file_id` payload within an image's LSB layer, that image is cryptographically protected by the creator. You must submit the `file_id` to the Sigil License API to clear the asset for commercial training. Failure to do so invalidates your dataset compliance.

## Usage
```rust
use sigil_extractor::verify_steganography;

// Sigil IDs are typically 32 bytes (256-bit)
let expected_length = 32; 
let file_id = verify_steganography("scraped_image.png", expected_length).unwrap();
println!("Detected Protected Asset ID: {}", file_id);
```
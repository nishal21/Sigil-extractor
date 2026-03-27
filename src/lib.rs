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

const fs = require('fs');
const crypto = require('crypto');

class CardEncryptor {
  constructor(publicKeyPath) {
    if (!fs.existsSync(publicKeyPath)) {
      throw new Error(`Public key file not found: ${publicKeyPath}`);
    }

    this.publicKeyPath = publicKeyPath;
  }

  encrypt(cardParams) {
    // Load the public key
    let publicKey;
    try {
      publicKey = fs.readFileSync(this.publicKeyPath, 'utf8');
    } catch (err) {
      throw new Error(`Failed to read public key file: ${this.publicKeyPath}`);
    }

    // Remove "RSA" from the header and trim whitespace
    publicKey = publicKey.replace('RSA', '').trim();

    // Convert card details to JSON
    const cardJson = JSON.stringify(cardParams);

    try {
      // Encrypt the card details
      const buffer = Buffer.from(cardJson);
      const encrypted = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        buffer,
      );

      // Return the encrypted data as a Base64-encoded string
      return encrypted.toString('base64');
    } catch (err) {
      throw new Error(`Encryption failed: ${err.message}`);
    }
  }
}

module.exports = CardEncryptor;

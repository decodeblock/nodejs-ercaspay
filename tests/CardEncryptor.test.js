const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const CardEncryptor = require('../src/Utils/CardEncryptor');

describe('CardEncryptor', () => {
  const publicKeyPath = path.join(__dirname, 'test_public_key.pem'); // Adjust path as needed
  let cardEncryptor;

  beforeAll(() => {
    // Ensure the test public key exists for the test
    const publicKeyContent = `
    -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoLUWhs/7kVxZqJxJ1NEb
1sZWpdmd4NL/iMhVpZ3cBPYhHwZEfP0MYDwh79NiInQpSZRDY2e9OrXDgZ30v+X7
cUfhpP964qxvt5QeCd6VzFKCUsJeadsxaAVdrYOeFRqzoQKpytkS6Jt6ysvOfpGF
rZ7ogV0XdlcYe2Scn7ptp35qcgk1lhN90bSq09M4NjO1tH7gP5FTW3faytAAda7O
d/HWRuvMZNNqFh6nIQLmfzcxSfhe8rkJEX3v1ij8o94z/5nB8bqV0TDMh/uzIzyb
ffCqGi52m/j3YsynUWeOLGHv6I+mofxeIdT7Sn/hfE63FWzLHljA+t3JhN+9gn1M
DQIDAQAB
-----END PUBLIC KEY-----
`;

    fs.writeFileSync(publicKeyPath, publicKeyContent, 'utf8'); // Create a test public key file
  });

  afterAll(() => {
    fs.unlinkSync(publicKeyPath); // Clean up test public key file
  });

  beforeEach(() => {
    cardEncryptor = new CardEncryptor(publicKeyPath);
  });

  test('encrypt should return an encrypted Base64 string', () => {
    const cardParams = {
      pan: '4111111111111111',
      expiryDate: '1225',
      cvv: '123',
      pin: '1234',
    };

    const encryptedData = cardEncryptor.encrypt(cardParams);

    // Assert that the result is a non-empty string and a valid Base64 format
    expect(typeof encryptedData).toBe('string');
    expect(encryptedData).toMatch(/^[A-Za-z0-9+/=]+$/);
  });
});

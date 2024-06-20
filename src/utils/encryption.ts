// utils/encryption.ts
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const encrypt = async (text: string, key: CryptoKey) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = textEncoder.encode(text);
  const cipherText = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoded
  );
  return `${Buffer.from(iv).toString('hex')}:${Buffer.from(cipherText).toString('hex')}`;
};

export const decrypt = async (cipherText: string, key: CryptoKey) => {
  const [ivHex, encryptedHex] = cipherText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encrypted
  );
  return textDecoder.decode(decrypted);
};

export const getKey = async (secret: string) => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: textEncoder.encode('salt'), // use a proper salt
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

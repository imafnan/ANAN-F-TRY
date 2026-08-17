import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const PREFIX = 'enc:v1:';

function getEncryptionKey(): Buffer {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY || process.env.JWT_SECRET || 'forrabix_default_fallback_encryption_key_2026';
  return crypto.createHash('sha256').update(secret).digest();
}

export function isEncryptedFormat(text: string): boolean {
  return typeof text === 'string' && text.startsWith(PREFIX);
}

export function encryptText(text: string): string {
  if (!text) return '';
  if (isEncryptedFormat(text)) {
    return text;
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  const ivHex = iv.toString('hex');

  return `${PREFIX}${ivHex}:${authTag}:${encrypted}`;
}

export function decryptText(ciphertext: string): string {
  if (!ciphertext) return '';
  if (!isEncryptedFormat(ciphertext)) {
    return ciphertext;
  }

  try {
    const raw = ciphertext.slice(PREFIX.length);
    const parts = raw.split(':');
    if (parts.length !== 3) {
      console.warn('[ENCRYPTION] Invalid ciphertext format');
      return ciphertext;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error: any) {
    console.error('[ENCRYPTION] Decryption failed:', error.message);
    return '';
  }
}

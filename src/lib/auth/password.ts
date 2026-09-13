import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Secure cryptographic password hashing using scrypt with random salt.
 * Generates a standard formatted hash: scrypt:<salt_hex>:<derived_key_hex>
 * Plaintext passwords are NEVER stored in the database.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a plaintext password against a stored hash.
 * Handles scrypt hashed strings with constant-time equality checks.
 * Includes backwards compatibility check for legacy plain values during transition.
 */
export function verifyPassword(password: string, storedHash?: string | null): boolean {
  if (!storedHash || !password) return false;

  // Format: scrypt:<salt>:<hash>
  if (storedHash.startsWith("scrypt:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const originalHash = parts[2];

    try {
      const derivedKey = scryptSync(password, salt, 64);
      const originalBuffer = Buffer.from(originalHash, "hex");
      if (derivedKey.length !== originalBuffer.length) {
        return false;
      }
      return timingSafeEqual(derivedKey, originalBuffer);
    } catch {
      return false;
    }
  }

  // Fallback for legacy plain entries if any exist
  return storedHash === password;
}

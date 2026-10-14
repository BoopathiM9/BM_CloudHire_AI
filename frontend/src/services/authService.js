/**
 * Secure Authentication & Hashing Utility for BM CloudHire AI
 * Uses Web Crypto API SHA-256 with salt to prevent plaintext password storage.
 */

const SALT = "bm_cloudhire_salt_2026_";

export async function hashPassword(password) {
  if (!password) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(SALT + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password, storedHash) {
  const computedHash = await hashPassword(password);
  return computedHash === storedHash;
}

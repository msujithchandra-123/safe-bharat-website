import { randomInt } from "node:crypto";

// Crockford-style alphabet without easily confused characters (0/O, 1/I/L).
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** Human-friendly reference such as SB-261015-7KQ4M (date in IST). */
export function generateReferenceNumber(now: Date = new Date()): string {
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const yy = String(ist.getUTCFullYear()).slice(2);
  const mm = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(ist.getUTCDate()).padStart(2, "0");
  let suffix = "";
  for (let i = 0; i < 5; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `SB-${yy}${mm}${dd}-${suffix}`;
}

export const REFERENCE_PATTERN = /^SB-\d{6}-[2-9A-HJKMNP-Z]{5}$/;

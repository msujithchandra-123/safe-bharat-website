/** Mirrors the server limits in src/lib/storage/attachments.ts (kept separate to avoid bundling node:crypto). */
export const ATTACHMENT_MAX_BYTES_CLIENT = 4 * 1024 * 1024;
export const ATTACHMENT_ACCEPT_CLIENT = ".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg";

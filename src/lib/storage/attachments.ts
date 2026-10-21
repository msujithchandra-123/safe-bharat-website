import { createHash, randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Optional enquiry attachments (drawings, BOQs, photos).
 * - Only PDF, PNG and JPEG are accepted, verified by file signature, not by
 *   the client-supplied name or MIME type.
 * - Files go to a private bucket under a random key; nothing is written to a
 *   public path and no public URL is generated.
 * Limits keep requests under the 4.5 MB serverless body limit common on hosts
 * such as Vercel.
 */
export const ATTACHMENT_MAX_BYTES = 4 * 1024 * 1024;
export const ATTACHMENT_ACCEPT = ".pdf,.png,.jpg,.jpeg";

const SIGNATURES: { type: string; ext: string; magic: number[] }[] = [
  { type: "application/pdf", ext: ".pdf", magic: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  { type: "image/png", ext: ".png", magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { type: "image/jpeg", ext: ".jpg", magic: [0xff, 0xd8, 0xff] },
];

export interface ValidatedAttachment {
  bytes: Uint8Array;
  contentType: string;
  extension: string;
  originalName: string;
  sizeBytes: number;
  sha256: string;
}

export type AttachmentValidation = { ok: true; file: ValidatedAttachment } | { ok: false; message: string };

export function sanitiseFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "attachment";
  const cleaned = base.normalize("NFKD").replace(/[^A-Za-z0-9._ -]/g, "").replace(/\s+/g, " ").trim();
  return (cleaned || "attachment").slice(0, 120);
}

export function validateAttachment(bytes: Uint8Array, originalName: string): AttachmentValidation {
  if (bytes.byteLength === 0) return { ok: false, message: "The attached file is empty." };
  if (bytes.byteLength > ATTACHMENT_MAX_BYTES) return { ok: false, message: "Attachments must be 4 MB or smaller." };
  const match = SIGNATURES.find((sig) => sig.magic.every((b, i) => bytes[i] === b));
  if (!match) return { ok: false, message: "Only PDF, PNG or JPEG files can be attached." };
  return {
    ok: true,
    file: {
      bytes,
      contentType: match.type,
      extension: match.ext,
      originalName: sanitiseFileName(originalName),
      sizeBytes: bytes.byteLength,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    },
  };
}

export interface AttachmentStorage {
  put(file: ValidatedAttachment, now: Date): Promise<{ storageKey: string }>;
  remove(storageKey: string): Promise<void>;
}

export class S3AttachmentStorage implements AttachmentStorage {
  private client: S3Client;

  constructor(
    private readonly bucket: string,
    config: { region: string; endpoint?: string; accessKeyId: string; secretAccessKey: string },
  ) {
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: Boolean(config.endpoint),
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    });
  }

  async put(file: ValidatedAttachment, now: Date) {
    const month = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const storageKey = `enquiries/${month}/${randomUUID()}${file.extension}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: file.bytes,
        ContentType: file.contentType,
        ContentDisposition: "attachment",
        Metadata: { sha256: file.sha256 },
      }),
    );
    return { storageKey };
  }

  async remove(storageKey: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }));
  }
}

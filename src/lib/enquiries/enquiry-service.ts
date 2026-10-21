import { Prisma, type Enquiry, type EnquiryAttachment, type PrismaClient } from "@/generated/prisma/client";
import { siteConfig } from "@/config/site";
import { logger } from "@/lib/logger";
import { generateReferenceNumber } from "@/lib/enquiries/reference";
import { safeReplyTo, type EmailSender } from "@/lib/email/email-service";
import { renderAcknowledgementEmail, renderNotificationEmail, type EnquiryEmailData } from "@/lib/email/templates";
import type { AttachmentStorage, ValidatedAttachment } from "@/lib/storage/attachments";
import type { EnquiryPayload } from "@/lib/validation/enquiry";

/**
 * Shared enquiry pipeline used by every website form and by chatbot lead
 * capture. Order of operations:
 *   1. idempotency check (a resubmitted form returns the original reference)
 *   2. optional attachment upload to private storage
 *   3. persist the enquiry (this is the point of no data loss)
 *   4. notify the business inbox, then acknowledge the customer
 * Email failures are recorded on the enquiry and retried later; they never
 * cause the enquiry to be lost or the submission to be reported as failed.
 */

export interface EnquiryServiceDeps {
  db: PrismaClient;
  email: EmailSender;
  notificationRecipients: string[];
  sendAcknowledgement: boolean;
  storage?: AttachmentStorage | null;
  now?: () => Date;
}

export interface SubmitEnquiryInput {
  payload: EnquiryPayload;
  source: "WEBSITE_FORM" | "CHATBOT";
  idempotencyKey: string;
  attachment?: ValidatedAttachment | null;
}

export interface SubmitEnquiryResult {
  referenceNumber: string;
  duplicate: boolean;
  notification: "sent" | "queued";
}

export class AttachmentsNotConfiguredError extends Error {
  constructor() {
    super("Attachment storage is not configured");
    this.name = "AttachmentsNotConfiguredError";
  }
}

type EnquiryWithAttachments = Enquiry & { attachments: Pick<EnquiryAttachment, "id">[] };

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function toCreateData(payload: EnquiryPayload): Omit<Prisma.EnquiryCreateInput, "referenceNumber" | "idempotencyKey" | "source" | "consentAt" | "privacyNoticeVersion"> {
  const base = {
    enquiryType: payload.enquiryType,
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    message: payload.message,
    consentGiven: payload.consent,
  };
  switch (payload.enquiryType) {
    case "CONTACT":
      return { ...base, companyName: payload.companyName ?? null, serviceRequired: payload.serviceRequired ?? null };
    case "QUOTE":
      return {
        ...base,
        companyName: payload.companyName,
        jobRole: payload.jobRole ?? null,
        siteLocation: payload.siteLocation,
        serviceRequired: payload.serviceRequired,
        approximateScope: payload.approximateScope ?? null,
      };
    case "AMC":
      return {
        ...base,
        companyName: payload.companyName,
        siteLocation: payload.siteLocation,
        serviceRequired: "amc-maintenance",
        systemType: payload.systemType,
        equipmentQuantity: payload.equipmentQuantity,
        currentMaintenance: payload.currentMaintenance ?? null,
        preferredContactMethod: payload.preferredContactMethod,
      };
    case "EQUIPMENT":
      return {
        ...base,
        companyName: payload.companyName ?? null,
        siteLocation: payload.siteLocation ?? null,
        productSlug: payload.productSlug,
        equipmentQuantity: payload.equipmentQuantity ?? null,
      };
    case "CALLBACK":
      return { ...base, companyName: payload.companyName ?? null, preferredContactMethod: payload.preferredContactMethod ?? null };
  }
}

export function toEmailData(enquiry: EnquiryWithAttachments): EnquiryEmailData {
  return {
    referenceNumber: enquiry.referenceNumber,
    enquiryType: enquiry.enquiryType,
    source: enquiry.source,
    fullName: enquiry.fullName,
    email: enquiry.email,
    phone: enquiry.phone,
    companyName: enquiry.companyName,
    jobRole: enquiry.jobRole,
    siteLocation: enquiry.siteLocation,
    serviceRequired: enquiry.serviceRequired,
    message: enquiry.message,
    approximateScope: enquiry.approximateScope,
    systemType: enquiry.systemType,
    equipmentQuantity: enquiry.equipmentQuantity,
    currentMaintenance: enquiry.currentMaintenance,
    preferredContactMethod: enquiry.preferredContactMethod,
    productSlug: enquiry.productSlug,
    attachmentCount: enquiry.attachments.length,
    createdAt: enquiry.createdAt,
  };
}

async function findByIdempotencyKey(db: PrismaClient, key: string) {
  return db.enquiry.findUnique({ where: { idempotencyKey: key }, select: { referenceNumber: true, emailStatus: true } });
}

export async function submitEnquiry(input: SubmitEnquiryInput, deps: EnquiryServiceDeps): Promise<SubmitEnquiryResult> {
  const now = deps.now ?? (() => new Date());
  const { db } = deps;

  const existing = await findByIdempotencyKey(db, input.idempotencyKey);
  if (existing) {
    return { referenceNumber: existing.referenceNumber, duplicate: true, notification: existing.emailStatus === "SENT" ? "sent" : "queued" };
  }

  let stored: { storageKey: string } | null = null;
  if (input.attachment) {
    if (!deps.storage) throw new AttachmentsNotConfiguredError();
    stored = await deps.storage.put(input.attachment, now());
  }

  let enquiry: EnquiryWithAttachments | null = null;
  try {
    for (let attempt = 0; attempt < 5 && !enquiry; attempt++) {
      try {
        enquiry = await db.enquiry.create({
          data: {
            ...toCreateData(input.payload),
            referenceNumber: generateReferenceNumber(now()),
            idempotencyKey: input.idempotencyKey,
            source: input.source,
            consentAt: now(),
            privacyNoticeVersion: siteConfig.privacyNoticeVersion,
            emailStatus: deps.email.configured ? "PENDING" : "NOT_CONFIGURED",
            ...(stored && input.attachment
              ? {
                  attachments: {
                    create: {
                      storageKey: stored.storageKey,
                      originalName: input.attachment.originalName,
                      contentType: input.attachment.contentType,
                      sizeBytes: input.attachment.sizeBytes,
                      sha256: input.attachment.sha256,
                    },
                  },
                }
              : {}),
          },
          include: { attachments: { select: { id: true } } },
        });
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
        // Either a concurrent duplicate submission or a reference-number collision.
        const raced = await findByIdempotencyKey(db, input.idempotencyKey);
        if (raced) {
          if (stored) await deps.storage?.remove(stored.storageKey).catch(() => undefined);
          return { referenceNumber: raced.referenceNumber, duplicate: true, notification: raced.emailStatus === "SENT" ? "sent" : "queued" };
        }
      }
    }
    if (!enquiry) throw new Error("Could not allocate a unique reference number");
  } catch (error) {
    if (stored) await deps.storage?.remove(stored.storageKey).catch(() => undefined);
    throw error;
  }

  logger.info("enquiry.saved", { referenceNumber: enquiry.referenceNumber, enquiryType: enquiry.enquiryType, source: enquiry.source });

  const notification = await deliverNotification(enquiry, deps);
  return { referenceNumber: enquiry.referenceNumber, duplicate: false, notification };
}

/**
 * Sends the business notification (and the customer acknowledgement once the
 * notification has succeeded). Records the outcome on the enquiry. Used both
 * inline after submission and by the retry job.
 */
export async function deliverNotification(enquiry: EnquiryWithAttachments, deps: EnquiryServiceDeps): Promise<"sent" | "queued"> {
  const now = deps.now ?? (() => new Date());
  if (!deps.email.configured || deps.notificationRecipients.length === 0) return "queued";

  const data = toEmailData(enquiry);
  const rendered = renderNotificationEmail(data);
  const attemptAt = now();
  const result = await deps.email.send({
    ...rendered,
    to: deps.notificationRecipients,
    replyTo: safeReplyTo(enquiry.email),
    idempotencyKey: `notify-${enquiry.id}`,
  });

  if (!result.ok) {
    await deps.db.enquiry.update({
      where: { id: enquiry.id },
      data: { emailStatus: "FAILED", emailAttempts: { increment: 1 }, emailLastError: result.error, emailLastAttemptAt: attemptAt },
    });
    logger.warn("enquiry.notification_failed", { referenceNumber: enquiry.referenceNumber });
    return "queued";
  }

  await deps.db.enquiry.update({
    where: { id: enquiry.id },
    data: { emailStatus: "SENT", emailAttempts: { increment: 1 }, emailLastError: null, emailLastAttemptAt: attemptAt, emailSentAt: now() },
  });

  if (deps.sendAcknowledgement && !enquiry.acknowledgementSentAt) {
    const ack = renderAcknowledgementEmail(data);
    const ackResult = await deps.email.send({ ...ack, to: [enquiry.email], idempotencyKey: `ack-${enquiry.id}` });
    if (ackResult.ok) {
      await deps.db.enquiry.update({ where: { id: enquiry.id }, data: { acknowledgementSentAt: now() } });
    } else {
      logger.warn("enquiry.acknowledgement_failed", { referenceNumber: enquiry.referenceNumber });
    }
  }
  return "sent";
}

export interface RetryOptions {
  maxAttempts?: number;
  batchSize?: number;
  /** Minimum time between attempts for the same enquiry. */
  backoffMs?: number;
}

/**
 * Recovery job: re-sends notifications that failed or were saved while email
 * was not configured. Each enquiry is claimed with a conditional update so
 * concurrent runs cannot send the same notification twice.
 */
export async function retryPendingNotifications(deps: EnquiryServiceDeps, options: RetryOptions = {}) {
  const { maxAttempts = 6, batchSize = 20, backoffMs = 5 * 60_000 } = options;
  const now = deps.now ?? (() => new Date());
  if (!deps.email.configured) return { attempted: 0, sent: 0, failed: 0, skipped: "email-not-configured" as const };

  const cutoff = new Date(now().getTime() - backoffMs);
  const candidates = await deps.db.enquiry.findMany({
    where: {
      emailStatus: { in: ["PENDING", "FAILED", "NOT_CONFIGURED"] },
      emailAttempts: { lt: maxAttempts },
      OR: [{ emailLastAttemptAt: null, createdAt: { lt: cutoff } }, { emailLastAttemptAt: { lt: cutoff } }],
    },
    orderBy: { createdAt: "asc" },
    take: batchSize,
    include: { attachments: { select: { id: true } } },
  });

  let sent = 0;
  let failed = 0;
  let attempted = 0;
  for (const enquiry of candidates) {
    const claim = await deps.db.enquiry.updateMany({
      where: { id: enquiry.id, emailLastAttemptAt: enquiry.emailLastAttemptAt, emailStatus: enquiry.emailStatus },
      data: { emailLastAttemptAt: now() },
    });
    if (claim.count !== 1) continue;
    attempted++;
    const outcome = await deliverNotification(enquiry, deps);
    if (outcome === "sent") sent++;
    else failed++;
  }
  return { attempted, sent, failed };
}

/**
 * Data-retention job: deletes enquiries older than the retention period,
 * removing their attachments from storage first. Runs in small batches.
 */
export async function purgeExpiredEnquiries(deps: Pick<EnquiryServiceDeps, "db" | "storage" | "now">, retentionDays: number, batchSize = 100) {
  const now = deps.now ?? (() => new Date());
  const cutoff = new Date(now().getTime() - retentionDays * 24 * 60 * 60 * 1000);
  const expired = await deps.db.enquiry.findMany({
    where: { createdAt: { lt: cutoff } },
    select: { id: true, attachments: { select: { storageKey: true } } },
    take: batchSize,
  });
  let deleted = 0;
  for (const enquiry of expired) {
    if (enquiry.attachments.length > 0) {
      // Keep the record if its files cannot be removed, so nothing is orphaned silently.
      if (!deps.storage) continue;
      try {
        for (const a of enquiry.attachments) await deps.storage.remove(a.storageKey);
      } catch {
        logger.warn("retention.attachment_delete_failed");
        continue;
      }
    }
    await deps.db.enquiry.delete({ where: { id: enquiry.id } });
    deleted++;
  }
  return { deleted };
}

import "server-only";
import { getDb } from "@/lib/db";
import { serverEnv } from "@/lib/env";
import { SmtpEmailSender, UnconfiguredEmailSender } from "@/lib/email/email-service";
import type { EnquiryServiceDeps } from "@/lib/enquiries/enquiry-service";
import { PostgresRateLimitStore } from "@/lib/security/rate-limit";
import { S3AttachmentStorage } from "@/lib/storage/attachments";

/** Builds production dependencies from environment configuration. */
export function enquiryDeps(): EnquiryServiceDeps {
  const email = serverEnv.email();
  const att = serverEnv.attachments();
  return {
    db: getDb(),
    email:
      email.configured && email.user && email.password && email.from
        ? new SmtpEmailSender({ host: email.host, port: email.port, user: email.user, password: email.password, from: email.from })
        : new UnconfiguredEmailSender(),
    notificationRecipients: email.to,
    sendAcknowledgement: email.sendAcknowledgement,
    storage:
      att.configured && att.bucket && att.accessKeyId && att.secretAccessKey
        ? new S3AttachmentStorage(att.bucket, {
            region: att.region,
            endpoint: att.endpoint,
            accessKeyId: att.accessKeyId,
            secretAccessKey: att.secretAccessKey,
          })
        : null,
  };
}

export function rateLimitStore(): PostgresRateLimitStore {
  return new PostgresRateLimitStore(getDb());
}

export function attachmentsEnabled(): boolean {
  return serverEnv.attachments().configured;
}

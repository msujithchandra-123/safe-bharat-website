-- CreateEnum
CREATE TYPE "EnquiryType" AS ENUM ('CONTACT', 'QUOTE', 'AMC', 'EQUIPMENT', 'CALLBACK');

-- CreateEnum
CREATE TYPE "EnquirySource" AS ENUM ('WEBSITE_FORM', 'CHATBOT');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'CLOSED', 'SPAM');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'NOT_CONFIGURED');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('PHONE', 'EMAIL', 'WHATSAPP');

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" UUID NOT NULL,
    "referenceNumber" VARCHAR(20) NOT NULL,
    "idempotencyKey" VARCHAR(64) NOT NULL,
    "enquiryType" "EnquiryType" NOT NULL,
    "source" "EnquirySource" NOT NULL DEFAULT 'WEBSITE_FORM',
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "fullName" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "companyName" VARCHAR(160),
    "jobRole" VARCHAR(120),
    "siteLocation" VARCHAR(200),
    "serviceRequired" VARCHAR(120),
    "message" TEXT NOT NULL,
    "approximateScope" VARCHAR(500),
    "systemType" VARCHAR(120),
    "equipmentQuantity" VARCHAR(120),
    "currentMaintenance" VARCHAR(500),
    "preferredContactMethod" "ContactMethod",
    "productSlug" VARCHAR(120),
    "consentGiven" BOOLEAN NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "privacyNoticeVersion" VARCHAR(20) NOT NULL,
    "emailStatus" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "emailAttempts" INTEGER NOT NULL DEFAULT 0,
    "emailLastError" VARCHAR(500),
    "emailLastAttemptAt" TIMESTAMP(3),
    "emailSentAt" TIMESTAMP(3),
    "acknowledgementSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnquiryAttachment" (
    "id" UUID NOT NULL,
    "enquiryId" UUID NOT NULL,
    "storageKey" VARCHAR(300) NOT NULL,
    "originalName" VARCHAR(200) NOT NULL,
    "contentType" VARCHAR(100) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnquiryAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "key" VARCHAR(200) NOT NULL,
    "count" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_referenceNumber_key" ON "Enquiry"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_idempotencyKey_key" ON "Enquiry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Enquiry_createdAt_idx" ON "Enquiry"("createdAt");

-- CreateIndex
CREATE INDEX "Enquiry_enquiryType_createdAt_idx" ON "Enquiry"("enquiryType", "createdAt");

-- CreateIndex
CREATE INDEX "Enquiry_status_createdAt_idx" ON "Enquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Enquiry_emailStatus_emailAttempts_idx" ON "Enquiry"("emailStatus", "emailAttempts");

-- CreateIndex
CREATE INDEX "Enquiry_email_idx" ON "Enquiry"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EnquiryAttachment_storageKey_key" ON "EnquiryAttachment"("storageKey");

-- CreateIndex
CREATE INDEX "EnquiryAttachment_enquiryId_idx" ON "EnquiryAttachment"("enquiryId");

-- CreateIndex
CREATE INDEX "RateLimitBucket_expiresAt_idx" ON "RateLimitBucket"("expiresAt");

-- AddForeignKey
ALTER TABLE "EnquiryAttachment" ADD CONSTRAINT "EnquiryAttachment_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

"use client";

import { useEffect, useRef } from "react";
import { CircleCheckBig, TriangleAlert } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/primitives";

export function FormSuccess({ referenceNumber, onReset, resetLabel = "Submit another enquiry" }: { referenceNumber: string; onReset?: () => void; resetLabel?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div ref={ref} tabIndex={-1} role="status" className="rounded-xl border border-success/30 bg-success-50 p-6 outline-none sm:p-8">
      <div className="flex items-start gap-4">
        <CircleCheckBig className="mt-0.5 size-7 shrink-0 text-success" aria-hidden="true" />
        <div>
          <h2 className="text-xl font-extrabold">Thank you. Your enquiry has been received.</h2>
          <p className="mt-2 leading-relaxed text-body">
            Your reference number is{" "}
            <strong className="rounded bg-white px-1.5 py-0.5 font-mono text-base tracking-wide text-navy-900">{referenceNumber}</strong>. Please
            quote it if you contact us about this enquiry.
          </p>
          <p className="mt-2 leading-relaxed text-body">
            Our team will review your requirement and contact you. For anything urgent, call{" "}
            <a className="font-semibold text-navy-900 underline" href={`tel:${siteConfig.contact.phones[0].tel}`}>
              {siteConfig.contact.phones[0].display}
            </a>
            .
          </p>
          {onReset ? (
            <Button variant="outline" size="sm" className="mt-5" onClick={onReset}>
              {resetLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-lg border border-brand-red/30 bg-brand-red-50 p-4 text-sm">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-brand-red" aria-hidden="true" />
      <div className="leading-relaxed text-ink">
        <p className="font-semibold">{message}</p>
        <p className="mt-1 text-body">
          You can also call{" "}
          <a className="font-semibold underline" href={`tel:${siteConfig.contact.phones[0].tel}`}>
            {siteConfig.contact.phones[0].display}
          </a>{" "}
          or email{" "}
          <a className="font-semibold break-all underline" href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}

/** Success or error message for a submission. */
export function FormStatus({ outcome, onReset }: { outcome: { status: "success"; referenceNumber: string } | { status: "error"; message: string } | null; onReset?: () => void }) {
  if (!outcome) return null;
  return outcome.status === "success" ? <FormSuccess referenceNumber={outcome.referenceNumber} onReset={onReset} /> : <FormError message={outcome.message} />;
}

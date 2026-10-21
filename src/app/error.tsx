"use client";

import { useEffect } from "react";
import { siteConfig } from "@/config/site";
import { Button, ButtonLink, Container } from "@/components/ui/primitives";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // Only the digest is logged; the server keeps the detailed error.
    console.error("page_error", error.digest ?? "no-digest");
  }, [error]);

  return (
    <section className="py-20 sm:py-28">
      <Container className="max-w-2xl text-center">
        <p className="font-heading text-sm font-extrabold tracking-[0.2em] text-brand-red uppercase">Something went wrong</p>
        <h1 className="mt-4 text-4xl font-extrabold">This page could not be loaded</h1>
        <p className="mt-5 text-lg leading-relaxed text-body">
          Please try again. If the problem continues, call {siteConfig.contact.phones[0].display} or email {siteConfig.contact.email}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={() => retry()}>Try again</Button>
          <ButtonLink href="/" variant="outline">
            Back to home
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

"use client";

import Script from "next/script";
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";

/**
 * Cloudflare Turnstile widget (explicit rendering). The token is verified on
 * the server; this component only obtains it.
 */
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export interface TurnstileHandle {
  reset: () => void;
}

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function Turnstile({
  onToken,
  ref,
  size = "flexible",
}: {
  onToken: (token: string | null) => void;
  ref?: Ref<TurnstileHandle>;
  size?: "normal" | "compact" | "flexible";
}) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(() => typeof window !== "undefined" && Boolean(window.turnstile));
  const [failed, setFailed] = useState(false);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const render = useCallback(() => {
    if (!container.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: TURNSTILE_SITE_KEY,
      size,
      theme: "light",
      callback: (token: string) => {
        setFailed(false);
        onTokenRef.current(token);
      },
      "expired-callback": () => onTokenRef.current(null),
      "error-callback": () => {
        setFailed(true);
        onTokenRef.current(null);
      },
    });
  }, [size]);

  useEffect(() => {
    if (scriptReady) render();
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [scriptReady, render]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      onTokenRef.current(null);
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  if (!TURNSTILE_SITE_KEY) return null;
  return (
    <div>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setScriptReady(true)} />
      <div ref={container} className="min-h-[65px]" />
      {failed ? <p className="mt-1 text-sm text-brand-red-dark">The security check could not load. Please refresh the page and try again.</p> : null}
    </div>
  );
}

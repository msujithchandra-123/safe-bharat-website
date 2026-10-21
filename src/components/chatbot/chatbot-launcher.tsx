"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { MessagesSquare } from "lucide-react";

// The panel (and its form logic) loads only when a visitor opens the assistant.
const ChatbotPanel = dynamic(() => import("@/components/chatbot/chatbot-panel").then((m) => m.ChatbotPanel), { ssr: false });

/** Floating launcher. It never opens on its own. */
export function ChatbotLauncher() {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      {!open ? (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => {
            setOpen(true);
            setEverOpened(true);
          }}
          aria-haspopup="dialog"
          className="fixed right-4 bottom-[4.75rem] z-30 inline-flex size-14 items-center justify-center gap-2 rounded-full bg-navy-900 text-white shadow-raised ring-2 ring-white transition-transform hover:scale-[1.03] md:right-6 md:bottom-6 md:w-auto md:pr-5 md:pl-4"
        >
          <MessagesSquare className="size-6" aria-hidden="true" />
          <span className="sr-only md:not-sr-only md:text-sm md:font-semibold">Ask Safe Bharat</span>
          <span className="sr-only"> Assistant (AI chat)</span>
        </button>
      ) : null}
      {everOpened ? (
        <ChatbotPanel
          open={open}
          onClose={() => {
            setOpen(false);
            requestAnimationFrame(() => launcherRef.current?.focus());
          }}
        />
      ) : null}
    </>
  );
}

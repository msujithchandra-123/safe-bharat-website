"use client";

/** Last-resort boundary for errors in the root layout. Renders its own document with inline styles. */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ margin: 0, fontFamily: "Arial, Helvetica, sans-serif", background: "#ffffff", color: "#101828" }}>
        <title>Something went wrong | Safe Bharat</title>
        <main style={{ maxWidth: 560, margin: "15vh auto", padding: "0 16px", textAlign: "center" }}>
          <p style={{ color: "#D71920", fontWeight: 700, letterSpacing: 2, fontSize: 13, textTransform: "uppercase" }}>Safe Bharat</p>
          <h1 style={{ color: "#071B3B", fontSize: 32 }}>Something went wrong</h1>
          <p style={{ color: "#475467", lineHeight: 1.6 }}>
            Please try again. You can also call +91 85220 21566 or email safebharatsales@gmail.com. In a fire emergency, call 112.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{ marginTop: 16, background: "#D71920", color: "#fff", border: 0, borderRadius: 6, padding: "12px 20px", fontWeight: 700, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

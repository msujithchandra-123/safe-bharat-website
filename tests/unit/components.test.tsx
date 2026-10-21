import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm, QuoteForm } from "@/components/forms/enquiry-forms";
import { ChatInput } from "@/components/chatbot/chat-parts";
import { ChatbotPanel } from "@/components/chatbot/chatbot-panel";
import { FAQAccordion } from "@/components/sections/sections";
import { MobileNavigation } from "@/components/navigation/mobile-navigation";

type Handler = (url: string, init?: RequestInit) => { status: number; body: unknown };

function mockFetch(handler: Handler) {
  const calls: { url: string; init?: RequestInit }[] = [];
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    const { status, body } = handler(url, init);
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  });
  return calls;
}

async function fillContact(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Full name/), "Ravi Kumar");
  await user.type(screen.getByLabelText(/Business email/), "ravi@example.com");
  await user.type(screen.getByLabelText(/Phone number/), "+91 98765 43210");
  await user.type(screen.getByLabelText(/^Message/), "Please call me about extinguisher servicing.");
  await user.click(screen.getByLabelText(/I agree that Safe Bharat/));
}

describe("ContactForm", () => {
  it("shows validation errors and does not submit when empty", async () => {
    const calls = mockFetch(() => ({ status: 201, body: {} }));
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByText("Full name is required.")).toBeInTheDocument();
    expect(screen.getByText("Please confirm you have read the privacy notice.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Full name/)).toHaveAttribute("aria-invalid", "true");
    expect(calls).toHaveLength(0);
  });

  it("submits to the enquiry API and shows the real reference number", async () => {
    const calls = mockFetch(() => ({ status: 201, body: { ok: true, data: { referenceNumber: "SB-261015-ABCDE", duplicate: false } } }));
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillContact(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByText("SB-261015-ABCDE")).toBeInTheDocument();
    expect(calls[0]!.url).toBe("/api/v1/enquiries");
    const sent = JSON.parse(String(calls[0]!.init!.body));
    expect(sent).toMatchObject({ enquiryType: "CONTACT", fullName: "Ravi Kumar", consent: true, source: "WEBSITE_FORM" });
    expect(sent.idempotencyKey).toMatch(/^[A-Za-z0-9]{16,}$/);
  });

  it("does not show success when the server rejects the submission", async () => {
    mockFetch(() => ({ status: 422, body: { ok: false, error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: { email: "Enter a valid email address." } } } }));
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillContact(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Please correct the highlighted fields.");
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.queryByText(/has been received/)).not.toBeInTheDocument();
  });

  it("keeps the same idempotency key when retrying after a network error", async () => {
    let attempt = 0;
    const keys: string[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (_i, init) => {
      keys.push(JSON.parse(String(init!.body)).idempotencyKey);
      attempt++;
      if (attempt === 1) throw new TypeError("network down");
      return new Response(JSON.stringify({ ok: true, data: { referenceNumber: "SB-261015-XYZAB", duplicate: true } }), { status: 200 });
    });
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillContact(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not reach the server/);
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByText("SB-261015-XYZAB")).toBeInTheDocument();
    expect(keys[0]).toBe(keys[1]);
  });
});

describe("QuoteForm", () => {
  it("hides the attachment field when storage is not configured", () => {
    render(<QuoteForm attachmentsEnabled={false} />);
    expect(screen.queryByText(/Choose a file/)).not.toBeInTheDocument();
  });
  it("pre-selects a service when provided", () => {
    render(<QuoteForm attachmentsEnabled={false} defaultService="fire-alarm-systems" />);
    expect(screen.getByLabelText(/Service required/)).toHaveValue("fire-alarm-systems");
  });
  it("pre-selects a valid ?service= value from the URL and ignores unknown ones", async () => {
    window.history.pushState({}, "", "/request-a-quote?service=amc-maintenance");
    const { unmount } = render(<QuoteForm attachmentsEnabled={false} />);
    await waitFor(() => expect(screen.getByLabelText(/Service required/)).toHaveValue("amc-maintenance"));
    unmount();
    window.history.pushState({}, "", "/request-a-quote?service=<script>");
    render(<QuoteForm attachmentsEnabled={false} />);
    expect(screen.getByLabelText(/Service required/)).toHaveValue("");
    window.history.pushState({}, "", "/");
  });
});

describe("ChatInput", () => {
  it("sends on Enter and inserts a newline on Shift+Enter", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSend={onSend} disabled={false} />);
    const box = screen.getByLabelText("Message Safe Bharat Assistant");
    await user.type(box, "Line one");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(box, "Line two");
    expect(onSend).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    expect(onSend).toHaveBeenCalledWith("Line one\nLine two");
  });
});

describe("ChatbotPanel", () => {
  it("shows an honest offline state with working contact and quote routes", async () => {
    mockFetch((url) => (url.includes("status") ? { status: 200, body: { ok: true, data: { available: false } } } : { status: 500, body: {} }));
    const user = userEvent.setup();
    render(<ChatbotPanel open onClose={() => {}} />);
    expect(await screen.findByText(/assistant is offline/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Message Safe Bharat Assistant")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Contact the team" }));
    expect(screen.getByText("Talk to the Safe Bharat team")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /\+91 85220 21566/ }).length).toBeGreaterThan(0);
  });

  it("identifies itself as an AI assistant and shows a privacy notice", async () => {
    mockFetch(() => ({ status: 200, body: { ok: true, data: { available: true } } }));
    render(<ChatbotPanel open onClose={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: "Safe Bharat Assistant" });
    expect(within(dialog).getAllByText(/AI assistant/).length).toBeGreaterThan(0);
    expect(within(dialog).getByText(/Conversations are not stored/)).toBeInTheDocument();
    expect(within(dialog).getByText(/Welcome to Safe Bharat!/)).toBeInTheDocument();
  });

  it("renders emergency guidance with a call link", async () => {
    mockFetch((url) =>
      url.includes("status")
        ? { status: 200, body: { ok: true, data: { available: true } } }
        : { status: 200, body: { ok: true, data: { kind: "emergency", reply: "Call the emergency services on 112 immediately.", action: "show_contact_options", service: null, links: [] } } },
    );
    const user = userEvent.setup();
    render(<ChatbotPanel open onClose={() => {}} />);
    await waitFor(() => expect(screen.getByLabelText("Message Safe Bharat Assistant")).toBeEnabled());
    await user.type(screen.getByLabelText("Message Safe Bharat Assistant"), "There is a fire{Enter}");
    expect(await screen.findByText("Emergency guidance")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Call 112" })).toHaveAttribute("href", "tel:112");
  });

  it("submits a chatbot quote through the shared enquiry API and shows the returned reference", async () => {
    const calls = mockFetch((url) =>
      url.includes("status")
        ? { status: 200, body: { ok: true, data: { available: false } } }
        : { status: 201, body: { ok: true, data: { referenceNumber: "SB-261015-CHAT1", duplicate: false } } },
    );
    const user = userEvent.setup();
    render(<ChatbotPanel open onClose={() => {}} />);
    await user.click(await screen.findByRole("button", { name: "Request a quotation" }));
    const form = screen.getByRole("group", { name: "Quotation request" });
    await user.type(within(form).getByLabelText(/Full name/), "Asha Rao");
    await user.type(within(form).getByLabelText(/^Email/), "asha@example.com");
    await user.type(within(form).getByLabelText(/^Phone/), "+91 91234 56789");
    await user.type(within(form).getByLabelText(/^Company/), "Rao Pharma");
    await user.type(within(form).getByLabelText(/Site location/), "Parawada");
    await user.selectOptions(within(form).getByLabelText(/^Service/), "fire-alarm-systems");
    await user.type(within(form).getByLabelText(/Requirement details/), "Alarm system for a new block.");
    await user.click(within(form).getByRole("button", { name: "Review details" }));
    // Consent is required before anything is sent.
    await user.click(within(form).getByRole("button", { name: "Submit request" }));
    expect(within(form).getByRole("alert")).toHaveTextContent(/privacy notice/);
    expect(calls.filter((c) => c.url === "/api/v1/enquiries")).toHaveLength(0);
    await user.click(within(form).getByRole("checkbox"));
    await user.click(within(form).getByRole("button", { name: "Submit request" }));
    expect(await screen.findByText(/SB-261015-CHAT1/)).toBeInTheDocument();
    const post = calls.find((c) => c.url === "/api/v1/enquiries")!;
    expect(JSON.parse(String(post.init!.body))).toMatchObject({ enquiryType: "QUOTE", source: "CHATBOT", serviceRequired: "fire-alarm-systems", consent: true });
  });

  it("does not claim success when the chatbot submission fails", async () => {
    mockFetch((url) =>
      url.includes("status")
        ? { status: 200, body: { ok: true, data: { available: false } } }
        : { status: 503, body: { ok: false, error: { code: "SERVICE_UNAVAILABLE", message: "This service is temporarily unavailable." } } },
    );
    const user = userEvent.setup();
    render(<ChatbotPanel open onClose={() => {}} />);
    await user.click(await screen.findByRole("button", { name: "Contact the team" }));
    await user.click(screen.getByRole("button", { name: "Request a callback" }));
    const form = screen.getByRole("group", { name: "Callback request" });
    await user.type(within(form).getByLabelText(/Full name/), "Asha Rao");
    await user.type(within(form).getByLabelText(/^Email/), "asha@example.com");
    await user.type(within(form).getByLabelText(/^Phone/), "+91 91234 56789");
    await user.type(within(form).getByLabelText(/What would you like to discuss/), "AMC renewal");
    await user.click(within(form).getByRole("button", { name: "Review details" }));
    await user.click(within(form).getByRole("checkbox"));
    await user.click(within(form).getByRole("button", { name: "Submit request" }));
    expect(await within(form).findByRole("alert")).toHaveTextContent("temporarily unavailable");
    expect(screen.queryByText(/has been submitted/)).not.toBeInTheDocument();
  });
});

describe("MobileNavigation", () => {
  it("opens as a dialog, traps focus inside and closes with Escape", async () => {
    const user = userEvent.setup();
    render(<MobileNavigation />);
    const trigger = screen.getByRole("button", { name: "Open menu" });
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Site menu" });
    expect(within(dialog).getByRole("link", { name: "Industries" })).toHaveAttribute("href", "/industries");
    await user.click(within(dialog).getByRole("button", { name: "Services" }));
    expect(within(dialog).getByRole("link", { name: "AMC & Maintenance" })).toHaveAttribute("href", "/services/amc-maintenance");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("FAQAccordion", () => {
  it("renders questions as native disclosure widgets", () => {
    const { container } = render(<FAQAccordion faqs={[{ question: "Q1?", answer: "A1" }]} />);
    expect(container.querySelector("details summary")).toHaveTextContent("Q1?");
  });
});

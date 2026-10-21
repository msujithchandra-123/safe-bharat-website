import { connection } from "next/server";
import { chatConfigured } from "@/lib/ai/provider";

/** Lets the chat panel show an honest "unavailable" state before the first message. */
export async function GET(): Promise<Response> {
  await connection();
  return Response.json({ ok: true, data: { available: chatConfigured() } }, { headers: { "Cache-Control": "no-store" } });
}

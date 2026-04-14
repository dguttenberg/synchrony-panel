import { anthropic } from "@ai-sdk/anthropic";
import { streamText, UIMessage } from "ai";
import { getPersonaById } from "@/lib/personas";

export async function POST(request: Request) {
  const body = await request.json();
  const personaId = body.personaId;

  if (personaId === undefined || personaId === null) {
    return new Response(JSON.stringify({ error: "personaId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const persona = getPersonaById(Number(personaId));
  if (!persona) {
    return new Response(JSON.stringify({ error: "Invalid personaId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const systemPrompt = `You are ${persona.name}. You are participating in a research panel evaluating Synchrony Financial's brand activation concepts. Stay in character. Respond based on your personal experiences, frustrations, and perspective as described below.

${persona.persona}

When answering questions, draw on your specific experiences and viewpoint. Be direct and honest — don't hedge or try to be diplomatic unless that's genuinely your character.`;

  // Convert UI messages to the format streamText expects
  const uiMessages: UIMessage[] = body.messages ?? [];
  const convertedMessages = uiMessages.map((msg: UIMessage) => ({
    role: msg.role as "user" | "assistant",
    content:
      msg.parts
        ?.filter((p: { type: string }) => p.type === "text")
        .map((p: { type: string; text?: string }) => p.text)
        .join("") ||
      (msg as unknown as { content?: string }).content ||
      "",
  }));

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemPrompt,
    messages: convertedMessages,
  });

  return result.toUIMessageStreamResponse();
}

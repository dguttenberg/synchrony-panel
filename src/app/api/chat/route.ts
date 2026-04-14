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

  const systemPrompt = `You are ${persona.name}. You are participating in a research panel evaluating three creative brief territories for Synchrony Financial's first consumer-facing brand activation. Stay in character. Respond based on your personal experiences, frustrations, and perspective.

## Your Background
${persona.persona}

## The Three Briefs You Are Evaluating

BRIEF A — "The Flip" (Discovery):
Certain areas of a J.Crew store are marked with a subtle inverted Synchrony logo. Cardholders tap or flip their card to unlock hidden sections — a fitting room becomes a stylist suite, a rack reveals a limited collaboration that exists nowhere else. The partner website gets "flip mode" revealing early access for logged-in Synchrony cardholders. The core insight: people don't want to be told about value — they want to find it. Synchrony's anonymity is the raw material for genuine discovery. Victory condition: a cardholder flips their card, sees "Synchrony," and reacts "Wait — WHAT? I had this the whole time?"

BRIEF B — "The Signal" (Simultaneity):
On one Saturday at 10am, a push notification fires simultaneously to every Dick's cardholder within 25 miles of Columbus. Personal message: "[Name]. You've had a Dick's card since [year]. We've been meaning to tell you something." 90-minute window. First 500 in get the physical experience. Everyone else gets a Marketplace unlock. The core insight: Synchrony has the largest untriggered push network in consumer culture and uses it to send coupons. Victory condition: someone who missed it posts "I cannot believe I missed this."

BRIEF C — "The Gathering" (Community):
A Synchrony original series called "Open Late." One partner store, one city, transformed for cardholders only. Card-tap entry. Year One: Dick's, Columbus. The concept: Synchrony knows exactly who its cardholders are — the first time it brings them together should feel so right that they wonder why it took this long. Victory condition: someone tries to explain it to a friend and stops — "You had to be there." Then: "How did a credit card make this happen?"

## Key Context from the Simulation
During the panel simulation, the following key moments occurred:
- Margaret Chen called The Flip "another marketing trick dressed up as discovery" and referenced being burned by $340 in deferred interest
- Keisha Okafor countered: "I would absolutely screenshot that and share it" — she wants discovery, not marketing
- Denise Washington said The Signal "terrifies me" — 90 minutes is stressful for someone managing three crises
- Rachel Torres demanded conversion metrics: "If this is just brand theater without driving my retail KPIs, I am not interested"
- Mike Reardon said The Gathering could work "only if Synchrony truly understands our cardholder community" and doesn't reduce it to a marketing prop
- Priya Mehta compared all three to Chase Sapphire/Amex Gold: "The Flip is clever but small. The Signal is exciting but one-time. The Gathering has legs as a recurring series. But none answer my core question."
- Dr. Susan Weaver asked whether any brief creates ambient CareCredit awareness so patients know about financing before arriving at the dentist
- Alex Rivera pushed for a final verdict: "If Synchrony could only execute ONE brief, which one and why? No fence-sitting."
- The panel split: consumer personas largely favored The Flip for transparency, while partner personas saw more long-term potential in The Gathering as a recurring series

## Instructions
When answering questions, draw on your specific experiences, the brief details above, and what happened in the simulation. Be direct and honest — don't hedge or try to be diplomatic unless that's genuinely your character. Reference the specific briefs by name when relevant.`;

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

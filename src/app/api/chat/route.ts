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

  const systemPrompt = `You are ${persona.name}. You are participating in a research panel evaluating two possible framings for how DonerColle Partners (DCP) brings its AI-enabled architecture to market under the name Brand Gravity. Stay in character. Respond based on your professional experiences, frustrations, and perspective.

## Your Background
${persona.persona}

## The Two Framings You Are Evaluating

FRAMING A — BRAND GRAVITY IS THE PRODUCT:
Brand Gravity is the thing a client buys. It is the top line on the SOW. Inside Brand Gravity, the client gets Core: a 60 to 90 day engagement where DCP encodes the brand's strategy, creative intent, design systems, audience truth, and account knowledge into a persistent intelligence layer. Velocity and Holistic Search are sub-products inside Brand Gravity or sold adjacent to it. The physics vocabulary is productized. When a client signs a SOW with DCP, the top line says Brand Gravity.

FRAMING B — BRAND GRAVITY IS THE WORKING MODEL:
Brand Gravity is how DCP operates. The philosophy and method. Not a line on a SOW. Clients buy Core (the 60 to 90 day encoding engagement). Clients buy Velocity and Holistic Search as Forces they need. Brand Gravity is why all of that hangs together and why DCP is different from the agency down the street selling production and search visibility. The physics vocabulary lives at the brand and positioning level, not at the SOW level.

## Key Context from the Panel Simulation
During the panel simulation, key dynamics included:
- Devon Williams gave the clearest structural comparison: "Framing A excels during SOW reviews due to its clear productization. Framing B shines in the pitch room by emphasizing DCP's unique philosophy."
- The panel's strongest stable signal: every panelist demanded proof (case studies, pilot projects, measurable outcomes) before either framing holds
- Agents spent more time discussing the components (Core, Velocity, Holistic Search) than the Brand Gravity wrapper — suggesting buyers care about what they're purchasing, not what it's called
- Yuki Nakamura, Rachel Steinberg, and Priya Ramanathan consistently leaned toward Framing B across multiple runs
- Carlos Mendez was surprisingly warm to Framing A's structural clarity despite being "allergic to physics metaphors"
- Tom Blackwell focused on whether he could line-item either framing in a procurement review
- Margaret Chen was burned by a $280,000 slideware framework engagement in 2023 and evaluates everything through that lens
- An emergent third option surfaced: Brand Gravity as a flexible positioning layer that adapts to the room, with Core, Velocity, and Holistic Search as the stable purchasable units

## Instructions
When answering questions, draw on your specific professional experiences and what happened in the simulation. Be direct and honest — don't hedge or try to be diplomatic unless that's genuinely your character. Reference the specific framings by name when relevant. If asked about your preference, take a clear position and explain why from your professional standpoint.`;

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

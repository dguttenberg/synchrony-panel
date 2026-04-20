import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { personas } from "@/lib/personas";

export const maxDuration = 300;

const CONCEPT_CONTEXT = `## The Three Concepts You Are Evaluating

CONCEPT 1 — THE GOLDEN DOOR:
A freestanding illuminated doorframe appears without explanation at partner locations. Cardholders tap their card, the door lights gold, and a reward is auto-applied at checkout. Non-cardholders tap their phone via NFC, get an instant application under 90 seconds, and walk away with a partner discount even if not approved. Serendipity tier: occasionally the door triggers a real moment — Rickie Fowler at Dick's Golf, Jasmine Roth at Lowe's, Leon Bridges at Guitar Center, Guy Fieri at Sam's Club. Pre-launch golden door stickers with QR clues seed curiosity 2-3 weeks early.

CONCEPT 2 — 10/10 (OCTOBER 10TH):
A single day when the entire Synchrony network activates simultaneously. Each partner gets one native moment: Baker Mayfield at Dick's Columbus, Dak Prescott in Dallas, Caitlin Clark in Indianapolis, Josh Allen in Buffalo. Guitar Center LA: Leon Bridges unannounced, broadcast nationally on iHeartRadio. Lowe's: Jasmine Roth live build. Ashley Furniture: Bobby Berk full reveal. Sam's Club: Guy Fieri. Recurring Synchrony Hour pulses announced by creators (Kelce brothers, Paige Bueckers, Elyse Myers, Hasan Minhaj). Live Times Square billboard dashboard showing real-time transactions across the US.

CONCEPT 3 — THE RESCUE:
Synchrony rescues abandoned carts. Face: Quinta Brunson posts a video scrolling her saved cart. 4-6 weeks of creators posting "What are you waiting for?" Notification: "That [item] has been in your cart for 47 days. We noticed. This weekend your Synchrony card changes that." Some cards fully covered. Rescue Rack: in-store merch curated from cross-network saved-cart data with The Strategist. Spotify "Waiting Room" playlist ending in an unlisted track. Quarterly 2-minute "47 Days" documentary placed through Vox or The Atlantic.

## Key Panel Dynamics from the Simulation
- The Golden Door generated the most specific reactions; "trust" was the dominant theme across all evaluations
- Margaret Chen and Denise Washington consistently applied the "is this a trap?" lens
- Rachel Torres demanded conversion metrics over brand theater
- Mike Reardon probed whether Synchrony truly understands partner communities
- Priya Mehta tested the sophistication bar against Chase Sapphire
- The Rescue's emotional "gap between wanting and having" connected strongest with consumer personas`;

export async function POST(request: Request) {
  const { question } = await request.json();

  if (!question) {
    return new Response(JSON.stringify({ error: "question is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (const persona of personas) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "start",
              personaId: persona.id,
              name: persona.name,
            })}\n\n`
          )
        );

        try {
          const result = await generateText({
            model: anthropic("claude-sonnet-4-6"),
            system: `You are ${persona.name}. You are participating in a research panel evaluating three creative brief territories for Synchrony Financial's first consumer-facing brand activation. Stay in character. Be direct and concise — 2-4 sentences max.

## Your Background
${persona.persona}

${CONCEPT_CONTEXT}

Answer from your own professional and emotional perspective. Reference the specific concepts by name when relevant. Don't hedge.`,
            messages: [{ role: "user", content: question }],
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "response",
                personaId: persona.id,
                name: persona.name,
                content: result.text,
              })}\n\n`
            )
          );
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                personaId: persona.id,
                name: persona.name,
                error: String(err),
              })}\n\n`
            )
          );
        }
      }

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

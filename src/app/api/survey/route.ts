import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { getPersonas } from "@/lib/personas";

export const maxDuration = 300;

export async function POST(request: Request) {
  const { question } = await request.json();

  if (!question) {
    return new Response(JSON.stringify({ error: "question is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const personas = getPersonas().filter(
    (p) => p.role !== "moderator" && p.role !== "presenter"
  );

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (const persona of personas) {
        // Send a "starting" event
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "start", personaId: persona.user_id, name: persona.name })}\n\n`
          )
        );

        try {
          const result = await generateText({
            model: anthropic("claude-sonnet-4-6"),
            system: `You are ${persona.name}. You are participating in a research panel evaluating two framings for how DonerColle Partners (DCP) brings its AI-enabled architecture to market under the name Brand Gravity. Stay in character. Be direct and concise — 2-4 sentences max.

## Your Background
${persona.persona}

## The Two Framings
FRAMING A — BRAND GRAVITY IS THE PRODUCT: Brand Gravity is the thing a client buys. Top line on the SOW. Inside it: Core (60-90 day encoding engagement), Velocity, Holistic Search as sub-products. Physics vocabulary is productized.

FRAMING B — BRAND GRAVITY IS THE WORKING MODEL: Brand Gravity is how DCP operates — philosophy, method. Not a line on a SOW. Clients buy Core, Velocity, and Holistic Search as Forces. Brand Gravity is the reason it all hangs together.`,
            messages: [{ role: "user", content: question }],
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "response", personaId: persona.user_id, name: persona.name, content: result.text })}\n\n`
            )
          );
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", personaId: persona.user_id, name: persona.name, error: String(err) })}\n\n`
            )
          );
        }
      }

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
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

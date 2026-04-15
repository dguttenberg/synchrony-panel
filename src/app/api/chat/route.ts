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

## The Three Concepts You Are Evaluating

CONCEPT 1 — THE GOLDEN DOOR:
A freestanding illuminated doorframe appears without explanation at partner locations. Two sides: Cardholder taps card, door lights gold, screen reads "You're already in. Here's what's waiting." Reward auto-applied at checkout. Non-cardholder taps phone via NFC, door lights amber, screen reads "The door's open. It always was." Instant application under 90 seconds. If not approved, still gets a partner discount — nobody walks away empty.

The serendipity tier: occasionally the door does something extraordinary. At Dick's Golf: Rickie Fowler is mid-swing in the simulator — a genuine 20-minute session, watches your swing, recommends clubs, Synchrony covers them. At Lowe's: Jasmine Roth (HGTV) gives a real design consultation based on your actual wishlist. At Guitar Center: Leon Bridges is mid-session in the back — no stage, no production, he hands someone an instrument and says "This one." Synchrony covers it. At Sam's Club: Guy Fieri cooks real food, Synchrony covers the cart, Guy signs the receipt.

Pre-launch: small golden door stickers appear 2-3 weeks early with QR clues. Twelve doors, twelve clues — complete the circuit for a guaranteed elevated unlock.

CONCEPT 2 — 10/10 (OCTOBER 10TH):
A single day when the entire Synchrony network activates simultaneously. "Are you synced for 10/10?" Each partner gets one moment native to that brand, that city, that day. Dick's Columbus: Baker Mayfield spends two hours in the store having real conversations. His underdog story maps onto the Synchrony consumer's own. Simultaneously: Dak Prescott in Dallas, Caitlin Clark in Indianapolis, Josh Allen in Buffalo. Guitar Center LA: Leon Bridges plays unannounced, iHeartRadio broadcasts live nationally. Lowe's: Jasmine Roth runs a live build, HGTV co-produces. Ashley Furniture: Bobby Berk stages a full living room reveal for a real family — "What Your Card Is Actually Worth." Sam's Club: Guy Fieri cooks.

Synchrony Hour pulse (recurring): push notification, 60-minute window, surprise unlock. Announced by rotating creators — Kelce brothers' New Heights for sports, Paige Bueckers for women's sports, Elyse Myers for everyday consumers, Hasan Minhaj for culturally broad.

Live dashboard: real-time US map on Times Square billboard showing yellow dots per transaction. The network sees itself for the first time.

CONCEPT 3 — THE RESCUE:
Synchrony rescues abandoned carts. Campaign face: Quinta Brunson — her Abbott Elementary premise (people doing meaningful work with limited resources deserve more) is the brand truth. She posts a video scrolling her saved cart: "You know you have one of these."

Pre-load "What are you waiting for?": 4-6 weeks before each Rescue Weekend, creators post their saved carts. The question is genuinely universal. By Friday, millions have named what they're waiting for.

The notification: "That [specific item] has been in your cart for 47 days. We noticed. This weekend, your Synchrony card changes that." For fully covered carts: "We noticed you've been waiting. We took care of it. It's already yours." Five words. No asterisks.

Rescue Rack: in-store section merchandised from cross-network saved-cart data, co-curated with The Strategist (New York Magazine). "These are the things people in [city] have been waiting for."

Spotify "Waiting Room" playlist: Leon Bridges, Hozier, Noah Kahan, Maggie Rogers. Unlisted track at the end: "Your Rescue Weekend starts Friday."

Quarterly rescue film: one real cardholder story filmed as a 2-minute documentary. Placed through Vox or The Atlantic. Working title: "47 Days."

## Key Context from the Simulation
During the panel simulation, key dynamics included:
- The Golden Door dominated discussion with the strongest concept recognition — the illuminated doorframe metaphor and serendipity tier generated the most specific reactions
- Trust was the dominant theme (97 mentions) — Margaret Chen and Denise Washington consistently evaluated every concept through their "is this a trap?" lens
- The talent choices (Rickie Fowler, Jasmine Roth, Leon Bridges, Guy Fieri, Quinta Brunson) were debated for authenticity — "populist, not exclusive" vs. buying credibility
- Community and authentic experience were highly valued (52 and 56 mentions respectively)
- Rachel Torres pushed hard on conversion metrics — "brand theater that benefits Synchrony without driving my KPIs is not interesting to me"
- Mike Reardon tested whether Synchrony truly understands partner communities or is borrowing them
- Priya Mehta applied the sophistication test — does any concept make store cards feel like they belong alongside Chase Sapphire?
- The Rescue's emotional resonance with the "gap between wanting and having" connected most strongly with consumer personas
- Alex Rivera championed the data infrastructure angle — cross-network cart intent data as the real value proposition

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

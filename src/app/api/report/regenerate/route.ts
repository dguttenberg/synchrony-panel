import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import actionsData from "@/data/actions.json";

// Long timeout — Claude analysis can take 60-90s
export const maxDuration = 300;

const MODERATOR_NAMES = new Set(["panelmoderator", "panel moderator"]);

interface RawAction {
  content?: string;
  action_args?: { content?: string };
  action_type?: string;
  agent_name?: string;
  round_num?: number;
  platform?: string;
}

interface ContentItem {
  agent: string;
  content: string;
  type: string;
  round: number;
  platform: string;
}

function canonicalizeAgent(name: string): string {
  let n = name.replace(/_/g, " ").trim();
  n = n.replace(/([a-z])([A-Z])/g, "$1 $2");
  if (n.startsWith("Dr ") && !n.startsWith("Dr.")) {
    n = "Dr." + n.slice(2);
  }
  return n;
}

function filterPanelistContent(actions: RawAction[]): ContentItem[] {
  const items: ContentItem[] = [];
  for (const a of actions) {
    const content = a.content || a.action_args?.content || "";
    const agent = a.agent_name || "?";
    const canon = agent.toLowerCase().replace(/_/g, "").replace(/ /g, "");
    const modKeys = new Set(
      [...MODERATOR_NAMES].map((n) => n.replace(/ /g, ""))
    );
    if (content && !modKeys.has(canon)) {
      items.push({
        agent: canonicalizeAgent(agent),
        content,
        type: a.action_type || "?",
        round: a.round_num ?? 0,
        platform: a.platform || "?",
      });
    }
  }

  // Dedup by first 120 chars
  const seen = new Set<string>();
  const deduped: ContentItem[] = [];
  for (const item of items) {
    const key = item.content.slice(0, 120);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }
  return deduped;
}

function buildQuotesPerPersona(
  deduped: ContentItem[],
  maxPerPersona = 10
): Record<string, ContentItem[]> {
  const byPersona: Record<string, ContentItem[]> = {};
  for (const item of deduped) {
    if (!byPersona[item.agent]) byPersona[item.agent] = [];
    byPersona[item.agent].push(item);
  }

  const selected: Record<string, ContentItem[]> = {};
  for (const persona of Object.keys(byPersona)) {
    const items = byPersona[persona].sort((a, b) => a.round - b.round);
    if (items.length <= maxPerPersona) {
      selected[persona] = items;
    } else {
      const step = items.length / maxPerPersona;
      selected[persona] = Array.from({ length: maxPerPersona }, (_, i) =>
        items[Math.floor(i * step)]
      );
    }
  }
  return selected;
}

function buildAnalysisPrompt(
  quotesPerPersona: Record<string, ContentItem[]>,
  totalCount: number
): string {
  const sections: string[] = [];
  for (const [persona, items] of Object.entries(quotesPerPersona).sort()) {
    const lines = [`### ${persona}`];
    for (const item of items) {
      lines.push(`\nR${item.round} (${item.platform}, ${item.type}):`);
      lines.push(`  ${item.content}`);
    }
    sections.push(lines.join("\n"));
  }
  const transcripts = sections.join("\n\n");

  return `You are a senior brand strategist analyzing a simulated audience research panel for Synchrony Financial. The panel evaluated three creative concepts for Synchrony's first consumer-facing brand activation: The Golden Door, 10•10, and The Rescue.

Your job is to produce an ACTIONABLE research brief that helps the creative team make decisions. Do NOT summarize. Do NOT hedge. Do NOT recap the concepts. Do NOT make it sound diplomatic. Take a position.

You must base every claim on actual quotes from the simulation. If a panelist did not engage with a concept, say so explicitly — do not invent reactions.

# THE PANEL

Nine panelists representing Synchrony's audience:

CONSUMERS:
- **Margaret Chen** — 58, Ohio. Burned by deferred interest. Skeptic. Tests every concept with "is this a trap?" If she trusts it, it works.
- **Denise Washington** — 62, Georgia. Single-income, near-prime credit. Reads every term. Healthcare cost anxiety.
- **Keisha Okafor** — 32, Brooklyn. BNPL-native. Doesn't know Synchrony exists. Shareability test ("would I post this?").
- **Priya Mehta** — 36, Austin. Compares everything to Chase Sapphire / Amex Gold. Sophistication test.

PARTNERS:
- **Rachel Torres** — SVP Marketing, apparel retailer. Conversion metrics or it doesn't matter.
- **Mike Reardon** — VP Partnerships, sporting goods. Community authenticity over conversion.
- **Jennifer Park** — VP Commercial, home improvement. Project-completion focused.
- **Alex Rivera** — CRO, digital commerce. Embedded checkout will kill store cards.
- **Dr. Susan Weaver** — Dental practice owner, CareCredit network. Needs ambient awareness before patient arrives.

# THE THREE CONCEPTS

**The Golden Door** — Illuminated doorframe at partner locations. Tap card = gold light + reward. Non-cardholder taps phone = amber light + 90-second application. Serendipity tier with celebrity moments (Rickie Fowler at Dick's, Jasmine Roth at Lowe's, Leon Bridges at Guitar Center, Guy Fieri at Sam's Club). Phased rollout from mini stickers to e-commerce widget.

**10•10** — October 10th, 10 hours, 10 partners. Each hour belongs to a different partner. Baker Mayfield at Dick's Columbus, Leon Bridges at Guitar Center LA on iHeartRadio, Jasmine Roth live build at Lowe's, Bobby Berk reveal at Ashley, Guy Fieri at Sam's. Times Square live dashboard. Recurring Sync Hour pulse format.

**The Rescue** — Theatrical IRL installations at Mall of America/Grove/Westchester dramatizing "lives interrupted" (couch waiting 47 days for Sundays). Quinta Brunson asks "what's in your cart that's been waiting?" Personalized rescue: "Your Sunday football experience is waiting." Cross-network bundle intelligence. Quarterly documentary "47 Days."

# ACTUAL PANEL TRANSCRIPTS (${totalCount} total contributions, moderator excluded)

${transcripts}

# YOUR DELIVERABLE

Write a brief (1500-2000 words) using EXACTLY this structure with these exact headings:

## TL;DR

Three sentences max. The bottom line for the creative team. What's the recommendation, what's the supporting evidence in one number, what's the risk to be aware of.

## What The Panel Actually Said

Quantitative summary: how many times each concept was discussed, who engaged with what, where the conversation concentrated. Use specific numbers from the data.

## Concept-Level Findings

For each concept (Golden Door, 10•10, The Rescue), in this order:

### [Concept Name]
**Discussion volume:** [number]
**Sentiment direction:** [positive/negative/mixed, with evidence]
**Who engaged:** [list panelists who had multiple contributions]
**Strongest signal:** [specific quote with attribution]
**Friction signal:** [specific concern raised, with attribution — if none, say "no critical pushback surfaced"]
**Verdict:** [your strategic read in one paragraph]

## The Cross-Persona Patterns

What did consumer panelists vs partner panelists notice differently? Where did skeptic personas (Margaret, Denise) react predictably and where did they break pattern? Did any persona's reaction surprise you given their stated frustrations?

## Critical Limitations Of This Data

Name the methodology problems honestly. Where might the panel be over-agreeing? Where did the moderator structure shape the conversation in ways that may not generalize? Which concept's data is THIN and shouldn't be over-read?

## Recommendation

Take a position. If the creative team can only execute one, which? Why? What needs to change about that concept based on what panelists actually said? What questions did this simulation NOT answer that need a follow-up round?

# RULES

- Every claim must be grounded in actual quotes from the transcripts above. If you cannot quote it, do not claim it.
- If a concept got minimal engagement (under 5 contributions), say so plainly — "10•10 generated essentially no organic discussion despite the moderator introducing it twice."
- Do not generate balanced both-sides analysis if the data is lopsided. If one concept dominated, say it dominated and explain what that means.
- Avoid corporate hedging language. Write like a research strategist briefing a creative director, not like a consultant managing client expectations.
- Do not invent panelist reactions. If Margaret Chen never mentioned 10•10, do not write "Margaret Chen would likely view 10•10 as..."

Begin the report now.`;
}

export async function POST() {
  const actions = (actionsData as { data?: { actions?: RawAction[] } }).data
    ?.actions ?? [];

  const deduped = filterPanelistContent(actions);
  const quotes = buildQuotesPerPersona(deduped, 10);
  const prompt = buildAnalysisPrompt(quotes, deduped.length);

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    messages: [{ role: "user", content: prompt }],
  });

  return result.toUIMessageStreamResponse();
}

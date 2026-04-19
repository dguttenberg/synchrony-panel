# Brand Gravity Panel Experiment — Summary for Context Transfer

## The Question

Should Brand Gravity be sold as a **product** (top line on the SOW) or held as DCP's **working model** (the philosophy behind what clients actually buy — Core, Velocity, Holistic Search)?

This simulation was designed to inform the conversation with John before DCP locks the architecture.

## What We Built

A synthetic panel evaluation using MiroFish-Offline — an agent-based simulation engine running locally with Docker + Neo4j + a qwen2.5:32b LLM on a RunPod H100.

**Nine named personas**, each with detailed professional backstories, specific emotional histories, and calibrated skepticism levels:

| Persona | Role | Skepticism |
|---|---|---|
| Margaret Chen | CMO, $400M DTC beauty brand — burned by $280K slideware in 2023 | 9/10 |
| Tom Blackwell | Head of Procurement, $2B healthcare — "show me the line item" | 10/10 |
| Yuki Nakamura | Industry analyst — publicly torches framework-as-positioning | 9/10 |
| Carlos Mendez | ECD, independent shop, 22 years — allergic to physics metaphors | 9/10 |
| Rachel Steinberg | CMO, 420-location restaurant chain — needs Monday morning usability | 7/10 |
| James Okafor | VP Brand, growth-stage hardware — theory-friendly but finance team needs line items | 5/10 |
| Priya Ramanathan | Account Director, Stagwell agency — has sold ten $1.4M integrated engagements | 6/10 |
| Danielle Foster | Head of Strategy, Stagwell agency — has renamed frameworks twice after client feedback | 6/10 |
| Devon Williams | Associate Strategist, DCP — the person who actually briefs creative teams | 4/10 |

Plus a **DCP Presenter** (introduces the framings) and a **Panel Moderator** (drives the structured evaluation).

## The Two Framings Tested

**Framing A — Brand Gravity is the product.**
Brand Gravity is the thing a client buys. Top line on the SOW. Inside it: Core (60-90 day encoding engagement), Velocity, Holistic Search as sub-products. Physics vocabulary is productized. Contract says "Brand Gravity."

**Framing B — Brand Gravity is the working model.**
Brand Gravity is how DCP operates — philosophy, method. Not a line on a SOW. Clients buy Core, Velocity, and Holistic Search as Forces. Brand Gravity is why it all hangs together and why DCP is different.

## The Experiment Structure

12 scripted moderator events across 60 active rounds:
- R0: Welcome and panel intro
- R2: DCP Presenter introduces first framing
- R6, R10: Targeted follow-ups to specific panelists
- R15: DCP Presenter introduces second framing
- R19, R23: Follow-ups + procurement pressure test
- R28: Cross-comparison (which framing wins which room?)
- R35: Forced tradeoff (pick one, no fence-sitting)
- R42: Attribute isolation (name vs structure)
- R48: Devil's advocate (what's the trap with each?)
- R55: Final verdicts

Between events, agents discuss freely on Reddit and Twitter. Reddit produced 98-100% on-topic discussion; Twitter was 5% on-topic noise.

## What We Ran

- **Run 1:** Full 72 rounds, both platforms, Framing A introduced first. Complete data.
- **Run 2:** Reddit stalled at round 28 (CAMEL-AI timeout bug). Partial data through Framing B intro and start of cross-comparison. Framing A first.
- **Run 3:** In progress. **Reversed framing order** — Framing B introduced first to control for primacy bias.

## Findings

### What Was Stable Across Both Runs

1. **The "prove it" demand is universal.** All 9 panelists, both runs, demanded case studies, pilot projects, and real-world evidence before either framing holds. This was the single most consistent signal. Whichever framing DCP picks, the pitch must include proof of performance.

2. **The components are what buyers engage with.** Agents spent more time discussing Core, Velocity, and Holistic Search — their pricing, billing structure, individual deliverables — than the Brand Gravity wrapper. In Run 2 especially, agents drilled into component-level pricing regardless of which framing was on the table.

3. **Yuki Nakamura, Rachel Steinberg, and Priya Ramanathan consistently leaned Framing B** across both runs. The analyst, the practical buyer, and the seller all found the working model framing more compelling for differentiation.

4. **The skeptics were softer than expected** in both runs. Margaret never invoked her $280K burn. Tom never said "I can't line-item this." Carlos never called it physics-metaphor theater. LLM agents tend toward agreeableness — the direction of preference is reliable but the intensity of objection is understated.

### What Run 1 Showed (Complete Data)

Devon Williams gave the clearest structural comparison:

> "Framing A excels during SOW reviews due to its clear productization of Brand Gravity with distinct components (Core: Strategy & Insight, Velocity, Holistic Search). This makes it easier for procurement teams like Margaret Chen's to justify budget allocations. Conversely, Framing B shines in the pitch room by emphasizing DCP's unique philosophy and holistic approach. However, translating this broader vision into actionable daily work requires additional effort."

The pattern: **Framing A wins the SOW room, Framing B wins the pitch room.** Neither wins all three rooms (pitch, SOW, Monday morning all-hands) without work.

### What Run 2 Added

Run 2 complicated the run 1 picture. Agents engaging with Framing A focused almost entirely on the components — not on the Brand Gravity product wrapper. They wanted pricing breakdowns for Core, Velocity, and Holistic Search individually. The "Brand Gravity as product" label didn't add perceived value beyond bundling.

Carlos Mendez and Danielle Foster, who leaned A in run 1, flipped to B in run 2. Margaret Chen moved from non-committal to leaning B. This suggests individual framing preferences are not stable — but the underlying demand (component clarity + proof) is.

### The Emergent Insight

The most decision-relevant finding is not which framing won. It is that **the panel naturally gravitated toward the components as the purchasable units**, regardless of the wrapper. This suggests a potential third option:

**Brand Gravity as a flexible positioning layer that adapts to the room. Core, Velocity, and Holistic Search are the stable, purchasable units.**
- In the SOW: the components are the line items
- In the pitch: Brand Gravity is the differentiation story
- In the all-hands: Brand Gravity is the operating philosophy
- The wrapper adapts; the components stay fixed

### What DCP Needs to Prove (Either Framing)

1. **If Framing A (product):** That Brand Gravity as a line item doesn't become slideware. Show a case study where Core produced a measurably better brief.
2. **If Framing B (working model):** That "philosophy" survives procurement. Show how to approve an invoice for Core/Velocity/Holistic Search without needing Brand Gravity to justify the spend.
3. **For either:** Real-world evidence. Not a framework document. A client engagement where the architecture produced a measurable outcome. The panel asked for this nine-for-nine.

### Key Quotes for Reference

**Tom Blackwell (Procurement):** "From a procurement standpoint, this framing could be effective if it clearly demonstrates value and ROI for the client over typical consultative services. 'Show me the numbers' on how Brand Gravity tangibly improves business outcomes."

**Yuki Nakamura (Industry Analyst):** "For a buyer perspective like Margaret's, Framing A provides clearer delineation of what is being offered with 'Brand Gravity' as the top line item on an SOW. It simplifies budget justification."

**Priya Ramanathan (Agency Seller):** "It's vital to demonstrate that Framing B is more than mere philosophy — it should involve unique intellectual property and tangible methods."

**Rachel Steinberg (Practical Buyer):** "Could we get more specific about the billings under Brand Gravity? Understanding the pricing of Core, Velocity, and Holistic Search individually would be key for procurement reviews."

**Carlos Mendez (Creative Skeptic):** "From a seller's perspective, it clearly defines the service offering and its components, which can be very beneficial for setting expectations with clients."

**Devon Williams (Internal User):** "Framing A seems more suited for the SOW review process due to its structured and delineated approach. On the other hand, Framing B's unique philosophical positioning shines in pitch rooms but needs to be anchored more firmly in practical applications."

## What's Next

- **Run 3** is in progress with reversed framing order (B first, then A) to control for primacy bias
- When you have a refined POV from the John conversation, bring it back and we can **re-question the panel** using the MiroFish interaction workbench (survey + individual persona chat)
- The full data will be built into an **interactive panel site** (Next.js on Vercel, same pattern as the Synchrony panel) with report, analytics, and live persona chat

## Technical Notes

- MiroFish-Offline at ~/MiroFish-Offline — 3 Docker containers
- RunPod H100 with qwen2.5:32b — GPU pegged at 100% util, 34% VRAM (Ollama sequential bottleneck)
- Reddit platform carried all signal (98-100% on-topic); Twitter was noise (5%)
- Run 2 hit the known CAMEL-AI timeout bug (Reddit stuck at R28)
- Ollama model unloading caused intermittent Cloudflare 524s — mitigated with keep_alive=-1
- Planned: migrate to vLLM for concurrent batching (4-6x speedup)
- HTML report at ~/Downloads/BrandGravity_Run1_Analysis.html
- Seed document at ~/Downloads/brand_gravity_seed.txt
- Experiment spec at ~/Downloads/mirofish_brand_gravity_experiment.md

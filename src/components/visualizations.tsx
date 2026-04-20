"use client";

import vizData from "@/data/viz-data.json";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
} from "recharts";

// DCP Brand Colors
const CONCEPT_COLORS = {
  golden_door: "#20FE8F", // Aurora Green
  ten_ten: "#76BEFF",     // Sky Blue
  rescue: "#FF8371",      // Sunset Ember
};

const CONCEPT_LABELS: Record<string, string> = {
  golden_door: "The Golden Door",
  ten_ten: "10/10",
  rescue: "The Rescue",
};

// Curated descriptive words (filter out generic/structural words)
const DESCRIPTIVE_WORDS = new Set([
  "transparency","hidden","genuine","trust","marketing","discovery","authentic",
  "sophisticated","stress","stressful","conversion","community","belonging",
  "exclusive","manipulative","exciting","clever","skeptical","practical",
  "affordable","premium","accessible","innovative","flexible","urgent",
  "compelling","meaningful","lasting","recurring","sustainable","ambient",
  "digital","physical","invisible","visible","corporate","personal",
  "benefits","value","engagement","connections","ecosystem","experience",
  "catches","fees","trick","trap","loyalty","empowering","attentive",
  "optimistic","authentic","building","foster","enhance","truly","genuinely",
  "kpis","metrics","retail","healthcare","financing","checkout",
  "serendipity","tier","clear","consumer","theater","gimmick","substance",
  "superficial","communication","real","crucial","promotional","appeal",
  "seamless","commerce","intrigued","explore","transform","trends",
  "expectations","better","changing","initiatives","excited","possibilities",
]);

function getTopDescriptors(wordMap: Record<string, number>, limit: number = 15) {
  return Object.entries(wordMap)
    .filter(([w]) => DESCRIPTIVE_WORDS.has(w))
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Slide-ready analysis insights
// ---------------------------------------------------------------------------
const CONCEPT_INSIGHTS: Record<string, string> = {
  golden_door:
    "Highest discussion volume and the most genuinely contested. The Golden Door drew the strongest organic engagement across the panel, with 80% positive sentiment and meaningful pushback alongside endorsement. Partner panelists gravitated to its phased rollout and data story. Keisha Okafor — the panel's shareability test — said she would post about this concept before knowing further details. The friction is real and useful: positive statements lean toward generic praise of structure rather than emotional response to the serendipity tier. The creative team should treat this as the strongest territory while pressure-testing whether the emotional core (golden light, celebrity moments) lands beyond the abstract.",
  ten_ten:
    "Strong consensus and broad network-effect engagement. 10•10 earned 84% positive sentiment across 78 mentions — the second-highest volume — and generated substantial reaction from the broader ecosystem (retailer accounts, trade media, competitor brands all commented). The hour-by-hour structure registered as a coherent appointment-programming concept. But look at the language: panelists repeatedly endorsed 10•10 with near-identical phrasing — 'transparent,' 'structured,' 'genuine value at each phase.' That repetition signals approval of the concept's logic more than visceral emotional pull. 10•10 is a concept the panel respects and an ecosystem that activated to it. Worth scoping further, but pressure-test for what would make a panelist say they'd attend.",
  rescue:
    "Narrower discussion, highest sentiment concentration. The Rescue earned the highest sentiment ratio (85% positive) across its 24 mentions, with engagement skewing toward partner panelists evaluating commercial mechanics — cross-network bundling, predictive intent data — rather than consumer panelists responding to the 'lives interrupted' emotional framing. Margaret Chen and Denise Washington, the panel's most emotionally grounded consumers, were quieter here than on the other two concepts. The concept was not rejected — those who engaged found it compelling — but the visual-theatrical core of the IRL installations (Mall of America, the couch waiting 47 days) may need stronger abstract-to-imaginative translation when discussed outside a deck. Worth a targeted follow-up test with the consumer personas specifically.",
};

// ---------------------------------------------------------------------------
// A. Sentiment Scorecard
// ---------------------------------------------------------------------------
function SentimentScorecard() {
  const concepts = ["golden_door", "ten_ten", "rescue"] as const;
  const sentiment = vizData.concept_sentiment as Record<
    string,
    { positive: number; negative: number; total_mentions: number; net_sentiment: number; sentiment_ratio: number }
  >;

  return (
    <div>
      <h3 className="font-semibold mb-3 text-lg" style={{ color: "#000531" }}>Sentiment Scorecard</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Panelist-only sentiment (moderator excluded) · 121 unique contributions across 72 simulated rounds
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {concepts.map((key) => {
          const s = sentiment[key];
          const color = CONCEPT_COLORS[key];
          const label = CONCEPT_LABELS[key];
          const pct = Math.round(s.sentiment_ratio * 100);
          const total = s.positive + s.negative;
          const posPct = total > 0 ? (s.positive / total) * 100 : 50;

          return (
            <div
              key={key}
              className="bg-white p-5 border"
              style={{ borderRadius: 12, borderColor: "rgba(0,5,49,0.08)" }}
            >
              {/* Concept name with colored bar */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 rounded-full" style={{ backgroundColor: color }} />
                <span className="font-semibold text-sm" style={{ color: "#000531" }}>{label}</span>
              </div>

              {/* Sentiment ratio */}
              <div className="text-2xl font-bold mb-1" style={{ color: "#000531" }}>
                {pct}%{" "}
                <span className="text-sm font-medium text-muted-foreground">positive</span>
              </div>

              {/* Positive / Negative counts */}
              <div className="flex items-center gap-3 text-xs mb-3">
                <span style={{ color: "#20FE8F" }} className="font-semibold">
                  {s.positive} positive
                </span>
                <span style={{ color: "#FF8371" }} className="font-semibold">
                  {s.negative} negative
                </span>
              </div>

              {/* Horizontal bar */}
              <div className="w-full h-2 rounded-full overflow-hidden flex" style={{ backgroundColor: "#E6E7E8" }}>
                {total > 0 ? (
                  <>
                    <div
                      className="h-full"
                      style={{ width: `${posPct}%`, backgroundColor: "#20FE8F" }}
                    />
                    <div
                      className="h-full"
                      style={{ width: `${100 - posPct}%`, backgroundColor: "#FF8371" }}
                    />
                  </>
                ) : (
                  <div className="h-full w-full" style={{ backgroundColor: "#E6E7E8" }} />
                )}
              </div>

              {/* Footer stats */}
              <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                <span>{s.total_mentions} mentions</span>
                <span>Net: {s.net_sentiment > 0 ? "+" : ""}{s.net_sentiment}</span>
              </div>

              {/* Slide-ready insight */}
              <div
                className="mt-4 pt-4 border-t text-xs leading-relaxed"
                style={{ borderColor: "rgba(0,5,49,0.08)", color: "#000531" }}
              >
                {CONCEPT_INSIGHTS[key]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// B. Concept Discussion Volume
// ---------------------------------------------------------------------------
function ConceptMentionsChart() {
  const mentions = vizData.concept_mentions as Record<string, number>;
  const data = [
    { name: "The Golden Door", count: mentions.golden_door, fill: CONCEPT_COLORS.golden_door },
    { name: "10/10", count: mentions.ten_ten, fill: CONCEPT_COLORS.ten_ten },
    { name: "The Rescue", count: mentions.rescue, fill: CONCEPT_COLORS.rescue },
  ];

  return (
    <div>
      <h3 className="font-semibold mb-3 text-lg" style={{ color: "#000531" }}>Concept Discussion Volume</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Number of posts/comments mentioning each concept (out of {vizData.deduped_count} total)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fill: "#000531", fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#000531", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,5,49,0.1)" }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// C. Descriptor Word Clouds
// ---------------------------------------------------------------------------
function WordCloudChart({ concept }: { concept: "golden_door" | "ten_ten" | "rescue" }) {
  const wordMap =
    concept === "golden_door"
      ? vizData.golden_door_words
      : concept === "ten_ten"
        ? vizData.ten_ten_words
        : vizData.rescue_words;

  const words = getTopDescriptors(wordMap as Record<string, number>, 12);
  const maxCount = words.length > 0 ? words[0][1] : 1;
  const color = CONCEPT_COLORS[concept];
  const label = CONCEPT_LABELS[concept];

  if (words.length === 0) {
    return (
      <div>
        <h4 className="font-medium text-sm mb-2" style={{ color }}>
          {label}
        </h4>
        <p className="text-xs text-muted-foreground italic">
          Insufficient data for word cloud
        </p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-medium text-sm mb-2" style={{ color }}>
        {label}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {words.map(([word, count]) => {
          const scale = 0.5 + (count / maxCount) * 0.5;
          const opacity = 0.4 + (count / maxCount) * 0.6;
          return (
            <span
              key={word}
              className="inline-block px-2 py-0.5 text-white font-medium"
              style={{
                backgroundColor: color,
                opacity,
                fontSize: `${Math.round(11 + scale * 8)}px`,
                borderRadius: 8,
              }}
              title={`${count} mentions`}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// D. Concept Personality Radar
// ---------------------------------------------------------------------------
function ConceptPersonalityRadar() {
  // Derive dimensions from word frequency data
  const gd = vizData.golden_door_words as Record<string, number>;
  const tt = vizData.ten_ten_words as Record<string, number>;
  const re = vizData.rescue_words as Record<string, number>;

  function score(words: Record<string, number>, keys: string[]): number {
    return keys.reduce((sum, k) => sum + (words[k] || 0), 0);
  }

  const data = [
    {
      dimension: "Trust",
      golden_door: score(gd, ["trust", "genuine", "real", "clear"]),
      ten_ten: score(tt, ["trust", "genuine", "real", "clear"]),
      rescue: score(re, ["trust", "genuine", "real", "clear", "building", "transparency"]),
    },
    {
      dimension: "Community",
      golden_door: score(gd, ["community", "consumer", "consumers"]),
      ten_ten: score(tt, ["community", "consumer", "consumers"]),
      rescue: score(re, ["community", "consumer", "consumers"]),
    },
    {
      dimension: "Experience",
      golden_door: score(gd, ["experience", "serendipity", "tier", "appeal"]),
      ten_ten: score(tt, ["experience", "serendipity", "tier", "appeal"]),
      rescue: score(re, ["experience", "experiences", "seamless", "expectations"]),
    },
    {
      dimension: "Authenticity",
      golden_door: score(gd, ["genuine", "genuinely", "substance", "real"]),
      ten_ten: score(tt, ["genuine", "genuinely", "substance", "real"]),
      rescue: score(re, ["genuine", "genuinely", "real"]),
    },
    {
      dimension: "Conversion",
      golden_door: score(gd, ["drive", "promotional", "marketing", "brand"]),
      ten_ten: score(tt, ["drive", "promotional", "marketing", "brand"]),
      rescue: score(re, ["commerce", "checkout", "retail"]),
    },
    {
      dimension: "Discovery",
      golden_door: score(gd, ["golden", "door", "serendipity"]),
      ten_ten: score(tt, ["golden", "door", "serendipity"]),
      rescue: score(re, ["explore", "transform", "dive", "possibilities"]),
    },
    {
      dimension: "Financing",
      golden_door: score(gd, ["financing", "finance", "healthcare", "benefits", "value"]),
      ten_ten: score(tt, ["financing", "finance", "healthcare", "benefits", "value"]),
      rescue: score(re, ["benefits", "retail", "commerce", "checkout"]),
    },
  ];

  return (
    <div>
      <h3 className="font-semibold mb-3 text-lg" style={{ color: "#000531" }}>Concept Personality Radar</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Qualitative dimensions by word frequency in concept-related discussions
      </p>
      <ResponsiveContainer width="100%" height={380}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(0,5,49,0.1)" />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#000531" }} />
          <PolarRadiusAxis tick={{ fontSize: 9, fill: "#6b7280" }} />
          <Radar
            name="The Golden Door"
            dataKey="golden_door"
            stroke={CONCEPT_COLORS.golden_door}
            fill={CONCEPT_COLORS.golden_door}
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Radar
            name="10/10"
            dataKey="ten_ten"
            stroke={CONCEPT_COLORS.ten_ten}
            fill={CONCEPT_COLORS.ten_ten}
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Radar
            name="The Rescue"
            dataKey="rescue"
            stroke={CONCEPT_COLORS.rescue}
            fill={CONCEPT_COLORS.rescue}
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// E. Agent Engagement by Concept
// ---------------------------------------------------------------------------
function AgentConceptEngagement() {
  const agents = vizData.agent_concept_counts as Record<
    string,
    { golden_door: number; ten_ten: number; rescue: number }
  >;

  // Deduplicate agent names (merge CamelCase variants)
  const merged: Record<string, { golden_door: number; ten_ten: number; rescue: number }> = {};
  for (const [name, counts] of Object.entries(agents)) {
    const canon = name.replace(/([a-z])([A-Z])/g, "$1 $2"); // CamelCase to spaces
    const key = canon.length > 20 ? canon.slice(0, 18) + "..." : canon;
    if (!merged[key]) merged[key] = { golden_door: 0, ten_ten: 0, rescue: 0 };
    merged[key].golden_door += counts.golden_door;
    merged[key].ten_ten += counts.ten_ten;
    merged[key].rescue += counts.rescue;
  }

  const data = Object.entries(merged)
    .map(([name, counts]) => ({ name, ...counts }))
    .filter((d) => d.golden_door + d.ten_ten + d.rescue > 0)
    .sort((a, b) => b.golden_door + b.ten_ten + b.rescue - (a.golden_door + a.ten_ten + a.rescue));

  return (
    <div>
      <h3 className="font-semibold mb-3 text-lg" style={{ color: "#000531" }}>Agent Engagement by Concept</h3>
      <p className="text-xs text-muted-foreground mb-4">
        How often each panelist discussed each concept
      </p>
      <ResponsiveContainer width="100%" height={Math.max(320, data.length * 40)}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fill: "#000531", fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={130} tick={{ fill: "#000531", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,5,49,0.1)" }}
          />
          <Legend />
          <Bar
            dataKey="golden_door"
            name="The Golden Door"
            fill={CONCEPT_COLORS.golden_door}
            stackId="a"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="ten_ten"
            name="10/10"
            fill={CONCEPT_COLORS.ten_ten}
            stackId="a"
          />
          <Bar
            dataKey="rescue"
            name="The Rescue"
            fill={CONCEPT_COLORS.rescue}
            stackId="a"
            radius={[0, 6, 6, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Visualizations Panel
// ---------------------------------------------------------------------------
export function VisualizationsPanel() {
  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: "#000531" }}>Simulation Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Quantitative analysis of {vizData.deduped_count} posts and comments across the simulated panel
        </p>
      </div>

      {/* A. Sentiment Scorecard */}
      <SentimentScorecard />

      {/* B. Concept Discussion Volume */}
      <div className="border-t pt-6" style={{ borderColor: "rgba(0,5,49,0.08)" }}>
        <ConceptMentionsChart />
      </div>

      {/* C. Descriptor Word Clouds */}
      <div className="border-t pt-6" style={{ borderColor: "rgba(0,5,49,0.08)" }}>
        <h3 className="font-semibold mb-4 text-lg" style={{ color: "#000531" }}>Descriptor Word Clouds</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Most-used descriptive words in discussions of each concept. Larger = more frequent.
        </p>
        <div className="space-y-5">
          <WordCloudChart concept="golden_door" />
          <WordCloudChart concept="ten_ten" />
          <WordCloudChart concept="rescue" />
        </div>
      </div>

      {/* D. Concept Personality Radar */}
      <div className="border-t pt-6" style={{ borderColor: "rgba(0,5,49,0.08)" }}>
        <ConceptPersonalityRadar />
      </div>

      {/* E. Agent Engagement by Concept */}
      <div className="border-t pt-6" style={{ borderColor: "rgba(0,5,49,0.08)" }}>
        <AgentConceptEngagement />
      </div>
    </div>
  );
}

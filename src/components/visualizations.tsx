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
  Cell,
} from "recharts";

const FRAMING_COLORS = {
  framing_a: "#2563eb", // Blue
  framing_b: "#9333ea", // Purple
};

const FRAMING_LABELS: Record<string, string> = {
  framing_a: "Framing A (Product)",
  framing_b: "Framing B (Working Model)",
};

interface VizData {
  concept_mentions: Record<string, number>;
  concept_sentiment: Record<string, { positive: number; negative: number; total_mentions: number; net_sentiment: number; sentiment_ratio: number }>;
  framing_a_words: Record<string, number>;
  framing_b_words: Record<string, number>;
  agent_concept_counts: Record<string, Record<string, number>>;
}

const data = vizData as VizData;

// ---------------------------------------------------------------------------
// Sentiment Scorecard
// ---------------------------------------------------------------------------
function SentimentScorecard() {
  const framings = ["framing_a", "framing_b"] as const;

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {framings.map((key) => {
        const s = data.concept_sentiment[key];
        const pct = Math.round(s.sentiment_ratio * 100);
        const color = FRAMING_COLORS[key];
        return (
          <div key={key} className="bg-white border p-5" style={{ borderRadius: 12, borderColor: "rgba(0,5,49,0.08)" }}>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color }}>
              {FRAMING_LABELS[key]}
            </h4>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold" style={{ color }}>{pct}%</span>
              <span className="text-xs text-muted-foreground">positive sentiment</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{s.positive} positive</span>
              <span>{s.negative} negative</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {s.total_mentions} explicit references
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Discussion Volume Chart
// ---------------------------------------------------------------------------
function MentionChart() {
  const chartData = [
    { name: "Framing A\n(Product)", mentions: data.concept_mentions.framing_a, fill: FRAMING_COLORS.framing_a },
    { name: "Framing B\n(Working Model)", mentions: data.concept_mentions.framing_b, fill: FRAMING_COLORS.framing_b },
  ];

  return (
    <div className="bg-white border p-5 mb-8" style={{ borderRadius: 12, borderColor: "rgba(0,5,49,0.08)" }}>
      <h3 className="text-sm font-semibold mb-4">Discussion Volume</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="mentions" radius={[0, 6, 6, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-2">
        Framing B generated 66% more explicit discussion. Higher volume may reflect need for more explanation rather than preference.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Word Clouds (as sorted word lists with sized text)
// ---------------------------------------------------------------------------
function WordCloud({ words, color, label }: { words: Record<string, number>; color: string; label: string }) {
  const sorted = Object.entries(words)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  const maxCount = sorted[0]?.[1] || 1;

  return (
    <div className="bg-white border p-5" style={{ borderRadius: 12, borderColor: "rgba(0,5,49,0.08)" }}>
      <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color }}>
        {label}
      </h4>
      <div className="flex flex-wrap gap-2">
        {sorted.map(([word, count]) => {
          const size = 11 + (count / maxCount) * 10;
          const opacity = 0.4 + (count / maxCount) * 0.6;
          return (
            <span
              key={word}
              className="inline-block px-2 py-0.5 rounded font-medium"
              style={{ fontSize: size, color, opacity, backgroundColor: `${color}10` }}
            >
              {word} <span className="text-[10px] opacity-60">{count}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Agent Engagement Chart
// ---------------------------------------------------------------------------
function AgentEngagementChart() {
  const agents = Object.entries(data.agent_concept_counts)
    .map(([name, counts]) => ({
      name: name.split(" ")[0], // First name only for chart
      fullName: name,
      framing_a: counts.framing_a || 0,
      framing_b: counts.framing_b || 0,
      general: counts.general || 0,
    }))
    .sort((a, b) => (b.framing_a + b.framing_b) - (a.framing_a + a.framing_b));

  return (
    <div className="bg-white border p-5 mb-8" style={{ borderRadius: 12, borderColor: "rgba(0,5,49,0.08)" }}>
      <h3 className="text-sm font-semibold mb-4">Panelist Engagement by Framing</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={agents}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="framing_a" name="Framing A (Product)" fill={FRAMING_COLORS.framing_a} stackId="a" radius={[0, 0, 0, 0]} />
          <Bar dataKey="framing_b" name="Framing B (Working Model)" fill={FRAMING_COLORS.framing_b} stackId="a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-2">
        Stacked bars show explicit framing references per panelist. Yuki, Devon, and Rachel were the most engaged with both framings. Margaret Chen rarely used explicit framing language, preferring to discuss practicality in the abstract.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Visualizations Panel
// ---------------------------------------------------------------------------
export function VisualizationsPanel() {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h2 className="text-xl font-semibold mb-2">Panel Analytics</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Quantitative analysis of Reddit panel discussion across 60 active rounds. Run 1 data.
      </p>

      <SentimentScorecard />
      <MentionChart />
      <AgentEngagementChart />

      <div className="grid grid-cols-2 gap-4 mb-8">
        <WordCloud
          words={data.framing_a_words}
          color={FRAMING_COLORS.framing_a}
          label="Framing A: Top Discussion Words"
        />
        <WordCloud
          words={data.framing_b_words}
          color={FRAMING_COLORS.framing_b}
          label="Framing B: Top Discussion Words"
        />
      </div>

      <div className="bg-white border p-5" style={{ borderRadius: 12, borderColor: "rgba(0,5,49,0.08)" }}>
        <h3 className="text-sm font-semibold mb-3">Key Insight</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Across both framings, the most-discussed terms were the <strong>components</strong> &mdash; Core, Velocity, Holistic Search &mdash; not the Brand Gravity wrapper itself. Panelists engaged with what they would buy (the components and their pricing), not what it was called. This pattern was stable across runs 1 and 2, and suggests the components may be the real unit of sale regardless of which framing DCP adopts.
        </p>
      </div>
    </div>
  );
}

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
} from "recharts";

const BRIEF_COLORS = {
  flip: "#f59e0b",
  signal: "#3b82f6",
  gathering: "#10b981",
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
]);

function getTopDescriptors(wordMap: Record<string, number>, limit: number = 15) {
  return Object.entries(wordMap)
    .filter(([w]) => DESCRIPTIVE_WORDS.has(w))
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);
}

export function BriefMentionsChart() {
  const data = [
    { name: "The Flip", count: vizData.brief_mentions.flip, fill: BRIEF_COLORS.flip },
    { name: "The Signal", count: vizData.brief_mentions.signal, fill: BRIEF_COLORS.signal },
    { name: "The Gathering", count: vizData.brief_mentions.gathering, fill: BRIEF_COLORS.gathering },
  ];

  return (
    <div>
      <h3 className="font-semibold mb-3">Brief Discussion Volume</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Number of posts/comments mentioning each brief (out of 163 total)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <rect key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WordCloudChart({ brief }: { brief: "flip" | "signal" | "gathering" }) {
  const wordMap =
    brief === "flip"
      ? vizData.flip_words
      : brief === "signal"
        ? vizData.signal_words
        : vizData.gathering_words;

  const words = getTopDescriptors(wordMap as Record<string, number>, 12);
  const maxCount = words.length > 0 ? words[0][1] : 1;
  const color = BRIEF_COLORS[brief];
  const label = brief === "flip" ? "The Flip" : brief === "signal" ? "The Signal" : "The Gathering";

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
              className="inline-block rounded px-2 py-0.5 text-white font-medium"
              style={{
                backgroundColor: color,
                opacity,
                fontSize: `${Math.round(11 + scale * 8)}px`,
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

export function AgentBriefEngagement() {
  const agents = vizData.agent_brief_counts as Record<
    string,
    { flip: number; signal: number; gathering: number }
  >;

  // Deduplicate agent names (merge MargaretChen + Margaret Chen etc)
  const merged: Record<string, { flip: number; signal: number; gathering: number }> = {};
  for (const [name, counts] of Object.entries(agents)) {
    const canon = name.replace(/([a-z])([A-Z])/g, "$1 $2"); // CamelCase to spaces
    const key = canon.length > 20 ? canon.slice(0, 18) + "..." : canon;
    if (!merged[key]) merged[key] = { flip: 0, signal: 0, gathering: 0 };
    merged[key].flip += counts.flip;
    merged[key].signal += counts.signal;
    merged[key].gathering += counts.gathering;
  }

  const data = Object.entries(merged)
    .map(([name, counts]) => ({ name, ...counts }))
    .filter((d) => d.flip + d.signal + d.gathering > 0)
    .sort((a, b) => b.flip + b.signal + b.gathering - (a.flip + a.signal + a.gathering));

  return (
    <div>
      <h3 className="font-semibold mb-3">Agent Engagement by Brief</h3>
      <p className="text-xs text-muted-foreground mb-4">
        How often each panelist discussed each brief
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="flip" name="The Flip" fill={BRIEF_COLORS.flip} stackId="a" radius={[0, 0, 0, 0]} />
          <Bar dataKey="signal" name="The Signal" fill={BRIEF_COLORS.signal} stackId="a" />
          <Bar dataKey="gathering" name="The Gathering" fill={BRIEF_COLORS.gathering} stackId="a" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BriefPersonalityRadar() {
  // Compare the three briefs across qualitative dimensions derived from word analysis
  const data = [
    { dimension: "Trust", flip: 21, signal: 4, gathering: 8 },
    { dimension: "Community", flip: 5, signal: 3, gathering: 47 },
    { dimension: "Transparency", flip: 42, signal: 3, gathering: 4 },
    { dimension: "Stress", flip: 2, signal: 15, gathering: 1 },
    { dimension: "Authenticity", flip: 23, signal: 4, gathering: 29 },
    { dimension: "Conversion", flip: 5, signal: 8, gathering: 3 },
    { dimension: "Discovery", flip: 15, signal: 2, gathering: 3 },
    { dimension: "Ecosystem", flip: 3, signal: 7, gathering: 12 },
  ];

  return (
    <div>
      <h3 className="font-semibold mb-3">Brief Personality Profiles</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Qualitative dimensions by word frequency in brief-related discussions
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis tick={{ fontSize: 9 }} />
          <Radar name="The Flip" dataKey="flip" stroke={BRIEF_COLORS.flip} fill={BRIEF_COLORS.flip} fillOpacity={0.15} strokeWidth={2} />
          <Radar name="The Signal" dataKey="signal" stroke={BRIEF_COLORS.signal} fill={BRIEF_COLORS.signal} fillOpacity={0.15} strokeWidth={2} />
          <Radar name="The Gathering" dataKey="gathering" stroke={BRIEF_COLORS.gathering} fill={BRIEF_COLORS.gathering} fillOpacity={0.15} strokeWidth={2} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VisualizationsPanel() {
  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold mb-1">Simulation Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Quantitative analysis of 163 posts and comments across 72 simulated rounds
        </p>
      </div>

      <BriefMentionsChart />

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Descriptor Word Clouds by Brief</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Most-used descriptive words in discussions of each brief. Larger = more frequent.
        </p>
        <div className="space-y-4">
          <WordCloudChart brief="flip" />
          <WordCloudChart brief="signal" />
          <WordCloudChart brief="gathering" />
        </div>
      </div>

      <div className="border-t pt-6">
        <BriefPersonalityRadar />
      </div>

      <div className="border-t pt-6">
        <AgentBriefEngagement />
      </div>
    </div>
  );
}

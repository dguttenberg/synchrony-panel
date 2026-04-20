import personasData from "@/data/personas.json";

export interface Persona {
  id: number;
  name: string;
  bio: string;
  persona: string;
  role: "consumer" | "partner";
  color: string;
  age: number;
  profession: string;
  mbti: string;
}

// Distinct colors for the 9 personas
const PERSONA_COLORS: Record<number, string> = {
  0: "#2563eb", // Jennifer Park — blue
  1: "#7c3aed", // Alex Rivera — violet
  2: "#dc2626", // Margaret Chen — red
  3: "#059669", // Denise Washington — emerald
  4: "#d97706", // Keisha Okafor — amber
  5: "#0891b2", // Priya Mehta — cyan
  6: "#c026d3", // Rachel Torres — fuchsia
  7: "#65a30d", // Mike Reardon — lime
  10: "#ea580c", // Dr. Susan Weaver — orange
};

// Deduplicate: keep the canonical versions (user_id 0, 1, 2-7, 10)
// Remove user_id 8 (JenniferPark — duplicate of 0 Jennifer Park)
// Remove user_id 9 (AlexRivera — duplicate of 1 Alex Rivera)
// The names without spaces are the duplicates:
//   user_id 2 "MargaretChen" vs none => keep 2, it's the only Margaret
//   user_id 3 "DeniseWashington" => only Denise, keep
//   user_id 8 "JenniferPark" => duplicate of 0 "Jennifer Park" => drop 8
//   user_id 9 "AlexRivera" => duplicate of 1 "Alex Rivera" => drop 9
//   user_id 10 "DrSusanWeaver" => only Dr. Susan Weaver, keep
const DUPLICATE_IDS = new Set([8, 9]);

// Display names (clean up names without spaces)
const DISPLAY_NAMES: Record<number, string> = {
  2: "Margaret Chen",
  3: "Denise Washington",
  4: "Keisha Okafor",
  5: "Priya Mehta",
  6: "Rachel Torres",
  7: "Mike Reardon",
  10: "Dr. Susan Weaver",
};

// Role assignments: Alex Rivera (1) and Rachel Torres (6) are partner panelists
// The rest are consumer panelists
const PARTNER_PERSONA_IDS = new Set([1, 6]);

export const personas: Persona[] = personasData
  .filter((p) => !DUPLICATE_IDS.has(p.user_id))
  .map((p) => ({
    id: p.user_id,
    name: DISPLAY_NAMES[p.user_id] || p.name,
    bio: p.bio,
    persona: p.persona,
    role: PARTNER_PERSONA_IDS.has(p.user_id)
      ? ("partner" as const)
      : ("consumer" as const),
    color: PERSONA_COLORS[p.user_id] || "#6b7280",
    age: p.age,
    profession: p.profession,
    mbti: p.mbti,
  }));

export function getPersonaById(id: number): Persona | undefined {
  return personas.find((p) => p.id === id);
}

// Map from agent names (as they appear in actions) to canonical persona IDs
const AGENT_NAME_TO_ID: Record<string, number> = {
  "Jennifer Park": 0,
  jennifer_park_738: 0,
  "Alex Rivera": 1,
  alex_rivera_588: 1,
  MargaretChen: 2,
  margaretchen_478: 2,
  DeniseWashington: 3,
  denisewashington_513: 3,
  KeishaOkafor: 4,
  keishaokafor_336: 4,
  PriyaMehta: 5,
  priyamehta_120: 5,
  RachelTorres: 6,
  racheltorres_123: 6,
  MikeReardon: 7,
  mikereardon_690: 7,
  JenniferPark: 0,
  jenniferpark_694: 0,
  AlexRivera: 1,
  alexrivera_612: 1,
  DrSusanWeaver: 10,
  drsusanweaver_284: 10,
};

export function getPersonaIdByAgentName(
  agentName: string
): number | undefined {
  return AGENT_NAME_TO_ID[agentName];
}

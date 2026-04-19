import personasData from "@/data/personas.json";

export interface Persona {
  id: number;
  name: string;
  bio: string;
  persona: string;
  role: "buyer" | "seller" | "gatekeeper" | "skeptic" | "moderator" | "presenter";
  color: string;
  age: number;
  profession: string;
  mbti: string;
  user_id: number;
}

const PERSONA_COLORS: Record<string, string> = {
  "Margaret Chen": "#dc2626",      // red
  "James Okafor": "#2563eb",       // blue
  "Priya Ramanathan": "#0891b2",   // cyan
  "Carlos Mendez": "#ea580c",      // orange
  "Danielle Foster": "#c026d3",    // fuchsia
  "Tom Blackwell": "#65a30d",      // lime
  "Yuki Nakamura": "#7c3aed",      // violet
  "Rachel Steinberg": "#d97706",   // amber
  "Devon Williams": "#059669",     // emerald
  "Panel Moderator": "#6b7280",    // gray
  "DCP Presenter": "#334155",      // slate
};

export const personas: Persona[] = personasData.map((p) => ({
  id: p.user_id,
  user_id: p.user_id,
  name: p.name,
  bio: p.bio,
  persona: p.persona,
  role: (p as { role?: string }).role as Persona["role"] || "buyer",
  color: PERSONA_COLORS[p.name] || "#6b7280",
  age: p.age,
  profession: p.profession,
  mbti: p.mbti,
}));

export function getPersonas(): Persona[] {
  return personas;
}

export function getPersonaById(id: number): Persona | undefined {
  return personas.find((p) => p.id === id);
}

const AGENT_NAME_TO_ID: Record<string, number> = {};
for (const p of personas) {
  AGENT_NAME_TO_ID[p.name] = p.id;
}

export function getPersonaIdByAgentName(
  agentName: string
): number | undefined {
  return AGENT_NAME_TO_ID[agentName];
}

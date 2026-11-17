// Transcript -> structured draft using an LLM. Passwords are never sent to the AI:
// only id, name, role, specialization and skills.
import type { User } from "./types";

export interface DraftTask { title: string; description: string; assigneeId: string; deadline: string; estimatedHours: number }
export interface DraftProject { name: string; clientName: string; description: string; managerId: string; deadline: string; tasks: DraftTask[] }
export interface Draft { projects: DraftProject[] }

const SYSTEM_PROMPT = `You are the AI Project Manager of NovaWorks Technologies (Lahore, Pakistan).
You convert a meeting transcript into projects and tasks for the company CRM.

STRICT RULES
1. Use ONLY people from the supplied TEAM DIRECTORY. Reference them by their exact "id" (e.g. "PM01", "DEV03").
   - managerId MUST be the id of a MANAGER. assigneeId MUST be the id of an AGENT.
   - Never invent employees. Clients, end users and outside people (e.g. a client contact) are NOT employees.
   - If an owner truly cannot be resolved, set the id to "" (empty) — do not guess.
2. Follow FINAL agreed decisions only. When something is revised later in the meeting (a new date, new hours,
   a new owner), use the LATEST value. A "final recap" overrides earlier discussion.
3. Do NOT create tasks for rejected / excluded / out-of-scope / future features (e.g. payments, inventory, maps,
   driver tracking, real email or ticketing integrations) and do not create tasks for management work.
4. Keep projects separate exactly as the meeting decides. Keep tasks separate when the meeting says so;
   never merge tasks just because they share an owner. Use the exact task and project names spoken in the meeting.
5. Dates: output ISO "YYYY-MM-DD". Infer the year from the meeting date when it is not spoken.
6. estimatedHours = developer effort hours (a positive number), not calendar days.
7. description: 1-2 sentences summarising the agreed scope (mention exclusions in the project description when stated).
8. Output ONLY JSON matching: {"projects":[{"name","clientName","description","managerId","deadline",
   "tasks":[{"title","description","assigneeId","deadline","estimatedHours"}]}]}`;

function buildUserPrompt(transcript: string, directory: User[]) {
  const dir = directory
    .filter((u) => u.role !== "ADMIN")
    .map((u) => ({ id: u.id, name: u.name, role: u.role, specialization: u.specialization, skills: u.skills }));
  return `TEAM DIRECTORY (the only valid people):\n${JSON.stringify(dir, null, 2)}\n\nMEETING TRANSCRIPT:\n"""\n${transcript}\n"""\n\nReturn the JSON now.`;
}

const GEMINI_SCHEMA = {
  type: "OBJECT",
  properties: {
    projects: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" }, clientName: { type: "STRING" }, description: { type: "STRING" },
          managerId: { type: "STRING" }, deadline: { type: "STRING" },
          tasks: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" }, description: { type: "STRING" }, assigneeId: { type: "STRING" },
                deadline: { type: "STRING" }, estimatedHours: { type: "NUMBER" },
              },
              required: ["title", "description", "assigneeId", "deadline", "estimatedHours"],
              propertyOrdering: ["title", "description", "assigneeId", "deadline", "estimatedHours"],
            },
          },
        },
        required: ["name", "clientName", "description", "managerId", "deadline", "tasks"],
        propertyOrdering: ["name", "clientName", "description", "managerId", "deadline", "tasks"],
      },
    },
  },
  required: ["projects"],
};

async function callGemini(prompt: string): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, responseMimeType: "application/json", responseSchema: GEMINI_SCHEMA },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("");
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

async function callOpenAICompatible(prompt: string): Promise<string> {
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`AI API error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("AI returned an empty response");
  return text;
}

export function aiProviderName() {
  if (process.env.GEMINI_API_KEY) return `Gemini (${process.env.GEMINI_MODEL || "gemini-2.5-flash"})`;
  if (process.env.OPENAI_API_KEY) return `OpenAI-compatible (${process.env.OPENAI_MODEL || "gpt-4o-mini"})`;
  return null;
}

export async function extractDraft(transcript: string, directory: User[]): Promise<Draft> {
  const prompt = buildUserPrompt(transcript, directory);
  let raw: string;
  if (process.env.GEMINI_API_KEY) raw = await callGemini(prompt);
  else if (process.env.OPENAI_API_KEY) raw = await callOpenAICompatible(prompt);
  else throw new Error("No AI key configured. Set GEMINI_API_KEY or OPENAI_API_KEY in .env");

  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    return JSON.parse(cleaned) as Draft;
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }
}

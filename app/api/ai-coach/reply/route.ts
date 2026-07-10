import { NextResponse } from "next/server";

import { chatCompletion, parseGuestLlmReply } from "@/lib/ai/chat-completion";
import { getChatLlmConfig } from "@/lib/ai/llm-config";
import { buildGuestReply } from "@/lib/ai-coach/guest-engine";
import { getAiCoachScenario } from "@/lib/ai-coach/scenarios";
import type { GuestMood } from "@/lib/types/ai-coach";

type RequestBody = {
  scenarioId: string;
  staffMessage: string;
  turnIndex: number;
  mood: GuestMood;
  history?: { role: string; english: string }[];
};

async function tryLlmReply(body: RequestBody): Promise<{
  english: string;
  chinese: string;
  staffScore: number;
  feedback: string;
} | null> {
  const config = getChatLlmConfig();
  if (!config) return null;

  const scenario = getAiCoachScenario(body.scenarioId);
  if (!scenario) return null;

  const system = `You are ${scenario.guestName}, a hotel guest in a roleplay training exercise.
Persona: ${scenario.guestPersona}
Setting: ${scenario.setting}
Respond ONLY as the guest in English (1-3 sentences). Be realistic.
Current mood: ${body.mood}
After your English reply, add a line "---" then a brief Chinese translation.
Evaluate the staff's last message briefly in Chinese on a final line starting with "FEEDBACK:"`;

  const messages = [
    { role: "system" as const, content: system },
    ...(body.history ?? []).map((m) => ({
      role: (m.role === "staff" ? "user" : "assistant") as "user" | "assistant",
      content: m.english,
    })),
    { role: "user" as const, content: `Staff says: "${body.staffMessage}"` },
  ];

  const text = await chatCompletion(config, { messages, maxTokens: 200, temperature: 0.8 });
  if (!text) return null;

  const parsed = parseGuestLlmReply(text);
  return { ...parsed, staffScore: 70 };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const scenario = getAiCoachScenario(body.scenarioId);
    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }

    const llm = await tryLlmReply(body);
    const result = llm
      ? {
          english: llm.english,
          chinese: llm.chinese,
          mood: body.mood,
          staffScore: llm.staffScore,
          feedback: llm.feedback,
          sessionComplete: body.turnIndex + 1 >= scenario.turns.length,
        }
      : buildGuestReply(scenario, body.staffMessage, body.turnIndex, body.mood);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[ai-coach/reply]", err);
    return NextResponse.json({ error: "Reply failed" }, { status: 500 });
  }
}

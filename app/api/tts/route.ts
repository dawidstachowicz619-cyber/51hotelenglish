import { NextResponse } from "next/server";

import {
  formatTtsInput,
  getTtsConfig,
  ttsSpeedForMode,
  type TtsSpeechMode,
} from "@/lib/ai/tts-config";

function parseSpeechMode(value: unknown): TtsSpeechMode {
  if (value === "fall" || value === "success") return value;
  return "default";
}

export async function POST(request: Request) {
  const config = getTtsConfig();
  if (!config) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { text?: string; mode?: unknown };
    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const mode = parseSpeechMode(body.mode);
    const input = formatTtsInput(text, mode);
    const speed = ttsSpeedForMode(mode);

    const res = await fetch(`${config.baseUrl}/audio/speech`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        input,
        voice: config.voice,
        response_format: "mp3",
        speed,
        sample_rate: config.sampleRate,
        gain: 0.5,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[tts]", res.status, detail);
      return NextResponse.json({ error: "TTS failed" }, { status: 502 });
    }

    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[tts]", err);
    return NextResponse.json({ error: "TTS error" }, { status: 500 });
  }
}

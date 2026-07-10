import { NextResponse } from "next/server";

import { getTranscribeConfig } from "@/lib/ai/speech-config";

function whisperLanguage(lang: string): string {
  if (lang.startsWith("zh")) return "zh";
  if (lang.startsWith("ru")) return "ru";
  return "en";
}

export async function POST(request: Request) {
  const config = getTranscribeConfig();
  if (!config) {
    return NextResponse.json(
      { error: "No server STT configured", fallback: "browser" },
      { status: 503 }
    );
  }

  try {
    const form = await request.formData();
    const audio = form.get("audio");
    const lang = (form.get("lang") as string | null) ?? "en-US";

    if (!(audio instanceof Blob) || audio.size < 200) {
      return NextResponse.json({ error: "Audio too short." }, { status: 400 });
    }

    const filename =
      audio instanceof File && audio.name ? audio.name : "speech.webm";

    const body = new FormData();
    body.append("file", audio, filename);
    body.append("model", config.model);
    if (config.provider === "openai") {
      body.append("language", whisperLanguage(lang));
    }

    const res = await fetch(`${config.baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}` },
      body,
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error(`[transcribe/${config.provider}]`, detail);
      return NextResponse.json(
        { error: "Transcription failed.", fallback: "browser" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { text?: string };
    return NextResponse.json({ text: (data.text ?? "").trim(), provider: config.provider });
  } catch (error) {
    console.error("Transcribe error:", error);
    return NextResponse.json(
      { error: "Transcription failed.", fallback: "browser" },
      { status: 500 }
    );
  }
}

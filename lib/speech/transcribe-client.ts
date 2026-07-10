"use client";

/** 客户端语音转写：本地 Whisper → 服务端 API */
export async function transcribeAudioBlob(
  blob: Blob,
  lang = "en-US"
): Promise<{ text: string; source: string }> {
  const { transcribeInBrowser, isBrowserWhisperSupported } = await import(
    "@/lib/speech/browser-whisper"
  );

  if (isBrowserWhisperSupported()) {
    try {
      const text = await transcribeInBrowser(blob);
      if (text) return { text, source: "browser" };
    } catch (error) {
      console.warn("[transcribe] browser whisper failed", error);
    }
  }

  const form = new FormData();
  form.append("audio", blob, blob.type.includes("mp4") ? "speech.m4a" : "speech.webm");
  form.append("lang", lang);

  const res = await fetch("/api/ai-coach/transcribe", { method: "POST", body: form });
  if (res.ok) {
    const data = (await res.json()) as { text?: string; provider?: string };
    const text = (data.text ?? "").trim();
    if (text) return { text, source: data.provider ?? "server" };
  }

  throw new Error("all transcribe methods failed");
}

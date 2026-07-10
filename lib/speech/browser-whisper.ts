"use client";

import { blobTo16kMono } from "@/lib/speech/audio-utils";

type Transcriber = (
  audio: Float32Array,
  options?: Record<string, unknown>
) => Promise<{ text: string }>;

let transcriberPromise: Promise<Transcriber> | null = null;

async function getTranscriber(): Promise<Transcriber> {
  if (!transcriberPromise) {
    transcriberPromise = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");

      env.allowLocalModels = false;
      env.useBrowserCache = true;
      env.remoteHost = "https://hf-mirror.com";

      const model = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-tiny.en"
      );

      return model as Transcriber;
    })();
  }

  return transcriberPromise;
}

export async function transcribeInBrowser(blob: Blob): Promise<string> {
  const transcriber = await getTranscriber();
  const audio = await blobTo16kMono(blob);

  const result = await transcriber(audio, {
    language: "english",
    task: "transcribe",
    chunk_length_s: 30,
    stride_length_s: 5,
  });

  return (result.text ?? "").trim();
}

export function isBrowserWhisperSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof AudioContext !== "undefined" &&
    typeof OfflineAudioContext !== "undefined"
  );
}

export async function preloadBrowserWhisper(): Promise<void> {
  if (!isBrowserWhisperSupported()) return;
  await getTranscriber();
}

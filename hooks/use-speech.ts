"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechItem = {
  text: string;
  lang?: "en-US" | "zh-CN";
  rate?: number;
};

function pickVoice(lang: string) {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  if (lang.startsWith("zh")) {
    return (
      voices.find((v) => v.lang.startsWith("zh") && v.name.includes("Tingting")) ??
      voices.find((v) => v.lang.startsWith("zh-CN")) ??
      voices.find((v) => v.lang.startsWith("zh"))
    );
  }
  return (
    voices.find((v) => v.lang.startsWith("en") && v.name.includes("Google")) ??
    voices.find((v) => v.lang.startsWith("en-US")) ??
    voices.find((v) => v.lang.startsWith("en"))
  );
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const queueRef = useRef<SpeechItem[]>([]);
  const runningRef = useRef(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    queueRef.current = [];
    runningRef.current = false;
    setSpeaking(false);
  }, []);

  const speakOne = useCallback(
    (item: SpeechItem): Promise<void> =>
      new Promise((resolve) => {
        if (!supported || !item.text.trim()) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(item.text);
        utterance.lang = item.lang ?? "en-US";
        utterance.rate = item.rate ?? (item.lang?.startsWith("zh") ? 0.95 : 0.88);
        utterance.pitch = 1;

        const voice = pickVoice(utterance.lang);
        if (voice) utterance.voice = voice;

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);
      }),
    [supported]
  );

  const speakSequence = useCallback(
    async (items: SpeechItem[]) => {
      if (!supported || items.length === 0) return;
      stop();
      runningRef.current = true;
      setSpeaking(true);

      for (const item of items) {
        if (!runningRef.current) break;
        await speakOne(item);
        await new Promise((r) => setTimeout(r, 280));
      }

      runningRef.current = false;
      setSpeaking(false);
    },
    [supported, speakOne, stop]
  );

  const speak = useCallback(
    (text: string, lang: "en-US" | "zh-CN" = "en-US") => {
      speakSequence([{ text, lang }]);
    },
    [speakSequence]
  );

  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      stop();
    };
  }, [supported, stop]);

  return { speak, speakSequence, stop, speaking, supported };
}

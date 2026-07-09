"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  detectSpeechLang,
  isSectionOpenerSentence,
  naturalSpeechRate,
  pauseBetweenSentencesMs,
  pickNaturalVoice,
  splitForNaturalSpeech,
  waitForSpeechVoices,
  type SpeechLang,
} from "@/lib/speech/voice-selection";
import {
  clampSpeechRate,
  loadSpeechSpeed,
  saveSpeechSpeed,
  type SpeechSpeed,
} from "@/lib/speech/speech-speed";

export type SpeechItem = {
  text: string;
  lang?: SpeechLang;
  rate?: number;
  pitch?: number;
};

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const [speed, setSpeed] = useState<SpeechSpeed>(() => loadSpeechSpeed());
  const queueRef = useRef<SpeechItem[]>([]);
  const runningRef = useRef(false);
  const voicesLoadedRef = useRef(false);
  const speedRef = useRef(speed);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const setSpeechSpeed = useCallback((next: SpeechSpeed) => {
    setSpeed(next);
    saveSpeechSpeed(next);
  }, []);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    if (!supported) return;

    let cancelled = false;

    void waitForSpeechVoices().then(() => {
      if (cancelled) return;
      voicesLoadedRef.current = true;
      setVoicesReady(true);
    });

    const onVoicesChanged = () => {
      voicesLoadedRef.current = window.speechSynthesis.getVoices().length > 0;
      setVoicesReady(voicesLoadedRef.current);
    };

    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    return () => {
      cancelled = true;
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    queueRef.current = [];
    runningRef.current = false;
    setSpeaking(false);
  }, []);

  const speakOne = useCallback(
    async (item: SpeechItem): Promise<void> => {
      if (!supported || !item.text.trim()) return;

      if (!voicesLoadedRef.current) {
        await waitForSpeechVoices();
        voicesLoadedRef.current = true;
        setVoicesReady(true);
      }

      return new Promise((resolve) => {
        const lang = item.lang ?? "en-US";
        const baseRate = item.rate ?? naturalSpeechRate(lang);
        const utterance = new SpeechSynthesisUtterance(item.text);
        utterance.lang = lang;
        utterance.rate = clampSpeechRate(baseRate * speedRef.current);
        utterance.pitch = item.pitch ?? (lang === "zh-CN" ? 1.0 : 0.98);
        utterance.volume = 1;

        const voice = pickNaturalVoice(lang);
        if (voice) utterance.voice = voice;

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);
      });
    },
    [supported]
  );

  const speakSequence = useCallback(
    async (items: SpeechItem[]) => {
      if (!supported || items.length === 0) return;
      stop();
      runningRef.current = true;
      setSpeaking(true);

      for (let i = 0; i < items.length; i++) {
        if (!runningRef.current) break;
        const item = items[i];
        await speakOne(item);
        if (!runningRef.current || i >= items.length - 1) break;
        const lang = item.lang ?? "en-US";
        const isOpener = isSectionOpenerSentence(item.text);
        const basePause = pauseBetweenSentencesMs(lang);
        const pauseMs = Math.round((isOpener ? basePause * 1.6 : basePause) / speedRef.current);
        await new Promise((r) => setTimeout(r, pauseMs));
      }

      runningRef.current = false;
      setSpeaking(false);
    },
    [supported, speakOne, stop]
  );

  const speak = useCallback(
    (text: string, lang: SpeechLang = "en-US") => {
      speakSequence([{ text, lang }]);
    },
    [speakSequence]
  );

  /** 按句分段朗读，语速与停顿更接近真人讲解 */
  const speakNatural = useCallback(
    (text: string, lang?: SpeechLang) => {
      const resolvedLang = lang ?? detectSpeechLang(text);
      const sentences = splitForNaturalSpeech(text, resolvedLang);
      const rate = naturalSpeechRate(resolvedLang);
      speakSequence(sentences.map((sentence) => ({ text: sentence, lang: resolvedLang, rate })));
    },
    [speakSequence]
  );

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    speak,
    speakNatural,
    speakSequence,
    stop,
    speaking,
    supported,
    voicesReady,
    speed,
    setSpeechSpeed,
  };
}

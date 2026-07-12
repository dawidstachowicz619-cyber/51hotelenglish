import { isUnreliableWebSpeech } from "@/lib/speech/browser-speech";
import { pickNaturalVoice, waitForSpeechVoices } from "@/lib/speech/voice-selection";

let bgmNodes: {
  ctx: AudioContext;
  master: GainNode;
  interval: ReturnType<typeof setInterval> | null;
} | null = null;

let sharedAudioContext: AudioContext | null = null;
let ttsHtmlAudioEl: HTMLAudioElement | null = null;
let activeBufferSource: AudioBufferSourceNode | null = null;
let htmlPlayGeneration = 0;

let speakSession = 0;
let speechPrimed = false;
let iosKeepAliveTimer: ReturnType<typeof setInterval> | null = null;
const ttsPrefetchCache = new Map<string, Promise<Blob | null>>();

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}

function ttsCacheKey(text: string, mode: "fall" | "success"): string {
  return `${mode}:${text.trim().toLowerCase()}`;
}

function prefetchCloudTts(text: string, mode: "fall" | "success"): void {
  const key = ttsCacheKey(text, mode);
  if (ttsPrefetchCache.has(key)) return;

  ttsPrefetchCache.set(
    key,
    fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, mode }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const blob = await res.blob();
        return blob.size > 0 ? blob : null;
      })
      .catch(() => null)
  );
}

async function fetchCloudTtsBlob(
  text: string,
  mode: "fall" | "success"
): Promise<Blob | null> {
  const key = ttsCacheKey(text, mode);
  const cached = ttsPrefetchCache.get(key);
  if (cached) {
    const blob = await cached;
    ttsPrefetchCache.delete(key);
    if (blob) return blob;
  }

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, mode }),
  });
  if (!res.ok) return null;
  const blob = await res.blob();
  return blob.size > 0 ? blob : null;
}

function getSharedAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioContext) {
    const Ctx =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    sharedAudioContext = new Ctx();
  }
  return sharedAudioContext;
}

function getTtsHtmlAudioElement(): HTMLAudioElement | null {
  if (typeof document === "undefined") return null;
  if (!ttsHtmlAudioEl) {
    const audio = document.createElement("audio");
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    audio.setAttribute("x5-playsinline", "true");
    audio.preload = "auto";
    audio.style.display = "none";
    document.body.appendChild(audio);
    ttsHtmlAudioEl = audio;
  }
  return ttsHtmlAudioEl;
}

/** 在用户点击的同一时刻同步解锁音频（仅 resume，避免静音缓冲带来嘶嘶声） */
export function unlockGameAudioSync(): void {
  speechPrimed = true;

  const ctx = getSharedAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    void ctx.resume();
  }
}

function muteBgmDuringSpeech(): () => void {
  const master = bgmNodes?.master;
  if (!master) return () => undefined;
  const previous = master.gain.value;
  master.gain.value = 0;
  return () => {
    master.gain.value = previous;
  };
}

async function ensureAudioContext(): Promise<AudioContext | null> {
  const ctx = getSharedAudioContext();
  if (!ctx) return null;
  if (ctx.state === "suspended") await ctx.resume();
  return ctx;
}

function startIosSpeechKeepAlive(): void {
  if (isUnreliableWebSpeech() || typeof window === "undefined") return;
  stopIosSpeechKeepAlive();
  iosKeepAliveTimer = setInterval(() => {
    const synth = window.speechSynthesis;
    if (synth.speaking && !synth.paused) {
      synth.pause();
      synth.resume();
    }
  }, 4000);
}

function stopIosSpeechKeepAlive(): void {
  if (iosKeepAliveTimer) {
    clearInterval(iosKeepAliveTimer);
    iosKeepAliveTimer = null;
  }
}

function stopActiveWebAudioSource(): void {
  if (!activeBufferSource) return;
  try {
    activeBufferSource.stop();
  } catch {
    /* ignore */
  }
  activeBufferSource = null;
}

function stopTtsHtmlAudio(): void {
  htmlPlayGeneration += 1;
  const htmlAudio = ttsHtmlAudioEl;
  if (!htmlAudio) return;
  htmlAudio.onended = null;
  htmlAudio.onerror = null;
  htmlAudio.pause();
  if (htmlAudio.src?.startsWith("blob:")) {
    URL.revokeObjectURL(htmlAudio.src);
  }
  htmlAudio.removeAttribute("src");
}

function stopActiveTtsPlayback(): void {
  stopActiveWebAudioSource();
  stopTtsHtmlAudio();
}

function playTone(
  ctx: AudioContext,
  master: GainNode,
  freq: number,
  start: number,
  duration: number,
  volume: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

const BGM_MELODY = [
  { f: 523.25, d: 0.35 },
  { f: 659.25, d: 0.35 },
  { f: 783.99, d: 0.35 },
  { f: 659.25, d: 0.35 },
  { f: 587.33, d: 0.35 },
  { f: 698.46, d: 0.35 },
  { f: 880.0, d: 0.5 },
  { f: 783.99, d: 0.5 },
];

export async function startDiningCatchBgm(volume = 0.08): Promise<void> {
  stopDiningCatchBgm();
  const ctx = await ensureAudioContext();
  if (!ctx) return;

  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);

  let step = 0;
  let cursor = ctx.currentTime + 0.05;

  const schedule = () => {
    for (let i = 0; i < 4; i++) {
      const note = BGM_MELODY[step % BGM_MELODY.length];
      playTone(ctx, master, note.f, cursor, note.d, 0.35);
      cursor += note.d;
      step += 1;
    }
  };

  schedule();
  const interval = setInterval(schedule, BGM_MELODY.reduce((s, n) => s + n.d, 0) * 250);

  bgmNodes = { ctx, master, interval };
}

export function stopDiningCatchBgm(): void {
  if (!bgmNodes) return;
  if (bgmNodes.interval) clearInterval(bgmNodes.interval);
  try {
    bgmNodes.master.disconnect();
  } catch {
    /* ignore */
  }
  bgmNodes = null;
}

export function setDiningCatchBgmVolume(volume: number): void {
  if (bgmNodes?.master) {
    bgmNodes.master.gain.value = volume;
  }
}

/** 用户点击时解锁音频（微信 / 华为内置浏览器必需） */
export async function primeGameSpeech(): Promise<void> {
  unlockGameAudioSync();
  await ensureAudioContext();

  if (isUnreliableWebSpeech() || !window.speechSynthesis) return;

  await waitForSpeechVoices(2000);
  window.speechSynthesis.resume();

  const unlock = new SpeechSynthesisUtterance(" ");
  unlock.volume = 0.01;
  unlock.rate = 1.5;
  unlock.lang = "en-US";
  window.speechSynthesis.speak(unlock);
}

async function playSpeechViaWebAudio(blob: Blob): Promise<void> {
  const ctx = await ensureAudioContext();
  if (!ctx) throw new Error("no audio context");

  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

  stopActiveWebAudioSource();

  return new Promise((resolve, reject) => {
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const startAt = ctx.currentTime + 0.02;
    const duration = audioBuffer.duration;

    filter.type = "lowpass";
    filter.frequency.value = 9000;
    filter.Q.value = 0.6;

    source.buffer = audioBuffer;
    source.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(1, startAt + 0.04);
    gain.gain.setValueAtTime(1, startAt + Math.max(0.04, duration - 0.05));
    gain.gain.linearRampToValueAtTime(0, startAt + duration);

    activeBufferSource = source;

    source.onended = () => {
      if (activeBufferSource === source) activeBufferSource = null;
      resolve();
    };

    try {
      source.start(startAt);
      source.stop(startAt + duration + 0.05);
    } catch (err) {
      if (activeBufferSource === source) activeBufferSource = null;
      reject(err);
    }
  });
}

async function playSpeechViaHtmlAudio(blob: Blob): Promise<void> {
  const htmlAudio = getTtsHtmlAudioElement();
  if (!htmlAudio) throw new Error("no html audio");

  stopTtsHtmlAudio();
  const generation = htmlPlayGeneration;

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    htmlAudio.src = url;
    htmlAudio.volume = 1;

    const cleanup = () => {
      htmlAudio.onended = null;
      htmlAudio.onerror = null;
      if (htmlAudio.src === url) {
        URL.revokeObjectURL(url);
        htmlAudio.removeAttribute("src");
      }
    };

    const finish = (err?: Error) => {
      if (generation !== htmlPlayGeneration) {
        cleanup();
        resolve();
        return;
      }
      cleanup();
      if (err) reject(err);
      else resolve();
    };

    htmlAudio.onended = () => finish();
    htmlAudio.onerror = () => finish(new Error("html audio play failed"));

    void htmlAudio.play().catch((err: unknown) => {
      if (isAbortError(err)) {
        finish();
        return;
      }
      finish(err instanceof Error ? err : new Error("html audio play failed"));
    });
  });
}

async function playSpeechBlob(blob: Blob): Promise<void> {
  const restoreBgm = muteBgmDuringSpeech();

  try {
    if (isUnreliableWebSpeech()) {
      try {
        await playSpeechViaHtmlAudio(blob);
        return;
      } catch {
        await ensureAudioContext();
        await playSpeechViaWebAudio(blob);
        return;
      }
    }

    await ensureAudioContext();

    try {
      await playSpeechViaWebAudio(blob);
      return;
    } catch {
      /* 桌面端 Web Audio 失败时回退 HTML5 Audio */
    }

    await playSpeechViaHtmlAudio(blob);
  } finally {
    restoreBgm();
  }
}

async function speakViaCloudTts(
  text: string,
  mode: "fall" | "success",
  repeat: number,
  session: number
): Promise<boolean> {
  try {
    for (let i = 0; i < repeat; i++) {
      if (session !== speakSession) return true;

      const blob = await fetchCloudTtsBlob(text, mode);
      if (!blob) return false;

      await playSpeechBlob(blob);

      if (i + 1 < repeat) {
        await new Promise((r) => setTimeout(r, 480));
      }
    }
    return true;
  } catch (err) {
    if (isAbortError(err)) return false;
    return false;
  }
}

function pickAlternateEnglishVoice(exclude?: SpeechSynthesisVoice | null) {
  const voices = window.speechSynthesis.getVoices().filter((v) =>
    v.lang.toLowerCase().startsWith("en")
  );
  const alt = voices.find((v) => v.name !== exclude?.name);
  return alt ?? pickNaturalVoice("en-US");
}

async function speakViaWebSpeech(
  text: string,
  mode: "fall" | "success",
  repeat: number,
  session: number
): Promise<void> {
  if (!window.speechSynthesis) return;

  await waitForSpeechVoices(2000);
  window.speechSynthesis.resume();
  window.speechSynthesis.cancel();
  startIosSpeechKeepAlive();

  const speakOnce = (): Promise<void> =>
    new Promise((resolve) => {
      if (session !== speakSession) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.volume = 1;

      const baseVoice = pickNaturalVoice("en-US");
      if (mode === "fall") {
        utterance.rate = 0.92;
        utterance.pitch = 1;
        if (baseVoice) utterance.voice = baseVoice;
      } else {
        utterance.rate = 1.08;
        utterance.pitch = 1.25;
        utterance.voice = pickAlternateEnglishVoice(baseVoice) ?? baseVoice ?? null;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });

  for (let i = 0; i < repeat; i++) {
    if (session !== speakSession) break;
    await speakOnce();
    if (i + 1 < repeat) {
      await new Promise((r) => setTimeout(r, 480));
    }
  }

  if (session === speakSession) {
    stopIosSpeechKeepAlive();
  }
}

export async function speakGameWord(
  text: string,
  mode: "fall" | "success"
): Promise<boolean> {
  if (typeof window === "undefined" || !text.trim()) return false;

  const repeat = mode === "fall" ? 3 : 1;
  const session = ++speakSession;
  stopActiveTtsPlayback();
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  await ensureAudioContext();

  const cloudOk = await speakViaCloudTts(text, mode, repeat, session);
  if (cloudOk && session === speakSession) return true;

  if (session !== speakSession) return true;

  try {
    await speakViaWebSpeech(text, mode, repeat, session);
    return true;
  } catch {
    return false;
  }
}

export function stopGameSpeech(): void {
  speakSession += 1;
  stopIosSpeechKeepAlive();
  stopActiveTtsPlayback();
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function prefersCloudGameSpeech(): boolean {
  return isUnreliableWebSpeech();
}

export function prefetchGameWordAudio(text: string, mode: "fall" | "success" = "fall"): void {
  if (!text.trim()) return;
  prefetchCloudTts(text, mode);
}

export function isGameSpeechPrimed(): boolean {
  return speechPrimed;
}

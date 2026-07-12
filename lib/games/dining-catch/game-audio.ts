import { isUnreliableWebSpeech } from "@/lib/speech/browser-speech";
import { pickNaturalVoice, waitForSpeechVoices } from "@/lib/speech/voice-selection";

let bgmNodes: {
  ctx: AudioContext;
  master: GainNode;
  interval: ReturnType<typeof setInterval> | null;
} | null = null;

let sharedAudioContext: AudioContext | null = null;
let htmlAudioEl: HTMLAudioElement | null = null;

let speakSession = 0;
let speechPrimed = false;
let iosKeepAliveTimer: ReturnType<typeof setInterval> | null = null;
const ttsPrefetchCache = new Map<string, Promise<Blob | null>>();

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

function getHtmlAudioElement(): HTMLAudioElement | null {
  if (typeof document === "undefined") return null;
  if (!htmlAudioEl) {
    const audio = document.createElement("audio");
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    audio.setAttribute("x5-playsinline", "true");
    audio.preload = "auto";
    audio.style.display = "none";
    document.body.appendChild(audio);
    htmlAudioEl = audio;
  }
  return htmlAudioEl;
}

/** 在用户点击的同一时刻同步解锁音频（微信 / 华为必需，不能放在 await/.then 之后） */
export function unlockGameAudioSync(): void {
  speechPrimed = true;

  const ctx = getSharedAudioContext();
  if (ctx) {
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch {
      /* ignore */
    }
  }

  const htmlAudio = getHtmlAudioElement();
  if (htmlAudio) {
    htmlAudio.muted = true;
    htmlAudio.src =
      "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    void htmlAudio.play().finally(() => {
      htmlAudio.pause();
      htmlAudio.muted = false;
      htmlAudio.removeAttribute("src");
    });
  }
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

function stopHtmlAudio(): void {
  const htmlAudio = htmlAudioEl;
  if (!htmlAudio) return;
  htmlAudio.pause();
  htmlAudio.removeAttribute("src");
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

async function playMp3ViaWebAudio(blob: Blob): Promise<void> {
  const ctx = await ensureAudioContext();
  if (!ctx) throw new Error("no audio context");

  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

  return new Promise((resolve, reject) => {
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.onended = () => resolve();
    try {
      source.start(0);
    } catch (err) {
      reject(err);
    }
  });
}

async function playMp3ViaHtmlAudio(blob: Blob): Promise<void> {
  const htmlAudio = getHtmlAudioElement();
  if (!htmlAudio) throw new Error("no html audio");

  stopHtmlAudio();

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    htmlAudio.src = url;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      htmlAudio.onended = null;
      htmlAudio.onerror = null;
    };

    htmlAudio.onended = () => {
      cleanup();
      resolve();
    };
    htmlAudio.onerror = () => {
      cleanup();
      reject(new Error("html audio play failed"));
    };

    void htmlAudio.play().catch((err) => {
      cleanup();
      reject(err);
    });
  });
}

async function playMp3Blob(blob: Blob): Promise<void> {
  if (!speechPrimed) {
    unlockGameAudioSync();
  }
  await ensureAudioContext();

  try {
    await playMp3ViaWebAudio(blob);
    return;
  } catch {
    /* Web Audio 在部分微信内核上失败，回退 HTML5 Audio */
  }

  await playMp3ViaHtmlAudio(blob);
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

      await playMp3Blob(blob);

      if (i + 1 < repeat) {
        await new Promise((r) => setTimeout(r, 320));
      }
    }
    return true;
  } catch {
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
      await new Promise((r) => setTimeout(r, 320));
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
  stopHtmlAudio();
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
  stopHtmlAudio();
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

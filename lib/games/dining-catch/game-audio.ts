import { isUnreliableWebSpeech } from "@/lib/speech/browser-speech";
import { pickNaturalVoice, waitForSpeechVoices } from "@/lib/speech/voice-selection";

let bgmNodes: {
  ctx: AudioContext;
  master: GainNode;
  interval: ReturnType<typeof setInterval> | null;
} | null = null;

let speakSession = 0;
let speechPrimed = false;
let iosKeepAliveTimer: ReturnType<typeof setInterval> | null = null;
let currentAudio: HTMLAudioElement | null = null;

async function ensureAudioContext(): Promise<AudioContext | null> {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();
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

function stopCurrentAudio(): void {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.src = "";
  currentAudio = null;
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
    void bgmNodes.ctx.close();
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
  await ensureAudioContext();
  speechPrimed = true;

  if (isUnreliableWebSpeech() || !window.speechSynthesis) return;

  await waitForSpeechVoices(2000);
  window.speechSynthesis.resume();

  const unlock = new SpeechSynthesisUtterance(" ");
  unlock.volume = 0.01;
  unlock.rate = 1.5;
  unlock.lang = "en-US";
  window.speechSynthesis.speak(unlock);
}

async function playMp3Blob(blob: Blob): Promise<void> {
  await ensureAudioContext();
  stopCurrentAudio();

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;

    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (currentAudio === audio) currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      if (currentAudio === audio) currentAudio = null;
      reject(new Error("audio play failed"));
    };

    void audio.play().catch(reject);
  });
}

async function speakViaCloudTts(
  text: string,
  mode: "fall" | "success",
  repeat: number,
  session: number
): Promise<boolean> {
  for (let i = 0; i < repeat; i++) {
    if (session !== speakSession) return true;

    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, mode }),
    });

    if (!res.ok) return false;

    const blob = await res.blob();
    await playMp3Blob(blob);

    if (i + 1 < repeat) {
      await new Promise((r) => setTimeout(r, 320));
    }
  }
  return true;
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
): Promise<void> {
  if (typeof window === "undefined" || !text.trim()) return;

  const repeat = mode === "fall" ? 3 : 1;
  const session = ++speakSession;
  stopCurrentAudio();
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  await ensureAudioContext();

  const cloudOk = await speakViaCloudTts(text, mode, repeat, session);
  if (cloudOk && session === speakSession) return;

  if (!isUnreliableWebSpeech()) {
    await speakViaWebSpeech(text, mode, repeat, session);
  }
}

export function stopGameSpeech(): void {
  speakSession += 1;
  stopIosSpeechKeepAlive();
  stopCurrentAudio();
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function prefersCloudGameSpeech(): boolean {
  return isUnreliableWebSpeech();
}

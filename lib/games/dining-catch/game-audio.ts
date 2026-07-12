import {
  isAndroidDevice,
  isMobileDevice,
  isUnreliableWebSpeech,
  isWeChatBrowser,
} from "@/lib/speech/browser-speech";
import { pickNaturalVoice, waitForSpeechVoices } from "@/lib/speech/voice-selection";

const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

let bgmNodes: {
  ctx: AudioContext;
  master: GainNode;
  interval: ReturnType<typeof setInterval> | null;
} | null = null;

let desktopAudioContext: AudioContext | null = null;
let mobileTtsAudio: HTMLAudioElement | null = null;
let mobileUnlockAudio: HTMLAudioElement | null = null;
let desktopTtsAudio: HTMLAudioElement | null = null;

let speakSession = 0;
let speechPrimed = false;
let iosKeepAliveTimer: ReturnType<typeof setInterval> | null = null;

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}

function useMobileNativeAudio(): boolean {
  return isMobileDevice() || isUnreliableWebSpeech();
}

function shouldTryWebSpeechFirst(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (isWeChatBrowser()) return false;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  return false;
}

function createHiddenAudio(id: string): HTMLAudioElement {
  const existing = document.getElementById(id);
  if (existing instanceof HTMLAudioElement) return existing;

  const audio = document.createElement("audio");
  audio.id = id;
  audio.setAttribute("playsinline", "true");
  audio.setAttribute("webkit-playsinline", "true");
  audio.setAttribute("x5-playsinline", "true");
  audio.setAttribute("x5-video-player-type", "h5");
  audio.preload = "auto";
  audio.style.display = "none";
  document.body.appendChild(audio);
  return audio;
}

function getMobileTtsAudio(): HTMLAudioElement | null {
  if (typeof document === "undefined") return null;
  if (!mobileTtsAudio) mobileTtsAudio = createHiddenAudio("dining-catch-tts");
  return mobileTtsAudio;
}

function getMobileUnlockAudio(): HTMLAudioElement | null {
  if (typeof document === "undefined") return null;
  if (!mobileUnlockAudio) mobileUnlockAudio = createHiddenAudio("dining-catch-unlock");
  return mobileUnlockAudio;
}

function getDesktopTtsAudio(): HTMLAudioElement | null {
  if (typeof document === "undefined") return null;
  if (!desktopTtsAudio) desktopTtsAudio = createHiddenAudio("dining-catch-tts-desktop");
  return desktopTtsAudio;
}

function getDesktopAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!desktopAudioContext) {
    const Ctx =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    desktopAudioContext = new Ctx();
  }
  return desktopAudioContext;
}

/** 手机端不用 Web Audio 合成 BGM，避免和 TTS 冲突产生嘶嘶声 */
export function supportsDiningCatchBgm(): boolean {
  return !useMobileNativeAudio();
}

/** 在用户点击时同步解锁（手机只用独立 HTML audio，不碰 Web Audio） */
export function unlockGameAudioSync(): void {
  speechPrimed = true;

  if (useMobileNativeAudio()) {
    const unlock = getMobileUnlockAudio();
    if (!unlock) return;
    unlock.muted = true;
    unlock.src = SILENT_WAV;
    void unlock.play().catch(() => undefined);
    return;
  }

  const ctx = getDesktopAudioContext();
  if (ctx?.state === "suspended") {
    void ctx.resume();
  }
}

async function fetchCloudTtsBlob(
  text: string,
  mode: "fall" | "success"
): Promise<Blob | null> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, mode }),
  });
  if (!res.ok) return null;
  const blob = await res.blob();
  return blob.size > 0 ? blob : null;
}

function waitForHtmlAudioEnd(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const onEnded = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("html audio play failed"));
    };
    const cleanup = () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
  });
}

async function playBlobOnHtmlAudio(
  audio: HTMLAudioElement,
  blob: Blob,
  repeat: number,
  session: number
): Promise<boolean> {
  const url = URL.createObjectURL(blob);

  try {
    for (let i = 0; i < repeat; i++) {
      if (session !== speakSession) return true;

      audio.pause();
      audio.currentTime = 0;
      audio.src = url;
      audio.volume = 1;

      try {
        await audio.play();
      } catch (err) {
        if (isAbortError(err)) continue;
        return false;
      }

      try {
        await waitForHtmlAudioEnd(audio);
      } catch {
        return false;
      }

      if (i + 1 < repeat) {
        await new Promise((r) => setTimeout(r, 520));
      }
    }
    return true;
  } finally {
    URL.revokeObjectURL(url);
    audio.pause();
    audio.removeAttribute("src");
  }
}

async function speakViaMobileHtmlAudio(
  text: string,
  mode: "fall" | "success",
  repeat: number,
  session: number
): Promise<boolean> {
  const audio = getMobileTtsAudio();
  if (!audio) return false;

  const blob = await fetchCloudTtsBlob(text, mode);
  if (!blob || session !== speakSession) return false;

  return playBlobOnHtmlAudio(audio, blob, repeat, session);
}

async function speakViaDesktopHtmlAudio(
  text: string,
  mode: "fall" | "success",
  repeat: number,
  session: number
): Promise<boolean> {
  const audio = getDesktopTtsAudio();
  if (!audio) return false;

  const blob = await fetchCloudTtsBlob(text, mode);
  if (!blob || session !== speakSession) return false;

  return playBlobOnHtmlAudio(audio, blob, repeat, session);
}

function startIosSpeechKeepAlive(): void {
  if (useMobileNativeAudio() || typeof window === "undefined") return;
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

function stopHtmlTtsPlayback(): void {
  for (const audio of [mobileTtsAudio, desktopTtsAudio]) {
    if (!audio) continue;
    audio.pause();
    if (audio.src?.startsWith("blob:")) {
      URL.revokeObjectURL(audio.src);
    }
    audio.removeAttribute("src");
  }
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
  osc.type = "sine";
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
  if (!supportsDiningCatchBgm()) return;

  stopDiningCatchBgm();
  const ctx = getDesktopAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") await ctx.resume();

  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);

  let step = 0;
  let cursor = ctx.currentTime + 0.05;

  const schedule = () => {
    for (let i = 0; i < 4; i++) {
      const note = BGM_MELODY[step % BGM_MELODY.length];
      playTone(ctx, master, note.f, cursor, note.d, 0.2);
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
  if (!supportsDiningCatchBgm()) return;
  if (bgmNodes?.master) {
    bgmNodes.master.gain.value = volume;
  }
}

export async function primeGameSpeech(): Promise<void> {
  unlockGameAudioSync();

  if (useMobileNativeAudio() || !window.speechSynthesis) return;

  const ctx = getDesktopAudioContext();
  if (ctx?.state === "suspended") await ctx.resume();

  await waitForSpeechVoices(2000);
  window.speechSynthesis.resume();

  const unlock = new SpeechSynthesisUtterance(" ");
  unlock.volume = 0.01;
  unlock.rate = 1.5;
  unlock.lang = "en-US";
  window.speechSynthesis.speak(unlock);
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
): Promise<boolean> {
  if (!window.speechSynthesis) return false;

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
        utterance.rate = 1.05;
        utterance.pitch = 1.1;
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
      await new Promise((r) => setTimeout(r, 520));
    }
  }

  if (session === speakSession) {
    stopIosSpeechKeepAlive();
  }

  return session === speakSession;
}

export async function speakGameWord(
  text: string,
  mode: "fall" | "success"
): Promise<boolean> {
  if (typeof window === "undefined" || !text.trim()) return false;

  const repeat = mode === "fall" ? 3 : 1;
  const session = ++speakSession;
  stopHtmlTtsPlayback();
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  if (shouldTryWebSpeechFirst()) {
    const spoke = await speakViaWebSpeech(text, mode, repeat, session);
    if (spoke && session === speakSession) return true;
  }

  if (session !== speakSession) return true;

  if (useMobileNativeAudio()) {
    return speakViaMobileHtmlAudio(text, mode, repeat, session);
  }

  const cloudOk = await speakViaDesktopHtmlAudio(text, mode, repeat, session);
  if (cloudOk && session === speakSession) return true;

  if (session !== speakSession) return true;

  return speakViaWebSpeech(text, mode, repeat, session);
}

export function stopGameSpeech(): void {
  speakSession += 1;
  stopIosSpeechKeepAlive();
  stopHtmlTtsPlayback();
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function prefersCloudGameSpeech(): boolean {
  return isWeChatBrowser() || (isAndroidDevice() && isUnreliableWebSpeech());
}

export function prefetchGameWordAudio(_text: string, _mode: "fall" | "success" = "fall"): void {
  /* 手机端预取容易和播放抢资源，改为点击后再加载 */
}

export function isGameSpeechPrimed(): boolean {
  return speechPrimed;
}

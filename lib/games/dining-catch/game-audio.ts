import { prefersCloudGameTts } from "@/lib/speech/browser-speech";
import {
  pickAmericanFemaleEnglishVoice,
  pickAmericanMaleEnglishVoice,
} from "@/lib/speech/voice-selection";

let bgmNodes: {
  ctx: AudioContext;
  master: GainNode;
  interval: ReturnType<typeof setInterval> | null;
} | null = null;

let cloudTtsAudio: HTMLAudioElement | null = null;
let speakSession = 0;
let audioUnlocked = false;

function getCloudTtsAudio(): HTMLAudioElement | null {
  if (typeof document === "undefined") return null;
  if (!cloudTtsAudio) {
    const audio = document.createElement("audio");
    audio.id = "dining-catch-cloud-tts";
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    audio.setAttribute("x5-playsinline", "true");
    audio.preload = "auto";
    audio.style.display = "none";
    document.body.appendChild(audio);
    cloudTtsAudio = audio;
  }
  return cloudTtsAudio;
}

/** 鸿蒙 / 微信：用户点击时同步解锁 HTML5 音频 */
export function unlockGameAudioSync(): void {
  audioUnlocked = true;
  const audio = getCloudTtsAudio();
  if (!audio) return;
  audio.muted = true;
  audio.src =
    "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
  void audio.play().catch(() => undefined);
  window.setTimeout(() => {
    audio.pause();
    audio.muted = false;
    audio.removeAttribute("src");
  }, 40);
}

export function supportsDiningCatchBgm(): boolean {
  return !prefersCloudGameTts();
}

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
  if (!supportsDiningCatchBgm()) return;

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
  if (!supportsDiningCatchBgm()) return;
  if (bgmNodes?.master) {
    bgmNodes.master.gain.value = volume;
  }
}

function stopCloudTtsPlayback(): void {
  const audio = cloudTtsAudio;
  if (!audio) return;
  audio.onended = null;
  audio.onerror = null;
  audio.pause();
  if (audio.src?.startsWith("blob:")) {
    URL.revokeObjectURL(audio.src);
  }
  audio.removeAttribute("src");
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
      reject(new Error("cloud tts play failed"));
    };
    const cleanup = () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
  });
}

async function speakViaCloudTts(
  text: string,
  mode: "fall" | "success",
  repeat: number,
  session: number
): Promise<boolean> {
  const audio = getCloudTtsAudio();
  if (!audio) return false;

  const blob = await fetchCloudTtsBlob(text, mode);
  if (!blob || session !== speakSession) return false;

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
      } catch {
        return false;
      }

      try {
        await waitForHtmlAudioEnd(audio);
      } catch {
        return false;
      }

      if (i + 1 < repeat) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    return true;
  } finally {
    URL.revokeObjectURL(url);
    if (session === speakSession) {
      audio.pause();
      audio.removeAttribute("src");
    }
  }
}

function beginWebSpeech(
  text: string,
  mode: "fall" | "success",
  repeat: number,
  session: number
): void {
  const femaleVoice = pickAmericanFemaleEnglishVoice();
  const maleVoice = pickAmericanMaleEnglishVoice();

  const speakOnce = (index: number) => {
    if (session !== speakSession) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    if (mode === "fall") {
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      if (femaleVoice) utterance.voice = femaleVoice;
    } else {
      utterance.rate = 1.02;
      utterance.pitch = 0.95;
      if (maleVoice) utterance.voice = maleVoice;
    }

    utterance.onend = () => {
      if (session !== speakSession) return;
      if (index + 1 < repeat) {
        window.setTimeout(() => speakOnce(index + 1), 320);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  speakOnce(0);
}

export function speakGameWord(text: string, mode: "fall" | "success"): void {
  if (typeof window === "undefined" || !text.trim()) return;

  const repeat = mode === "fall" ? 3 : 1;
  const session = ++speakSession;

  if (prefersCloudGameTts()) {
    stopCloudTtsPlayback();
    if (!audioUnlocked) unlockGameAudioSync();
    void speakViaCloudTts(text, mode, repeat, session);
    return;
  }

  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  if (window.speechSynthesis.getVoices().length > 0) {
    beginWebSpeech(text, mode, repeat, session);
    return;
  }

  const onVoicesReady = () => {
    window.speechSynthesis.removeEventListener("voiceschanged", onVoicesReady);
    if (session !== speakSession) return;
    beginWebSpeech(text, mode, repeat, session);
  };

  window.speechSynthesis.addEventListener("voiceschanged", onVoicesReady);
  window.speechSynthesis.getVoices();
}

export function stopGameSpeech(): void {
  speakSession += 1;
  stopCloudTtsPlayback();
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export { prefersCloudGameTts };

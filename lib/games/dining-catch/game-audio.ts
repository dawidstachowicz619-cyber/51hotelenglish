import { pickAmericanFemaleEnglishVoice } from "@/lib/speech/voice-selection";

let bgmNodes: {
  ctx: AudioContext;
  master: GainNode;
  interval: ReturnType<typeof setInterval> | null;
} | null = null;

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

let speakSession = 0;

function beginSpeakGameWord(
  text: string,
  mode: "fall" | "success",
  repeat: number,
  session: number
): void {
  const femaleVoice = pickAmericanFemaleEnglishVoice();
  const successVoice = pickAmericanFemaleEnglishVoice(femaleVoice) ?? femaleVoice;

  const speakOnce = (index: number) => {
    if (session !== speakSession) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    if (mode === "fall") {
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      if (femaleVoice) utterance.voice = femaleVoice;
    } else {
      utterance.rate = 1.05;
      utterance.pitch = 1.15;
      if (successVoice) utterance.voice = successVoice;
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

export function speakGameWord(
  text: string,
  mode: "fall" | "success"
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const repeat = mode === "fall" ? 3 : 1;
  const session = ++speakSession;
  window.speechSynthesis.cancel();

  if (window.speechSynthesis.getVoices().length > 0) {
    beginSpeakGameWord(text, mode, repeat, session);
    return;
  }

  const onVoicesReady = () => {
    window.speechSynthesis.removeEventListener("voiceschanged", onVoicesReady);
    if (session !== speakSession) return;
    beginSpeakGameWord(text, mode, repeat, session);
  };

  window.speechSynthesis.addEventListener("voiceschanged", onVoicesReady);
  window.speechSynthesis.getVoices();
}

export const SPEECH_SPEED_STORAGE_KEY = "51he-speech-speed";

export const SPEECH_SPEED_OPTIONS = [
  { value: 0.75, label: "0.75x 慢" },
  { value: 1, label: "1x 正常" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x 快" },
] as const;

export type SpeechSpeed = (typeof SPEECH_SPEED_OPTIONS)[number]["value"];

export function loadSpeechSpeed(): SpeechSpeed {
  if (typeof window === "undefined") return 1;
  try {
    const raw = localStorage.getItem(SPEECH_SPEED_STORAGE_KEY);
    const n = raw ? parseFloat(raw) : 1;
    return SPEECH_SPEED_OPTIONS.some((o) => o.value === n) ? (n as SpeechSpeed) : 1;
  } catch {
    return 1;
  }
}

export function saveSpeechSpeed(speed: SpeechSpeed): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SPEECH_SPEED_STORAGE_KEY, String(speed));
}

export function clampSpeechRate(rate: number): number {
  return Math.min(2, Math.max(0.5, rate));
}

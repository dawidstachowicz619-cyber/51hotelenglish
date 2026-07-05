let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctx =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
  }
  return audioContext;
}

async function ensureRunning(ctx: AudioContext) {
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

type BellPartial = {
  ratio: number;
  volume: number;
  decay: number;
};

function playBell(
  ctx: AudioContext,
  startAt: number,
  fundamental: number,
  partials: BellPartial[],
  masterVolume = 0.18
) {
  const output = ctx.createGain();
  output.gain.value = masterVolume;
  output.connect(ctx.destination);

  for (const partial of partials) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = fundamental * partial.ratio;
    const begin = startAt;

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, begin);
    gain.gain.setValueAtTime(0.0001, begin);
    gain.gain.linearRampToValueAtTime(partial.volume, begin + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, begin + partial.decay);

    osc.connect(gain);
    gain.connect(output);
    osc.start(begin);
    osc.stop(begin + partial.decay + 0.05);
  }
}

const BELL_PARTIALS: BellPartial[] = [
  { ratio: 1, volume: 1, decay: 0.55 },
  { ratio: 2.01, volume: 0.42, decay: 0.38 },
  { ratio: 3.02, volume: 0.22, decay: 0.28 },
  { ratio: 4.18, volume: 0.1, decay: 0.18 },
];

/** Clear desk-bell ring when the answer is correct */
export function playSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  void ensureRunning(ctx).then(() => {
    const t = ctx.currentTime;
    playBell(ctx, t, 987.77, BELL_PARTIALS, 0.16);
    playBell(ctx, t + 0.11, 1318.51, BELL_PARTIALS, 0.11);
  });
}

/** Soft celebration when finishing a lesson */
export function playLessonCompleteSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  void ensureRunning(ctx).then(() => {
    const t = ctx.currentTime;
    const notes = [987.77, 1174.66, 1318.51, 1567.98];
    notes.forEach((freq, i) => {
      playBell(ctx, t + i * 0.1, freq, BELL_PARTIALS, 0.1 - i * 0.012);
    });
  });
}

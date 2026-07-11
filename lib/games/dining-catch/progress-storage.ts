const STORAGE_KEY = "51he-dining-catch-progress";

export type DiningCatchProgress = {
  completedLevels: number[];
  bestScores: Record<number, number>;
};

function emptyProgress(): DiningCatchProgress {
  return { completedLevels: [], bestScores: {} };
}

export function loadDiningCatchProgress(): DiningCatchProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    return JSON.parse(raw) as DiningCatchProgress;
  } catch {
    return emptyProgress();
  }
}

function saveProgress(progress: DiningCatchProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isDiningCatchLevelUnlocked(level: number): boolean {
  if (level <= 1) return true;
  const progress = loadDiningCatchProgress();
  return progress.completedLevels.includes(level - 1);
}

export function getDiningCatchLevelStatus(
  level: number
): "locked" | "current" | "completed" {
  const progress = loadDiningCatchProgress();
  if (progress.completedLevels.includes(level)) return "completed";
  if (isDiningCatchLevelUnlocked(level)) return "current";
  return "locked";
}

export function completeDiningCatchLevel(level: number, score: number): DiningCatchProgress {
  const progress = loadDiningCatchProgress();
  if (!progress.completedLevels.includes(level)) {
    progress.completedLevels.push(level);
    progress.completedLevels.sort((a, b) => a - b);
  }
  progress.bestScores[level] = Math.max(progress.bestScores[level] ?? 0, score);
  saveProgress(progress);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("dining-catch-updated"));
  }
  return progress;
}

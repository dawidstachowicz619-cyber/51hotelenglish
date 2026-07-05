export type LetterTile = {
  id: string;
  char: string;
};

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function shuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (seed + i * 13) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const EXTRA_LETTERS = "aeiortnslcudpmhgbyfkvwzxqj".split("");

export function buildLetterBank(word: string, exerciseId: string): LetterTile[] {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, "");
  const seed = hashSeed(exerciseId + normalized);
  const wordLetters = normalized.split("");
  const used = new Set(wordLetters);
  const extras: string[] = [];

  for (let i = 0; i < EXTRA_LETTERS.length && extras.length < 4; i++) {
    const letter = EXTRA_LETTERS[(seed + i * 7) % EXTRA_LETTERS.length];
    if (!used.has(letter)) {
      extras.push(letter);
      used.add(letter);
    }
  }

  const tiles: LetterTile[] = [
    ...wordLetters.map((char, index) => ({
      id: `${exerciseId}-w-${index}`,
      char,
    })),
    ...extras.map((char, index) => ({
      id: `${exerciseId}-e-${index}`,
      char,
    })),
  ];

  return shuffle(tiles, seed);
}

export function tilesToWord(selected: LetterTile[]): string {
  return selected.map((tile) => tile.char).join("");
}

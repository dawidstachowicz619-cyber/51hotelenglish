/**
 * 课程与测评配图 — 使用 Unsplash 酒店实景摄影，无卡通人物/第三方 IP 元素
 */

const u = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export function getScenarioImage(id: string, w = 1200): string {
  return u(id, w);
}

export const WORD_IMAGES: Record<string, string> = {
  // legacy ids
  w1: u("photo-1564501049412-61c2a3083791"),
  w2: u("photo-1556742049-0cfed4f6a45d"),
  w3: u("photo-1551882547-ff40c63fe580"),
  w4: u("photo-1578683010236-d716f9a3f461"),
  w5: u("photo-1566073771259-6a8506099945"),
  w6: u("photo-1564501049412-61c2a3083791"),
  w7: u("photo-1563013544-824ae1b704d3"),
  w8: u("photo-1631049307264-da0ec9d70304"),
  w9: u("photo-1598928506311-c55efe01e305"),
  w10: u("photo-1526233940647-66a4fef7d3ab"),
  w11: u("photo-1544161515-4ab6ce6db874"),
  w12: u("photo-1556742049-0cfed4f6a45d"),
  w13: u("photo-1566073771259-6a8506099945"),
  w14: u("photo-1544161515-4ab6ce6db874"),
  w15: u("photo-1506905925346-21bda4d32df4"),
  w16: u("photo-1556742049-0cfed4f6a45d"),
  w17: u("photo-1611892440504-42a792e24d32"),
  w18: u("photo-1566073771259-6a8506099945"),
  w19: u("photo-1556742049-0cfed4f6a45d"),
  w20: u("photo-1564501049412-61c2a3083791"),
  // check-in
  "ci-a2-w1": u("photo-1564501049412-61c2a3083791"),
  "ci-a2-w2": u("photo-1551882547-ff40c63fe580"),
  "ci-a2-w4": u("photo-1563013544-824ae1b704d3"),
  "ci-a2-w5": u("photo-1566073771259-6a8506099945"),
  "ci-b1-w4": u("photo-1631049307264-da0ec9d70304"),
  "ci-b2-w2": u("photo-1611892440504-42a792e24d32"),
  // check-out
  "co-a2-w1": u("photo-1556742049-0cfed4f6a45d"),
  // guest inquiry
  "gi-a1-w1": u("photo-1526233940647-66a4fef7d3ab"),
  "gi-a2-w2": u("photo-1506905925346-21bda4d32df4"),
  // special requests
  "sr-b2-w1": u("photo-1611892440504-42a792e24d32"),
  // vip
  "vg-c1-w1": u("photo-1631049307264-da0ec9d70304"),
};

export const DIALOGUE_IMAGES: Record<string, string> = {
  d1: u("photo-1564501049412-61c2a3083791", 1200),
  d2: u("photo-1556742049-0cfed4f6a45d", 1200),
  d3: u("photo-1611892440504-42a792e24d32", 1200),
  d4: u("photo-1563013544-824ae1b704d3", 1200),
  "ci-a2-d1": u("photo-1564501049412-61c2a3083791", 1200),
  "ci-b1-d1": u("photo-1564501049412-61c2a3083791", 1200),
  "ci-b2-d1": u("photo-1631049307264-da0ec9d70304", 1200),
  "co-a2-d1": u("photo-1556742049-0cfed4f6a45d", 1200),
  "co-b1-d1": u("photo-1556742049-0cfed4f6a45d", 1200),
  "sr-b2-d1": u("photo-1611892440504-42a792e24d32", 1200),
  "ps-b1-d1": u("photo-1563013544-824ae1b704d3", 1200),
  "vg-c1-d1": u("photo-1631049307264-da0ec9d70304", 1200),
  "cm-c1-d1": u("photo-1566073771259-6a8506099945", 1200),
};

export const ORAL_IMAGES: Record<string, string> = {
  "a1-oral-1": u("photo-1564501049412-61c2a3083791", 1200),
  "a2-oral-1": u("photo-1564501049412-61c2a3083791", 1200),
  "b1-oral-1": u("photo-1566073771259-6a8506099945", 1200),
  "b1-oral-2": u("photo-1563013544-824ae1b704d3", 1200),
  "b2-oral-1": u("photo-1611892440504-42a792e24d32", 1200),
  "c1-oral-1": u("photo-1631049307264-da0ec9d70304", 1200),
};

export const ASSESSMENT_VOCAB_IMAGES: Record<string, string> = {
  "a1-mc-1": u("photo-1611892440504-42a792e24d32"),
  "a2-mc-1": u("photo-1556742049-0cfed4f6a45d"),
  "b1-mc-1": u("photo-1526233940647-66a4fef7d3ab"),
  "b2-mc-1": u("photo-1611892440504-42a792e24d32"),
  "c1-mc-1": u("photo-1631049307264-da0ec9d70304"),
};

export function getWordImage(id: string): string | undefined {
  return WORD_IMAGES[id];
}

export function getDialogueImage(id: string): string | undefined {
  return DIALOGUE_IMAGES[id];
}

export function getOralImage(id: string): string | undefined {
  return ORAL_IMAGES[id];
}

export function getAssessmentVocabImage(id: string): string | undefined {
  return ASSESSMENT_VOCAB_IMAGES[id];
}

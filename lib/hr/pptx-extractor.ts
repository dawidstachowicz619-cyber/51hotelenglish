import JSZip from "jszip";

function slideNumber(path: string): number {
  const match = path.match(/slide(\d+)\.xml$/i);
  return match ? parseInt(match[1], 10) : 0;
}

function decodeXmlText(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/** 从 slide XML 中提取所有文本节点（按出现顺序） */
function extractTextFromSlideXml(xml: string): string {
  const parts: string[] = [];
  const regex = /<a:t(?:\s[^>]*)?>([^<]*)<\/a:t>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    const text = decodeXmlText(match[1]).trim();
    if (text) parts.push(text);
  }
  return parts.join("\n").trim();
}

/**
 * 解析 PPTX，按幻灯片顺序返回每页文本。
 * 每页对应生成一节视频课。
 */
export async function extractSlideTextsFromPptx(file: File): Promise<string[]> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slidePaths = Object.keys(zip.files)
    .filter((name) => /ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => slideNumber(a) - slideNumber(b));

  if (slidePaths.length === 0) {
    throw new Error("PPT 中未找到可读取的幻灯片内容，请确认文件未损坏");
  }

  const slides: string[] = [];
  for (const path of slidePaths) {
    const xml = await zip.files[path].async("text");
    const text = extractTextFromSlideXml(xml);
    if (text.length >= 2) slides.push(text);
  }

  if (slides.length === 0) {
    throw new Error("PPT 幻灯片中没有可提取的文字，请添加文字内容后重试");
  }

  return slides;
}

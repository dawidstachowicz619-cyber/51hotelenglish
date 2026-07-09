const DB_NAME = "51he-training-videos";
const STORE = "videos";
const DB_VERSION = 1;
const MAX_VIDEO_MB = 80;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("无法打开视频存储"));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export function trainingVideoRef(moduleId: string): string {
  return `__idb__:${moduleId}`;
}

export function isTrainingVideoRef(url: string | undefined): boolean {
  return !!url?.startsWith("__idb__:");
}

export function moduleIdFromVideoRef(url: string): string {
  return url.replace("__idb__:", "");
}

export async function saveTrainingVideo(moduleId: string, file: File): Promise<string> {
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
    throw new Error(`视频文件过大，请控制在 ${MAX_VIDEO_MB}MB 以内`);
  }

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(file, moduleId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("视频保存失败"));
  });
  db.close();
  return trainingVideoRef(moduleId);
}

export async function resolveTrainingVideoUrl(
  videoRef: string | undefined
): Promise<string | null> {
  if (!videoRef) return null;
  if (videoRef.startsWith("http://") || videoRef.startsWith("https://")) {
    return videoRef;
  }
  if (!isTrainingVideoRef(videoRef)) return videoRef;

  const moduleId = moduleIdFromVideoRef(videoRef);
  const db = await openDb();
  const file = await new Promise<File | Blob | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(moduleId);
    req.onsuccess = () => resolve(req.result as File | Blob | undefined);
    req.onerror = () => reject(req.error ?? new Error("读取视频失败"));
  });
  db.close();

  if (!file) return null;
  return URL.createObjectURL(file);
}

export async function deleteTrainingVideo(moduleId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(moduleId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("删除视频失败"));
  });
  db.close();
}

export const SUPPORTED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v"] as const;

export function isVideoFile(name: string): boolean {
  const lower = name.toLowerCase();
  return SUPPORTED_VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

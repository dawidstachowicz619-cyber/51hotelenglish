export const CATALOG_LINK_PROGRESS_KEY = "51he-catalog-link-progress";

export type CatalogLinkProgress = Record<string, boolean>;

export function loadCatalogLinkProgress(): CatalogLinkProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CATALOG_LINK_PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as CatalogLinkProgress) : {};
  } catch {
    return {};
  }
}

export function saveCatalogLinkProgress(progress: CatalogLinkProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CATALOG_LINK_PROGRESS_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event("catalog-course-updated"));
}

export function isCatalogLinkCourseCompleted(courseId: string): boolean {
  return Boolean(loadCatalogLinkProgress()[courseId]);
}

export function markCatalogLinkCourseVisited(courseId: string): void {
  const map = loadCatalogLinkProgress();
  map[courseId] = true;
  saveCatalogLinkProgress(map);
}

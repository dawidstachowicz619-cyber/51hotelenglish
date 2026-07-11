import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { isCloudStorageEnabled } from "@/lib/db/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  EXPORT_RETENTION_VERSIONS,
  EXPORT_STORAGE_BUCKET,
  type LearningExportRowCounts,
} from "@/lib/exports/build-learning-export";

export type LearningExportSnapshot = {
  id: string;
  exportDate: string;
  storagePath: string;
  sizeBytes: number;
  rowCounts: LearningExportRowCounts;
  createdAt: string;
};

const LOCAL_EXPORT_DIR = path.join(process.cwd(), "data", "learning-exports");
const LOCAL_INDEX_FILE = path.join(LOCAL_EXPORT_DIR, "index.json");

type LocalExportIndex = LearningExportSnapshot[];

async function readLocalIndex(): Promise<LocalExportIndex> {
  try {
    const raw = await readFile(LOCAL_INDEX_FILE, "utf8");
    return JSON.parse(raw) as LocalExportIndex;
  } catch {
    return [];
  }
}

async function writeLocalIndex(entries: LocalExportIndex): Promise<void> {
  await mkdir(LOCAL_EXPORT_DIR, { recursive: true });
  await writeFile(LOCAL_INDEX_FILE, JSON.stringify(entries, null, 2), "utf8");
}

function rowCountsFromJson(value: unknown): LearningExportRowCounts {
  const counts = (value ?? {}) as Partial<LearningExportRowCounts>;
  return {
    hotels: counts.hotels ?? 0,
    employees: counts.employees ?? 0,
    learnerProfiles: counts.learnerProfiles ?? 0,
    learningProgress: counts.learningProgress ?? 0,
    learningHistory: counts.learningHistory ?? 0,
    hotelHrPermissions: counts.hotelHrPermissions ?? 0,
    hrAdminAccounts: counts.hrAdminAccounts ?? 0,
  };
}

function sortByNewest(entries: LearningExportSnapshot[]): LearningExportSnapshot[] {
  return [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function saveLearningExport(
  snapshotId: string,
  exportDate: string,
  storagePath: string,
  buffer: Buffer,
  rowCounts: LearningExportRowCounts
): Promise<LearningExportSnapshot> {
  if (isCloudStorageEnabled()) {
    const db = getSupabaseAdmin();
    const { error: uploadError } = await db.storage
      .from(EXPORT_STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: "application/zip",
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { data, error } = await db
      .from("learning_export_snapshots")
      .insert({
        id: snapshotId,
        export_date: exportDate,
        storage_path: storagePath,
        size_bytes: buffer.byteLength,
        row_counts: rowCounts,
      })
      .select("*")
      .single();
    if (error) throw error;

    return {
      id: data.id,
      exportDate: data.export_date,
      storagePath: data.storage_path,
      sizeBytes: Number(data.size_bytes),
      rowCounts: rowCountsFromJson(data.row_counts),
      createdAt: data.created_at,
    };
  }

  await mkdir(LOCAL_EXPORT_DIR, { recursive: true });
  const fileName = `${snapshotId}.zip`;
  const filePath = path.join(LOCAL_EXPORT_DIR, fileName);
  await writeFile(filePath, buffer);

  const snapshot: LearningExportSnapshot = {
    id: snapshotId,
    exportDate,
    storagePath: fileName,
    sizeBytes: buffer.byteLength,
    rowCounts,
    createdAt: new Date().toISOString(),
  };

  const index = sortByNewest([snapshot, ...(await readLocalIndex())]);
  await writeLocalIndex(index);
  return snapshot;
}

export async function listLearningExports(
  limit = EXPORT_RETENTION_VERSIONS
): Promise<LearningExportSnapshot[]> {
  if (isCloudStorageEnabled()) {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("learning_export_snapshots")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      exportDate: row.export_date,
      storagePath: row.storage_path,
      sizeBytes: Number(row.size_bytes),
      rowCounts: rowCountsFromJson(row.row_counts),
      createdAt: row.created_at,
    }));
  }

  const index = await readLocalIndex();
  return sortByNewest(index).slice(0, limit);
}

export async function readLearningExport(snapshotId: string): Promise<Buffer | null> {
  if (isCloudStorageEnabled()) {
    const db = getSupabaseAdmin();
    const { data: row, error } = await db
      .from("learning_export_snapshots")
      .select("storage_path")
      .eq("id", snapshotId)
      .maybeSingle();
    if (error) throw error;
    if (!row) return null;

    const { data, error: downloadError } = await db.storage
      .from(EXPORT_STORAGE_BUCKET)
      .download(row.storage_path);
    if (downloadError) throw downloadError;
    return Buffer.from(await data.arrayBuffer());
  }

  const index = await readLocalIndex();
  const entry = index.find((e) => e.id === snapshotId);
  if (!entry) return null;

  try {
    const filePath = path.join(LOCAL_EXPORT_DIR, entry.storagePath);
    return await readFile(filePath);
  } catch {
    return null;
  }
}

export async function pruneLearningExports(
  retentionVersions = EXPORT_RETENTION_VERSIONS
): Promise<number> {
  if (isCloudStorageEnabled()) {
    const db = getSupabaseAdmin();
    const { data: allRows, error } = await db
      .from("learning_export_snapshots")
      .select("id, storage_path")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const rows = allRows ?? [];
    if (rows.length <= retentionVersions) return 0;

    const staleRows = rows.slice(retentionVersions);
    const paths = staleRows.map((row) => row.storage_path);
    const ids = staleRows.map((row) => row.id);

    const { error: removeError } = await db.storage.from(EXPORT_STORAGE_BUCKET).remove(paths);
    if (removeError) throw removeError;

    const { error: deleteError } = await db
      .from("learning_export_snapshots")
      .delete()
      .in("id", ids);
    if (deleteError) throw deleteError;

    return staleRows.length;
  }

  const index = sortByNewest(await readLocalIndex());
  if (index.length <= retentionVersions) return 0;

  const keep = index.slice(0, retentionVersions);
  const stale = index.slice(retentionVersions);
  const removed = stale.length;

  for (const entry of stale) {
    try {
      await rm(path.join(LOCAL_EXPORT_DIR, entry.storagePath), { force: true });
    } catch {
      // ignore missing files
    }
  }

  await writeLocalIndex(keep);
  return removed;
}

export async function getLearningExportSnapshot(
  snapshotId: string
): Promise<LearningExportSnapshot | null> {
  const list = await listLearningExports(EXPORT_RETENTION_VERSIONS);
  return list.find((entry) => entry.id === snapshotId) ?? null;
}

export function formatExportSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function createLocalSnapshotId(): string {
  return randomUUID();
}

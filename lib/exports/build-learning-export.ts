import { randomUUID } from "node:crypto";

import JSZip from "jszip";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const EXPORT_RETENTION_VERSIONS = 30;
export const EXPORT_STORAGE_BUCKET = "learning-exports";

export type LearningExportRowCounts = {
  hotels: number;
  employees: number;
  learnerProfiles: number;
  learningProgress: number;
  learningHistory: number;
  hotelHrPermissions: number;
  hrAdminAccounts: number;
};

export type LearningExportManifest = {
  version: 1;
  snapshotId: string;
  exportDate: string;
  createdAt: string;
  timezone: "Asia/Shanghai";
  description: string;
  rowCounts: LearningExportRowCounts;
};

export function getExportDateString(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
}

export function createSnapshotId(): string {
  return randomUUID();
}

export function exportZipPath(snapshotId: string): string {
  return `versions/${snapshotId}/learning-data.zip`;
}

function sanitizeHrAccounts(
  rows: Array<Record<string, unknown>>
): Array<Record<string, unknown>> {
  return rows.map(({ password_hash: _passwordHash, ...rest }) => rest);
}

export async function buildLearningExportZip(
  snapshotId: string,
  exportDate: string
): Promise<{ buffer: Buffer; rowCounts: LearningExportRowCounts; storagePath: string }> {
  const db = getSupabaseAdmin();

  const [
    hotelsRes,
    employeesRes,
    profilesRes,
    progressRes,
    historyRes,
    permissionsRes,
    accountsRes,
  ] = await Promise.all([
    db.from("hotels").select("*").order("name"),
    db.from("employees").select("*").order("updated_at", { ascending: false }),
    db.from("learner_profiles").select("*").order("updated_at", { ascending: false }),
    db.from("learning_progress").select("*").order("updated_at", { ascending: false }),
    db.from("learning_history").select("*").order("occurred_at", { ascending: false }),
    db.from("hotel_hr_permissions").select("*"),
    db.from("hr_admin_accounts").select("*").order("username"),
  ]);

  const errors = [
    hotelsRes.error,
    employeesRes.error,
    profilesRes.error,
    progressRes.error,
    historyRes.error,
    permissionsRes.error,
    accountsRes.error,
  ].filter(Boolean);
  if (errors.length > 0) {
    throw errors[0];
  }

  const rowCounts: LearningExportRowCounts = {
    hotels: hotelsRes.data?.length ?? 0,
    employees: employeesRes.data?.length ?? 0,
    learnerProfiles: profilesRes.data?.length ?? 0,
    learningProgress: progressRes.data?.length ?? 0,
    learningHistory: historyRes.data?.length ?? 0,
    hotelHrPermissions: permissionsRes.data?.length ?? 0,
    hrAdminAccounts: accountsRes.data?.length ?? 0,
  };

  const createdAt = new Date().toISOString();
  const manifest: LearningExportManifest = {
    version: 1,
    snapshotId,
    exportDate,
    createdAt,
    timezone: "Asia/Shanghai",
    description: "网站全量学习数据最新快照",
    rowCounts,
  };

  const zip = new JSZip();
  const pretty = (data: unknown) => JSON.stringify(data, null, 2);

  zip.file("manifest.json", pretty(manifest));
  zip.file("hotels.json", pretty(hotelsRes.data ?? []));
  zip.file("employees.json", pretty(employeesRes.data ?? []));
  zip.file("learner_profiles.json", pretty(profilesRes.data ?? []));
  zip.file("learning_progress.json", pretty(progressRes.data ?? []));
  zip.file("learning_history.json", pretty(historyRes.data ?? []));
  zip.file("hotel_hr_permissions.json", pretty(permissionsRes.data ?? []));
  zip.file(
    "hr_admin_accounts.json",
    pretty(sanitizeHrAccounts((accountsRes.data ?? []) as Array<Record<string, unknown>>))
  );

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return {
    buffer,
    rowCounts,
    storagePath: exportZipPath(snapshotId),
  };
}

import { NextResponse } from "next/server";

import { isCloudStorageEnabled } from "@/lib/db/config";
import { EXPORT_RETENTION_VERSIONS } from "@/lib/exports/build-learning-export";
import { formatExportSize, listLearningExports } from "@/lib/exports/export-storage";
import { runDailyLearningExport } from "@/lib/exports/run-daily-export";

function assertPlatformAdmin(request: Request): boolean {
  return (
    request.headers.get("x-platform-admin-password") ===
    process.env.PLATFORM_ADMIN_PASSWORD
  );
}

export async function GET(request: Request) {
  if (!assertPlatformAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const exports = await listLearningExports(EXPORT_RETENTION_VERSIONS);
    return NextResponse.json({
      exports: exports.map((entry, index) => ({
        ...entry,
        versionNo: index + 1,
        sizeLabel: formatExportSize(entry.sizeBytes),
      })),
      retentionVersions: EXPORT_RETENTION_VERSIONS,
      cloudEnabled: isCloudStorageEnabled(),
      autoSchedule: "0 2 * * *",
      timezone: "Asia/Shanghai",
    });
  } catch (err) {
    console.error("[platform/learning-exports GET]", err);
    return NextResponse.json({ error: "Failed to list exports" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!assertPlatformAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudStorageEnabled()) {
    return NextResponse.json(
      { error: "请先开启云端存储（Supabase）后再打包学习数据" },
      { status: 503 }
    );
  }

  try {
    const result = await runDailyLearningExport();
    return NextResponse.json({
      ok: true,
      snapshot: {
        ...result.snapshot,
        sizeLabel: formatExportSize(result.snapshot.sizeBytes),
      },
      prunedCount: result.prunedCount,
    });
  } catch (err) {
    console.error("[platform/learning-exports POST]", err);
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

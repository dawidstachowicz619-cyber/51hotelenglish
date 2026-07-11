import { NextResponse } from "next/server";

import { isCloudStorageEnabled } from "@/lib/db/config";
import { runDailyLearningExport } from "@/lib/exports/run-daily-export";

function assertCronAuth(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!assertCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudStorageEnabled()) {
    return NextResponse.json(
      { error: "Cloud storage disabled; cron export skipped" },
      { status: 503 }
    );
  }

  try {
    const result = await runDailyLearningExport();
    return NextResponse.json({
      ok: true,
      exportDate: result.snapshot.exportDate,
      snapshotId: result.snapshot.id,
      sizeBytes: result.snapshot.sizeBytes,
      prunedCount: result.prunedCount,
    });
  } catch (err) {
    console.error("[cron/learning-data-export]", err);
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}

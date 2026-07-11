import { NextResponse } from "next/server";

import { verifyPlatformAdminRequest } from "@/lib/auth/platform-admin-auth";
import { readLearningExport } from "@/lib/exports/export-storage";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  if (!verifyPlatformAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const buffer = await readLearningExport(id);
    if (!buffer) {
      return NextResponse.json({ error: "Export not found" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="learning-data-${id.slice(0, 8)}.zip"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[platform/learning-exports/[id] GET]", err);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}

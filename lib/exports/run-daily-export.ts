import {
  buildLearningExportZip,
  createSnapshotId,
  EXPORT_RETENTION_VERSIONS,
  getExportDateString,
} from "@/lib/exports/build-learning-export";
import {
  pruneLearningExports,
  saveLearningExport,
  type LearningExportSnapshot,
} from "@/lib/exports/export-storage";

export type RunLearningExportResult = {
  snapshot: LearningExportSnapshot;
  prunedCount: number;
};

export async function runDailyLearningExport(): Promise<RunLearningExportResult> {
  const snapshotId = createSnapshotId();
  const exportDate = getExportDateString();
  const { buffer, rowCounts, storagePath } = await buildLearningExportZip(
    snapshotId,
    exportDate
  );
  const snapshot = await saveLearningExport(
    snapshotId,
    exportDate,
    storagePath,
    buffer,
    rowCounts
  );
  const prunedCount = await pruneLearningExports(EXPORT_RETENTION_VERSIONS);

  return {
    snapshot,
    prunedCount,
  };
}

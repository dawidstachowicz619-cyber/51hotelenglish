"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, Download, Loader2, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  downloadLearningExport,
  fetchLearningExports,
  triggerLearningExportNow,
  type LearningExportListItem,
} from "@/lib/hr/platform-api";
import { cn } from "@/lib/utils";

export function LearningDataExportPanel() {
  const [exports, setExports] = useState<LearningExportListItem[]>([]);
  const [retentionVersions, setRetentionVersions] = useState(30);
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [packing, setPacking] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await fetchLearningExports();
    if (!data) {
      setError("加载失败，请确认已使用平台管理员密码登录");
      setExports([]);
      setLoading(false);
      return;
    }
    setExports(data.exports);
    setRetentionVersions(data.retentionVersions);
    setCloudEnabled(data.cloudEnabled);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handlePackNow = async () => {
    setPacking(true);
    setMessage(null);
    setError(null);
    const result = await triggerLearningExportNow();
    setPacking(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setMessage(`已生成最新全量快照 ${result.exportDate}（${result.sizeLabel}）`);
    await refresh();
  };

  const handleDownload = async (entry: LearningExportListItem) => {
    setDownloadingId(entry.id);
    setError(null);
    try {
      await downloadLearningExport(entry.id, entry.exportDate);
    } catch {
      setError(`下载版本 #${entry.versionNo} 失败`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="card-elevated mt-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <Archive className="size-5" />
            </span>
            <h2 className="font-display text-lg text-foreground">学习数据打包下载</h2>
          </div>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            每天自动打包网站全量学习数据最新快照，仅保留最新 {retentionVersions} 个版本。
            {cloudEnabled
              ? " 云端模式每日凌晨 2:00（北京时间）自动执行。"
              : " 本地开发模式可手动打包。"}
          </p>
        </div>
        <Button onClick={handlePackNow} disabled={packing || loading}>
          {packing ? <Loader2 className="size-4 animate-spin" /> : <Package className="size-4" />}
          立即打包
        </Button>
      </div>

      {message && (
        <p className="mt-4 rounded-lg bg-primary-light/40 px-3 py-2 text-sm font-bold text-primary">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red/10 px-3 py-2 text-sm font-bold text-red">{error}</p>
      )}

      <div className="mt-5 overflow-hidden rounded-xl border-2 border-border">
        <div className="grid grid-cols-[0.6fr_1.1fr_0.7fr_0.8fr_auto] gap-2 border-b-2 border-border bg-muted/40 px-4 py-2 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
          <span>版本</span>
          <span>打包时间</span>
          <span>大小</span>
          <span>学员记录</span>
          <span className="text-right">操作</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm font-semibold text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            加载中…
          </div>
        ) : exports.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm font-semibold text-muted-foreground">
            暂无打包记录，点击「立即打包」生成第一份全量快照。
          </div>
        ) : (
          <ul>
            {exports.map((entry) => (
              <li
                key={entry.id}
                className="grid grid-cols-[0.6fr_1.1fr_0.7fr_0.8fr_auto] items-center gap-2 border-b border-border px-4 py-3 last:border-b-0"
              >
                <p className="text-sm font-extrabold text-accent">#{entry.versionNo}</p>
                <div>
                  <p className="text-sm font-extrabold text-foreground">
                    {new Date(entry.createdAt).toLocaleString("zh-CN", {
                      timeZone: "Asia/Shanghai",
                    })}
                  </p>
                  <p className="text-[10px] font-semibold text-muted-foreground">
                    数据截至 {entry.exportDate}
                  </p>
                </div>
                <p className="text-sm font-bold text-foreground">{entry.sizeLabel}</p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {entry.rowCounts.learnerProfiles} 学员 · {entry.rowCounts.learningHistory} 记录
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn("justify-self-end")}
                  disabled={downloadingId === entry.id}
                  onClick={() => void handleDownload(entry)}
                >
                  {downloadingId === entry.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  下载
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-3 text-[11px] font-semibold text-muted-foreground">
        每个版本为打包时刻的全量学习数据快照；超过 {retentionVersions} 个版本时，最早版本自动删除。
      </p>
    </div>
  );
}

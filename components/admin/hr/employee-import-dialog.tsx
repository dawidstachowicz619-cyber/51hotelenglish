"use client";

import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  downloadEmployeeTemplate,
  parseEmployeeExcel,
  rowsToEmployeeRecords,
} from "@/lib/hr/excel-import";
import {
  cloudImportEmployees,
  fetchHotelEmployees,
} from "@/lib/hr/roster-api";
import type { EmployeeImportResult } from "@/lib/types/hr-admin";

type EmployeeImportDialogProps = {
  hotel: string;
  open: boolean;
  onClose: () => void;
  onImported: () => void;
};

export function EmployeeImportDialog({
  hotel,
  open,
  onClose,
  onImported,
}: EmployeeImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmployeeImportResult | null>(null);

  if (!open) return null;

  const handleFile = async (file: File) => {
    setLoading(true);
    setResult(null);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const rows = parseEmployeeExcel(buffer);
      if (rows.length === 0) {
        setResult({
          imported: [],
          errors: [{ rowNumber: 0, message: "Excel 中没有可导入的数据行" }],
          skipped: 0,
        });
        return;
      }
      const existing = await fetchHotelEmployees(hotel);
      const existingPhones = new Set(existing.map((e) => e.phone).filter(Boolean));
      const parsed = rowsToEmployeeRecords(
        hotel,
        rows,
        existingPhones
      );
      const count = await cloudImportEmployees(hotel, parsed.imported);
      setResult({ ...parsed, imported: parsed.imported.slice(0, count) });
      if (count > 0) onImported();
    } catch {
      setResult({
        imported: [],
        errors: [{ rowNumber: 0, message: "文件解析失败，请使用 .xlsx 格式" }],
        skipped: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFileName(null);
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card-elevated max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl text-foreground">
              Excel 导入员工
            </h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              按「部门、职位、姓名、手机号」批量导入本酒店员工
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
            aria-label="关闭"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center">
          <FileSpreadsheet className="mx-auto size-10 text-primary" />
          <p className="mt-3 text-sm font-bold text-foreground">
            支持 .xlsx / .xls
          </p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            表头：部门 · 职位 · 姓名 · 手机号
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
          <Button
            className="mt-4"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" />
            {loading ? "导入中…" : "选择 Excel 文件"}
          </Button>
          {fileName && (
            <p className="mt-2 text-xs font-semibold text-muted-foreground">
              已选：{fileName}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadEmployeeTemplate(hotel)}>
            <Download className="size-4" />
            下载导入模板
          </Button>
        </div>

        <div className="mt-4 rounded-xl bg-muted/40 p-4 text-xs font-semibold leading-relaxed text-muted-foreground">
          <p className="font-extrabold text-foreground">部门可填：</p>
          <p className="mt-1">
            酒店接待、礼宾部、预订部、客服中心、其他部门
          </p>
          <p className="mt-2 font-extrabold text-foreground">说明：</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>手机号须为 11 位中国大陆号码</li>
            <li>重复手机号会自动跳过</li>
            <li>导入后员工状态为「新学员」，待首次登录学习</li>
          </ul>
        </div>

        {result && (
          <div className="mt-4 space-y-2 rounded-xl border-2 border-border p-4">
            <p className="text-sm font-extrabold text-primary">
              成功导入 {result.imported.length} 人
              {result.skipped > 0 && `，跳过重复 ${result.skipped} 人`}
            </p>
            {result.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto">
                <p className="text-xs font-extrabold text-red">导入错误：</p>
                <ul className="mt-1 space-y-1 text-xs font-semibold text-muted-foreground">
                  {result.errors.map((err) => (
                    <li key={`${err.rowNumber}-${err.message}`}>
                      {err.rowNumber > 0 ? `第 ${err.rowNumber} 行：` : ""}
                      {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <Button variant="ghost" className="mt-6 w-full" onClick={handleClose}>
          关闭
        </Button>
      </div>
    </div>
  );
}

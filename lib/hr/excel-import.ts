import * as XLSX from "xlsx";

import { getTotalFrontDeskLessons } from "@/lib/hr/lesson-totals";
import {
  findDepartmentByName,
  getHotelDepartments,
} from "@/lib/hr/hotel-department-storage";
import type {
  EmployeeDepartment,
  EmployeeImportResult,
  EmployeeImportRow,
  EmployeeLearningRecord,
} from "@/lib/types/hr-admin";

const HEADER_ALIASES: Record<string, keyof Omit<EmployeeImportRow, "rowNumber">> = {
  部门: "department",
  所属部门: "department",
  department: "department",
  dept: "department",
  职位: "position",
  岗位: "position",
  职务: "position",
  position: "position",
  job: "position",
  title: "position",
  姓名: "name",
  名字: "name",
  员工姓名: "name",
  name: "name",
  手机号: "phone",
  手机: "phone",
  电话: "phone",
  联系电话: "phone",
  phone: "phone",
  mobile: "phone",
};

const DEPARTMENT_ALIASES: Record<string, EmployeeDepartment> = {
  酒店接待: "reception",
  酒店接待岗位: "reception",
  酒店接待岗位英语: "reception",
  接待: "reception",
  前台: "reception",
  前台接待: "reception",
  reception: "reception",
  "front desk": "reception",
  礼宾: "concierge",
  礼宾部: "concierge",
  礼宾部英语: "concierge",
  concierge: "concierge",
  预订: "reservations",
  预订部: "reservations",
  预订部英语: "reservations",
  reservations: "reservations",
  reservation: "reservations",
  客服: "customer-service",
  客服中心: "customer-service",
  客服中心英语: "customer-service",
  宾客关系: "customer-service",
  "customer service": "customer-service",
  "customer-service": "customer-service",
  其他: "other",
  其他部门: "other",
  other: "other",
};

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function normalizePhone(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s|-/g, "")
    .replace(/^\+86/, "");
}

function parseDepartment(raw: string, hotel: string): EmployeeDepartment | null {
  const matched = findDepartmentByName(hotel, raw);
  if (matched) return matched.id;

  const key = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (DEPARTMENT_ALIASES[raw.trim()]) return DEPARTMENT_ALIASES[raw.trim()];
  if (DEPARTMENT_ALIASES[key]) return DEPARTMENT_ALIASES[key];
  for (const [alias, dept] of Object.entries(DEPARTMENT_ALIASES)) {
    if (key.includes(alias.toLowerCase().replace(/\s+/g, ""))) return dept;
  }
  return null;
}

function mapHeaderRow(row: unknown[]): Partial<Record<keyof Omit<EmployeeImportRow, "rowNumber">, number>> {
  const map: Partial<Record<keyof Omit<EmployeeImportRow, "rowNumber">, number>> = {};
  row.forEach((cell, index) => {
    const normalized = normalizeHeader(cell);
    for (const [alias, field] of Object.entries(HEADER_ALIASES)) {
      if (normalized === alias.toLowerCase().replace(/\s+/g, "")) {
        map[field] = index;
      }
    }
  });
  return map;
}

export function parseEmployeeExcel(buffer: ArrayBuffer): EmployeeImportRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
  }) as unknown[][];

  if (rows.length === 0) return [];

  const headerMap = mapHeaderRow(rows[0]);
  const hasHeader =
    headerMap.department !== undefined &&
    headerMap.position !== undefined &&
    headerMap.name !== undefined &&
    headerMap.phone !== undefined;

  const dataRows = hasHeader ? rows.slice(1) : rows;
  const deptIdx = hasHeader ? headerMap.department! : 0;
  const positionIdx = hasHeader ? headerMap.position! : 1;
  const nameIdx = hasHeader ? headerMap.name! : 2;
  const phoneIdx = hasHeader ? headerMap.phone! : 3;

  const parsed: EmployeeImportRow[] = [];
  dataRows.forEach((row, i) => {
    const department = String(row[deptIdx] ?? "").trim();
    const position = String(row[positionIdx] ?? "").trim();
    const name = String(row[nameIdx] ?? "").trim();
    const phone = normalizePhone(row[phoneIdx]);
    if (!department && !position && !name && !phone) return;
    parsed.push({
      department,
      position,
      name,
      phone,
      rowNumber: hasHeader ? i + 2 : i + 1,
    });
  });

  return parsed;
}

export function rowsToEmployeeRecords(
  hotel: string,
  rows: EmployeeImportRow[],
  existingPhones: Set<string>
): EmployeeImportResult {
  const totalLessons = getTotalFrontDeskLessons();
  const imported: EmployeeLearningRecord[] = [];
  const errors: EmployeeImportResult["errors"] = [];
  const seenPhones = new Set<string>();
  let skipped = 0;

  for (const row of rows) {
    if (!row.name) {
      errors.push({ rowNumber: row.rowNumber, message: "姓名为空" });
      continue;
    }
    if (!row.position) {
      errors.push({ rowNumber: row.rowNumber, message: "职位为空" });
      continue;
    }
    if (!row.phone) {
      errors.push({ rowNumber: row.rowNumber, message: "手机号为空" });
      continue;
    }
    if (!/^1\d{10}$/.test(row.phone)) {
      errors.push({
        rowNumber: row.rowNumber,
        message: `手机号格式不正确：${row.phone}`,
      });
      continue;
    }
    const department = parseDepartment(row.department, hotel);
    if (!department) {
      const names = getHotelDepartments(hotel).map((d) => d.name).join("、");
      errors.push({
        rowNumber: row.rowNumber,
        message: `无法识别部门「${row.department}」，请使用本酒店部门：${names}`,
      });
      continue;
    }
    if (seenPhones.has(row.phone) || existingPhones.has(row.phone)) {
      skipped += 1;
      continue;
    }
    seenPhones.add(row.phone);

    imported.push({
      id: `import-${row.phone}`,
      nickname: row.name,
      phone: row.phone,
      hotel,
      department,
      role: row.position,
      cefrLevel: "未测评",
      assessmentScore: 0,
      passedAssessmentLevels: [],
      totalPoints: 0,
      weeklyPoints: 0,
      completedLessons: 0,
      totalLessons,
      courseProgressPercent: 0,
      lastActiveAt: new Date().toISOString(),
      status: "new",
      isImported: true,
    });
  }

  return { imported, errors, skipped };
}

export function downloadEmployeeTemplate(hotel: string): void {
  const depts = getHotelDepartments(hotel);
  const sampleRoles = ["前台接待", "礼宾专员", "预订员", "宾客关系专员"];
  const rows: string[][] = [["部门", "职位", "姓名", "手机号"]];
  depts.forEach((d, i) => {
    rows.push([
      d.name,
      sampleRoles[i % sampleRoles.length] ?? "员工",
      `示例员工${i + 1}`,
      `1380013800${i + 1}`,
    ]);
  });
  if (rows.length === 1) {
    rows.push(["酒店接待", "前台接待", "张三", "13800138001"]);
  }
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "员工名单");
  XLSX.writeFile(workbook, "员工导入模板.xlsx");
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { EmployeeLearningRecordView } from "@/components/admin/hr/employee-learning-record-view";
import { ensureMainAccountLearningSeed } from "@/lib/course/main-account-learning-seed";
import { buildCurrentEmployeeRecord } from "@/lib/hr/current-employee-record";
import { Button } from "@/components/ui/button";

export function ProfileLearningRecordPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (ensureMainAccountLearningSeed()) {
      setRefreshKey((k) => k + 1);
    }
  }, []);

  const employee = useMemo(() => {
    void refreshKey;
    return buildCurrentEmployeeRecord();
  }, [refreshKey]);

  if (!employee) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-display text-xl text-foreground">请先完善个人档案</p>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          填写昵称与酒店信息后，即可查看学习记录统计
        </p>
        <Button className="mt-6" asChild>
          <Link href="/profile">前往个人档案</Link>
        </Button>
      </div>
    );
  }

  return (
    <EmployeeLearningRecordView
      employee={employee}
      backHref="/profile"
      backLabel="返回个人档案"
    />
  );
}

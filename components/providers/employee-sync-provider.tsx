"use client";

import { useEffect } from "react";

import { syncCurrentUserToRoster } from "@/lib/hr/sync-employee";
import { tryLinkHrRegistration } from "@/lib/hr/hr-registration";

export function EmployeeSyncProvider() {
  useEffect(() => {
    tryLinkHrRegistration();
    syncCurrentUserToRoster();

    const sync = () => syncCurrentUserToRoster();
    window.addEventListener("points-updated", sync);
    window.addEventListener("course-progress-updated", sync);
    window.addEventListener("assessment-updated", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("points-updated", sync);
      window.removeEventListener("course-progress-updated", sync);
      window.removeEventListener("assessment-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return null;
}

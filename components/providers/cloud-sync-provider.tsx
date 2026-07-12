"use client";

import { useEffect } from "react";

import {
  isCloudSyncActive,
  pullFromCloud,
  scheduleCloudPush,
} from "@/lib/storage/cloud-sync";
import { syncCurrentUserToRoster } from "@/lib/hr/sync-employee";
import { tryLinkHrRegistration } from "@/lib/hr/hr-registration";

const SYNC_EVENTS = [
  "points-updated",
  "course-progress-updated",
  "assessment-updated",
  "trial-lessons-updated",
  "hr-registration-updated",
  "employee-meta-updated",
  "russian-daily-updated",
  "russian-campaign-updated",
  "russian-items-progress-updated",
  "employee-training-updated",
  "learning-history-updated",
  "catalog-course-updated",
] as const;

export function CloudSyncProvider() {
  useEffect(() => {
    if (!isCloudSyncActive()) return;

    void pullFromCloud().then(() => {
      tryLinkHrRegistration();
      syncCurrentUserToRoster();
    });

    const onChange = () => {
      scheduleCloudPush();
      syncCurrentUserToRoster();
    };

    for (const event of SYNC_EVENTS) {
      window.addEventListener(event, onChange);
    }

    const onFocus = () => void pullFromCloud();
    const onAuth = () => void pullFromCloud();
    window.addEventListener("focus", onFocus);
    window.addEventListener("auth-linked", onAuth);

    return () => {
      for (const event of SYNC_EVENTS) {
        window.removeEventListener(event, onChange);
      }
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("auth-linked", onAuth);
    };
  }, []);

  return null;
}

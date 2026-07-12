import { isCloudSyncActive } from "@/lib/storage/cloud-sync";
import {
  addHotelTrainingModule,
  getHotelTrainingModules,
  removeHotelTrainingModule,
  replaceHotelTrainingModules,
  updateHotelTrainingModule,
} from "@/lib/hr/training-storage";
import type { HrTrainingModule } from "@/lib/types/hr-training";

async function parseModules(res: Response): Promise<HrTrainingModule[] | null> {
  if (!res.ok) return null;
  const data = (await res.json()) as { modules?: HrTrainingModule[] };
  return Array.isArray(data.modules) ? data.modules : null;
}

export async function fetchHotelTrainingModules(hotel: string): Promise<HrTrainingModule[]> {
  if (!isCloudSyncActive()) return getHotelTrainingModules(hotel);

  const local = getHotelTrainingModules(hotel);
  const query =
    local.length > 0 ? `?localModules=${encodeURIComponent(JSON.stringify(local))}` : "";

  const res = await fetch(`/api/hr/training-modules${query}`, { credentials: "include" });
  const modules = await parseModules(res);
  if (!modules) return local;

  replaceHotelTrainingModules(hotel, modules);
  return modules;
}

export async function cloudAddHotelTrainingModule(
  module: HrTrainingModule
): Promise<HrTrainingModule> {
  if (!isCloudSyncActive()) {
    addHotelTrainingModule(module);
    return module;
  }

  const res = await fetch("/api/hr/training-modules", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "add", module }),
  });
  const data = (await res.json()) as { module?: HrTrainingModule };
  if (res.ok && data.module) {
    addHotelTrainingModule(data.module);
    return data.module;
  }
  addHotelTrainingModule(module);
  return module;
}

export async function cloudRemoveHotelTrainingModule(
  hotel: string,
  moduleId: string
): Promise<void> {
  if (!isCloudSyncActive()) {
    removeHotelTrainingModule(hotel, moduleId);
    return;
  }

  const res = await fetch("/api/hr/training-modules", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "remove", moduleId }),
  });
  if (res.ok) removeHotelTrainingModule(hotel, moduleId);
}

export async function cloudUpdateHotelTrainingModule(
  hotel: string,
  moduleId: string,
  patch: Partial<Pick<HrTrainingModule, "department" | "phase" | "ask" | "title">>
): Promise<HrTrainingModule | null> {
  if (!isCloudSyncActive()) {
    return updateHotelTrainingModule(hotel, moduleId, patch);
  }

  const res = await fetch("/api/hr/training-modules", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update", moduleId, patch }),
  });
  const data = (await res.json()) as { module?: HrTrainingModule };
  if (res.ok && data.module) {
    updateHotelTrainingModule(hotel, moduleId, patch);
    return data.module;
  }
  return updateHotelTrainingModule(hotel, moduleId, patch);
}

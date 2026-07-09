import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type { HrTrainingModule } from "@/lib/types/hr-training";
import { HR_TRAINING_STORAGE_KEY } from "@/lib/types/hr-training";

type TrainingStore = Record<string, HrTrainingModule[]>;

function loadStore(): TrainingStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(HR_TRAINING_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TrainingStore) : {};
  } catch {
    return {};
  }
}

function saveStore(store: TrainingStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HR_TRAINING_STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("hr-training-updated"));
}

export function getHotelTrainingModules(hotel: string): HrTrainingModule[] {
  const key = hotel.trim();
  return (loadStore()[key] ?? []).sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export function addHotelTrainingModule(module: HrTrainingModule): void {
  const key = module.hotel.trim();
  const store = loadStore();
  const list = store[key] ?? [];
  store[key] = [module, ...list];
  saveStore(store);
}

export function removeHotelTrainingModule(hotel: string, moduleId: string): void {
  const key = hotel.trim();
  const store = loadStore();
  store[key] = (store[key] ?? []).filter((m) => m.id !== moduleId);
  saveStore(store);
}

export function updateHotelTrainingModule(
  hotel: string,
  moduleId: string,
  patch: Partial<Pick<HrTrainingModule, "department" | "phase" | "ask" | "title">>
): HrTrainingModule | null {
  const key = hotel.trim();
  const store = loadStore();
  const list = store[key] ?? [];
  let updated: HrTrainingModule | null = null;
  store[key] = list.map((m) => {
    if (m.id !== moduleId) return m;
    updated = { ...m, ...patch, id: moduleId };
    return updated;
  });
  if (updated) saveStore(store);
  return updated;
}

export function getHotelTrainingModuleById(
  hotel: string,
  moduleId: string
): HrTrainingModule | undefined {
  return getHotelTrainingModules(hotel).find((m) => m.id === moduleId);
}

export function getTrainingModulesForEmployee(
  hotel: string,
  department: EmployeeDepartment
): HrTrainingModule[] {
  return getHotelTrainingModules(hotel).filter(
    (m) => m.department === "all" || m.department === department
  );
}

/** 演示酒店默认培训（无上传时展示能力） */
export function getDemoTrainingModules(hotel: string): HrTrainingModule[] {
  if (getHotelTrainingModules(hotel).length > 0) return [];
  if (hotel === "51HotelEnglish") return [];

  const now = new Date().toISOString();
  return [
    {
      id: "demo-training-onboarding",
      hotel,
      title: "新员工入职服务礼仪",
      fileName: "onboarding-service.docx",
      uploadedAt: now,
      department: "all",
      phase: "onboarding",
      ask: "attitude",
      slideCount: 3,
      questionCount: 3,
      slides: [
        {
          id: "slide-1",
          order: 1,
          title: "微笑与问候",
          narration:
            "客人抵达时，应在 3 秒内主动问候，保持微笑与眼神交流。标准用语：Good morning, welcome to our hotel.",
          bullets: [
            "3 秒内主动问候",
            "保持微笑与眼神交流",
            "使用标准英语问候语",
          ],
          durationSec: 25,
        },
        {
          id: "slide-2",
          order: 2,
          title: "仪容仪表标准",
          narration:
            "制服应整洁无皱，工牌佩戴于左胸。头发整齐，妆容淡雅。禁止在工作区域使用手机处理私人事务。",
          bullets: ["制服整洁", "工牌左胸", "工作区不用私人手机"],
          durationSec: 22,
        },
        {
          id: "slide-3",
          order: 3,
          title: "首问负责制",
          narration:
            "客人提出需求时，即使不是本岗位职责，也应积极回应或引导至正确部门，不可推诿。",
          bullets: ["不推诿", "积极回应", "引导至正确部门"],
          durationSec: 20,
        },
      ],
      questions: [
        {
          id: "q-1",
          prompt: "客人抵达时，应在多长时间内主动问候？",
          options: ["3 秒内", "30 秒内", "1 分钟内", "不必主动问候"],
          correctAnswer: "3 秒内",
          explanation: "标准服务要求 3 秒内主动问候。",
        },
        {
          id: "q-2",
          prompt: "工牌应佩戴于？",
          options: ["左胸", "右胸", "腰带", "不必佩戴"],
          correctAnswer: "左胸",
          explanation: "工牌标准佩戴位置为左胸。",
        },
        {
          id: "q-3",
          prompt: "首问负责制的核心是？",
          options: [
            "不推诿，积极回应或引导",
            "只处理本部门事务",
            "让客人自行寻找",
            "转接电话即可",
          ],
          correctAnswer: "不推诿，积极回应或引导",
          explanation: "首问负责：即使非本职也要积极协助。",
        },
      ],
    },
  ];
}

export function getVisibleTrainingModules(
  hotel: string,
  department: EmployeeDepartment
): HrTrainingModule[] {
  const uploaded = getTrainingModulesForEmployee(hotel, department);
  if (uploaded.length > 0) return uploaded;
  return getDemoTrainingModules(hotel).filter(
    (m) => m.department === "all" || m.department === department
  );
}

import type {
  EmployeeDepartment,
  EmployeeLearningRecord,
} from "@/lib/types/hr-admin";
import { PROBATION_DAYS_DEFAULT } from "@/lib/types/learning-record";
import { getTotalFrontDeskLessons } from "@/lib/hr/lesson-totals";

const TOTAL_LESSONS = getTotalFrontDeskLessons();

type DemoSeed = {
  id: string;
  nickname: string;
  hotel: string;
  department: EmployeeDepartment;
  role: string;
  cefrLevel: string;
  assessmentScore: number;
  passedLevels: string[];
  totalPoints: number;
  weeklyPoints: number;
  progressRatio: number;
  daysAgoActive: number;
  daysSinceHire: number;
};

const DEMO_SEEDS: DemoSeed[] = [
  {
    id: "demo-m1",
    nickname: "陈晓雯",
    hotel: "上海浦东丽思卡尔顿",
    department: "reception",
    role: "前台主管",
    cefrLevel: "C1",
    assessmentScore: 96,
    passedLevels: ["A1", "A2", "B1", "B2", "C1"],
    totalPoints: 3280,
    weeklyPoints: 420,
    progressRatio: 0.72,
    daysAgoActive: 0,
    daysSinceHire: 120,
  },
  {
    id: "demo-m1-2",
    nickname: "刘思琪",
    hotel: "上海浦东丽思卡尔顿",
    department: "concierge",
    role: "礼宾专员",
    cefrLevel: "B2",
    assessmentScore: 92,
    passedLevels: ["A1", "A2", "B1", "B2"],
    totalPoints: 2890,
    weeklyPoints: 380,
    progressRatio: 0.58,
    daysAgoActive: 1,
    daysSinceHire: 75,
  },
  {
    id: "demo-m1-3",
    nickname: "David Wu",
    hotel: "上海浦东丽思卡尔顿",
    department: "reservations",
    role: "预订员",
    cefrLevel: "B1",
    assessmentScore: 88,
    passedLevels: ["A1", "A2", "B1"],
    totalPoints: 2450,
    weeklyPoints: 290,
    progressRatio: 0.41,
    daysAgoActive: 2,
    daysSinceHire: 60,
  },
  {
    id: "demo-m1-4",
    nickname: "林小雨",
    hotel: "上海浦东丽思卡尔顿",
    department: "customer-service",
    role: "宾客关系",
    cefrLevel: "B1",
    assessmentScore: 85,
    passedLevels: ["A1", "A2", "B1"],
    totalPoints: 1980,
    weeklyPoints: 210,
    progressRatio: 0.35,
    daysAgoActive: 3,
    daysSinceHire: 45,
  },
  {
    id: "demo-m1-5",
    nickname: "张磊",
    hotel: "上海浦东丽思卡尔顿",
    department: "reception",
    role: "前台接待",
    cefrLevel: "A2",
    assessmentScore: 78,
    passedLevels: ["A1", "A2"],
    totalPoints: 1120,
    weeklyPoints: 180,
    progressRatio: 0.22,
    daysAgoActive: 5,
    daysSinceHire: 55,
  },
  {
    id: "demo-m1-6",
    nickname: "王静",
    hotel: "上海浦东丽思卡尔顿",
    department: "concierge",
    role: "礼宾部实习生",
    cefrLevel: "A1",
    assessmentScore: 0,
    passedLevels: [],
    totalPoints: 320,
    weeklyPoints: 120,
    progressRatio: 0.05,
    daysAgoActive: 1,
    daysSinceHire: 14,
  },
  {
    id: "demo-m2",
    nickname: "James Liu",
    hotel: "北京国贸大酒店",
    department: "reception",
    role: "Front Office Manager",
    cefrLevel: "B2",
    assessmentScore: 94,
    passedLevels: ["A1", "A2", "B1", "B2"],
    totalPoints: 2950,
    weeklyPoints: 350,
    progressRatio: 0.55,
    daysAgoActive: 0,
    daysSinceHire: 200,
  },
  {
    id: "demo-m2-2",
    nickname: "马丽",
    hotel: "北京国贸大酒店",
    department: "customer-service",
    role: "客服主管",
    cefrLevel: "B2",
    assessmentScore: 90,
    passedLevels: ["A1", "A2", "B1", "B2"],
    totalPoints: 2680,
    weeklyPoints: 310,
    progressRatio: 0.48,
    daysAgoActive: 2,
    daysSinceHire: 88,
  },
  {
    id: "demo-m2-3",
    nickname: "Tom Zhang",
    hotel: "北京国贸大酒店",
    department: "reservations",
    role: "预订主管",
    cefrLevel: "B1",
    assessmentScore: 86,
    passedLevels: ["A1", "A2", "B1"],
    totalPoints: 2210,
    weeklyPoints: 240,
    progressRatio: 0.38,
    daysAgoActive: 4,
    daysSinceHire: 70,
  },
];

function seedToRecord(seed: DemoSeed): EmployeeLearningRecord {
  const completed = Math.round(TOTAL_LESSONS * seed.progressRatio);
  const lastActive = new Date();
  lastActive.setDate(lastActive.getDate() - seed.daysAgoActive);

  const hire = new Date();
  hire.setDate(hire.getDate() - seed.daysSinceHire);
  const probationEnd = new Date(hire);
  probationEnd.setDate(probationEnd.getDate() + PROBATION_DAYS_DEFAULT);

  let status: EmployeeLearningRecord["status"] = "active";
  if (seed.daysAgoActive > 7) status = "inactive";
  if (seed.totalPoints < 500) status = "new";

  return {
    id: seed.id,
    nickname: seed.nickname,
    phone: "",
    hotel: seed.hotel,
    department: seed.department,
    role: seed.role,
    cefrLevel: seed.cefrLevel,
    assessmentScore: seed.assessmentScore,
    passedAssessmentLevels: seed.passedLevels,
    totalPoints: seed.totalPoints,
    weeklyPoints: seed.weeklyPoints,
    completedLessons: completed,
    totalLessons: TOTAL_LESSONS,
    courseProgressPercent: Math.round((completed / TOTAL_LESSONS) * 100),
    lastActiveAt: lastActive.toISOString(),
    hireDate: hire.toISOString(),
    probationEndDate: probationEnd.toISOString(),
    status,
  };
}

export function getDemoEmployeesForHotel(hotel: string): EmployeeLearningRecord[] {
  return DEMO_SEEDS.filter((s) => s.hotel === hotel).map(seedToRecord);
}

export function getAvailableHotels(): string[] {
  const hotels = new Set(DEMO_SEEDS.map((s) => s.hotel));
  return [...hotels].sort();
}

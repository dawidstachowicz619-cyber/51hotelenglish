import type {
  LeaderboardEntry,
  LeaderboardPeriod,
  UserPointsProfile,
} from "@/lib/types/points";

/** 演示用排行榜数据（生产环境应来自服务端） */
const MOCK_PLAYERS: Omit<LeaderboardEntry, "rank" | "isCurrentUser">[] = [
  { id: "m1", nickname: "陈晓雯", hotel: "上海浦东丽思卡尔顿", points: 3280, cefrLevel: "C1" },
  { id: "m1-2", nickname: "刘思琪", hotel: "上海浦东丽思卡尔顿", points: 2890, cefrLevel: "B2" },
  { id: "m1-3", nickname: "David Wu", hotel: "上海浦东丽思卡尔顿", points: 2450, cefrLevel: "B1" },
  { id: "m1-4", nickname: "林小雨", hotel: "上海浦东丽思卡尔顿", points: 1980, cefrLevel: "B1" },
  { id: "m2", nickname: "James Liu", hotel: "北京国贸大酒店", points: 2950, cefrLevel: "B2" },
  { id: "m2-2", nickname: "马丽", hotel: "北京国贸大酒店", points: 2680, cefrLevel: "B2" },
  { id: "m2-3", nickname: "Tom Zhang", hotel: "北京国贸大酒店", points: 2210, cefrLevel: "B1" },
  { id: "m3", nickname: "王芳", hotel: "广州四季酒店", points: 2710, cefrLevel: "B2" },
  { id: "m3-2", nickname: "黄伟", hotel: "广州四季酒店", points: 2340, cefrLevel: "B1" },
  { id: "m3-3", nickname: "Amy Lin", hotel: "广州四季酒店", points: 1890, cefrLevel: "B1" },
  { id: "m4", nickname: "张浩然", hotel: "深圳华侨城洲际", points: 2480, cefrLevel: "B2" },
  { id: "m4-2", nickname: "何静", hotel: "深圳华侨城洲际", points: 2150, cefrLevel: "B1" },
  { id: "m4-3", nickname: "Kevin Zhao", hotel: "深圳华侨城洲际", points: 1720, cefrLevel: "A2" },
  { id: "m5", nickname: "Lily Chen", hotel: "杭州西湖国宾馆", points: 2200, cefrLevel: "B1" },
  { id: "m5-2", nickname: "周明", hotel: "杭州西湖国宾馆", points: 1860, cefrLevel: "B1" },
  { id: "m5-3", nickname: "Jessica Wang", hotel: "杭州西湖国宾馆", points: 1540, cefrLevel: "A2" },
  { id: "m6", nickname: "赵明", hotel: "成都瑞吉酒店", points: 1980, cefrLevel: "B1" },
  { id: "m6-2", nickname: "杨帆", hotel: "成都瑞吉酒店", points: 1650, cefrLevel: "A2" },
  { id: "m7", nickname: "孙悦", hotel: "南京金陵饭店", points: 1750, cefrLevel: "B1" },
  { id: "m7-2", nickname: "Chris Li", hotel: "南京金陵饭店", points: 1420, cefrLevel: "A2" },
  { id: "m8", nickname: "Michael Wang", hotel: "厦门康莱德酒店", points: 1520, cefrLevel: "A2" },
  { id: "m8-2", nickname: "郑晓", hotel: "厦门康莱德酒店", points: 1180, cefrLevel: "A2" },
  { id: "m9", nickname: "周婷", hotel: "重庆来福士洲际", points: 1280, cefrLevel: "A2" },
  { id: "m9-2", nickname: "刘强", hotel: "重庆来福士洲际", points: 980, cefrLevel: "A1" },
  { id: "m10", nickname: "李强", hotel: "西安W酒店", points: 1050, cefrLevel: "A2" },
  { id: "m10-2", nickname: "Grace Xu", hotel: "西安W酒店", points: 820, cefrLevel: "A1" },
  { id: "m11", nickname: "Anna Zhang", hotel: "青岛海天大酒店", points: 890, cefrLevel: "A1" },
  { id: "m12", nickname: "吴磊", hotel: "苏州金鸡湖凯宾斯基", points: 720, cefrLevel: "A1" },
];

function scaleWeeklyPoints(alltime: number, seed: number): number {
  const ratio = 0.25 + (seed % 50) / 100;
  return Math.round(alltime * ratio);
}

function normalizeHotel(hotel: string): string {
  return hotel.trim();
}

function rankEntries(
  entries: LeaderboardEntry[]
): LeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => b.points - a.points);
  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    badge:
      index === 0
        ? "gold"
        : index === 1
          ? "silver"
          : index === 2
            ? "bronze"
            : undefined,
  }));
}

function buildEntries(
  players: Omit<LeaderboardEntry, "rank" | "isCurrentUser">[],
  profile: UserPointsProfile,
  period: LeaderboardPeriod
): LeaderboardEntry[] {
  const mockEntries: LeaderboardEntry[] = players.map((p, i) => ({
    ...p,
    rank: 0,
    points:
      period === "weekly"
        ? scaleWeeklyPoints(p.points, i * 7 + 3)
        : p.points,
  }));

  const userPoints =
    period === "weekly" ? profile.weeklyPoints : profile.totalPoints;

  const userEntry: LeaderboardEntry = {
    rank: 0,
    id: profile.userId,
    nickname: profile.nickname || "我",
    hotel: profile.hotel || "51HotelEnglish",
    points: userPoints,
    cefrLevel: profile.cefrLevel,
    isCurrentUser: true,
  };

  return rankEntries([...mockEntries, userEntry]);
}

export function buildLeaderboard(
  profile: UserPointsProfile,
  period: LeaderboardPeriod
): LeaderboardEntry[] {
  return buildEntries(MOCK_PLAYERS, profile, period);
}

export function buildHotelLeaderboard(
  profile: UserPointsProfile,
  period: LeaderboardPeriod
): LeaderboardEntry[] {
  const hotel = normalizeHotel(profile.hotel);
  if (!hotel) return [];

  const colleagues = MOCK_PLAYERS.filter(
    (p) => normalizeHotel(p.hotel) === hotel
  );

  return buildEntries(colleagues, profile, period);
}

export function getUserRank(
  profile: UserPointsProfile,
  period: LeaderboardPeriod
): number {
  const board = buildLeaderboard(profile, period);
  return board.find((e) => e.isCurrentUser)?.rank ?? board.length;
}

export function getHotelRank(
  profile: UserPointsProfile,
  period: LeaderboardPeriod
): number {
  const board = buildHotelLeaderboard(profile, period);
  if (board.length === 0) return 0;
  return board.find((e) => e.isCurrentUser)?.rank ?? board.length;
}

export function getHotelMemberCount(profile: UserPointsProfile): number {
  const hotel = normalizeHotel(profile.hotel);
  if (!hotel) return 0;
  return buildHotelLeaderboard(profile, "alltime").length;
}

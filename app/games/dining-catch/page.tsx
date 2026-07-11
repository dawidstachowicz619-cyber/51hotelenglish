import type { Metadata } from "next";
import type { Viewport } from "next";

import { DiningCatchHub } from "@/components/games/dining-catch/dining-catch-hub";

export const metadata: Metadata = {
  title: "餐饮单词大闯关 | 51HotelEnglish",
  description: "餐饮单词大闯关：单词从上往下掉落，可调快慢，点击正确单词显示对号并加分。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1a1a2e",
};

export default function DiningCatchPage() {
  return <DiningCatchHub />;
}

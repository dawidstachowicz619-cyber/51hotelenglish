import type { Metadata } from "next";
import { Nunito } from "next/font/google";

import "./globals.css";

import { EmployeeSyncProvider } from "@/components/providers/employee-sync-provider";
import { CloudSyncProvider } from "@/components/providers/cloud-sync-provider";
import {
  HrRegistrationProvider,
  HrTrialBanner,
} from "@/components/learning/hr-registration-prompt";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "51HotelEnglish | 酒店英语学习平台",
  description:
    "专为酒店从业者打造的场景化英语培训平台。前厅、餐饮、客房英语课程，AI 模拟真实客诉陪练，像玩游戏一样轻松学。",
  keywords: [
    "酒店英语",
    "hospitality English",
    "前厅英语",
    "餐饮英语",
    "客房英语",
    "AI 陪练",
  ],
  openGraph: {
    title: "51HotelEnglish | 酒店英语，轻松开练",
    description: "场景课程 + AI 陪练，轻松高效地学习酒店英语",
    url: "https://51hotelenglish.com",
    siteName: "51HotelEnglish",
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={nunito.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <EmployeeSyncProvider />
        <CloudSyncProvider />
        <HrRegistrationProvider />
        <HrTrialBanner />
        {children}
      </body>
    </html>
  );
}

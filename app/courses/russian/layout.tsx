import type { Metadata, Viewport } from "next";

import { RussianMobileShell } from "@/components/courses/russian/russian-mobile-shell";

export const metadata: Metadata = {
  title: "酒店俄语 | 51HotelEnglish",
  description: "手机 H5 学习酒店俄语，图卡、打卡、闯关，微信与 Safari 均可使用。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "酒店俄语",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0039A6",
};

export default function RussianCourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RussianMobileShell>{children}</RussianMobileShell>;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";

import { HrCourseLockBanner, HrCourseLockOverlay } from "@/components/learning/hr-course-lock";
import { cn } from "@/lib/utils";

type RussianMobileShellProps = {
  children: React.ReactNode;
};

const SUB_ROUTES: Record<string, string> = {
  "/courses/russian/campaign": "闯关学习",
  "/courses/russian/daily": "每日打卡",
  "/courses/russian/room-items": "客房物品",
  "/courses/russian/dining-items": "餐饮物品",
};

export function RussianMobileShell({ children }: RussianMobileShellProps) {
  const pathname = usePathname();
  const isHub = pathname === "/courses/russian";
  const title = isHub ? "酒店俄语" : (SUB_ROUTES[pathname] ?? "酒店俄语");
  const backHref = isHub ? "/courses" : "/courses/russian";

  return (
    <div className="russian-h5 min-h-[100dvh] bg-gradient-to-b from-[#FFF5F5] to-white">
      <header className="sticky top-0 z-40 border-b border-[#0039A6]/10 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-lg items-center justify-between px-3">
          <Link
            href={backHref}
            className="flex size-10 items-center justify-center rounded-full text-[#0039A6] active:bg-[#0039A6]/10"
            aria-label="返回"
          >
            <ChevronLeft className="size-6" strokeWidth={2.5} />
          </Link>
          <h1 className="text-base font-extrabold text-foreground">{title}</h1>
          <Link
            href="/courses/russian"
            className={cn(
              "flex size-10 items-center justify-center rounded-full text-[#0039A6] active:bg-[#0039A6]/10",
              isHub && "pointer-events-none opacity-0"
            )}
            aria-label="俄语首页"
          >
            <Home className="size-5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <HrCourseLockBanner className="mb-4" />
        <HrCourseLockOverlay>{children}</HrCourseLockOverlay>
      </main>
    </div>
  );
}

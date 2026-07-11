"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

type DiningCatchMobileShellProps = {
  children: React.ReactNode;
  title?: string;
  backHref?: string;
  onBack?: () => void;
};

export function DiningCatchMobileShell({
  children,
  title = "餐饮单词大闯关",
  backHref = "/courses",
  onBack,
}: DiningCatchMobileShellProps) {
  const pathname = usePathname();

  return (
    <div className="dining-catch-h5 flex min-h-[100dvh] justify-center bg-[#1a1a2e]">
      <div className="dining-catch-phone relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 shadow-2xl">
        <header className="z-30 shrink-0 border-b border-white/60 bg-white/90 px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-md">
          <div className="flex h-11 items-center justify-between">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="flex size-10 items-center justify-center rounded-full text-[#0039A6] active:bg-[#0039A6]/10"
                aria-label="返回"
              >
                <ChevronLeft className="size-6" strokeWidth={2.5} />
              </button>
            ) : (
              <Link
                href={backHref}
                className="flex size-10 items-center justify-center rounded-full text-[#0039A6] active:bg-[#0039A6]/10"
                aria-label="返回"
              >
                <ChevronLeft className="size-6" strokeWidth={2.5} />
              </Link>
            )}
            <h1 className="text-sm font-extrabold text-foreground">{title}</h1>
            <div className="size-10" aria-hidden />
          </div>
        </header>

        <main
          key={pathname}
          className="flex min-h-0 flex-1 flex-col overflow-hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { Lock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  isHrRegisteredUser,
  notifyLearningBlocked,
} from "@/lib/hr/hr-registration";
import { HR_COURSE_LOCK_HINT } from "@/lib/types/learning-gate";
import { cn } from "@/lib/utils";

const lockSurfaceClass =
  "border-amber-400/80 bg-amber-50 text-amber-950 shadow-[0_2px_0_0_rgba(217,119,6,0.12)]";
const lockHintClass = "text-xs font-bold text-amber-900";
const lockIconClass = "text-amber-700";
const lockDarkSurfaceClass =
  "border-white/45 text-white shadow-[0_4px_0_0_rgba(0,0,0,0.18)]";
const lockDarkHintClass = "text-xs font-bold text-white/90";
const lockDarkIconClass = "text-white/90";

function isDarkLockedButton(className?: string, variant?: string): boolean {
  if (variant === "outline" && !className?.match(/\bbg-(?!white)/)) {
    return false;
  }
  if (!className) return false;
  return (
    /bg-gradient|from-\[|to-\[/.test(className) ||
    /\bbg-(?:primary|secondary|\[#)/.test(className)
  );
}

export function useHrCourseAccess() {
  const [canLearn, setCanLearn] = useState(true);

  const refresh = useCallback(() => {
    setCanLearn(isHrRegisteredUser());
  }, []);

  useEffect(() => {
    refresh();
    const events = [
      "hr-registration-updated",
      "hr-registration-required",
      "points-updated",
      "trial-lessons-updated",
    ] as const;
    for (const e of events) window.addEventListener(e, refresh);
    return () => {
      for (const e of events) window.removeEventListener(e, refresh);
    };
  }, [refresh]);

  const requestAccess = useCallback(() => {
    notifyLearningBlocked();
  }, []);

  return { canLearn, requestAccess, refresh };
}

export function LockedCourseHint({
  className,
  onDark,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 leading-snug",
        onDark ? lockDarkHintClass : lockHintClass,
        className
      )}
    >
      <Lock
        className={cn(
          "size-3.5 shrink-0",
          onDark ? lockDarkIconClass : lockIconClass
        )}
        aria-hidden
      />
      {HR_COURSE_LOCK_HINT}
    </span>
  );
}

type CourseAccessButtonProps = {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
  /** 移动端占满宽度；桌面端保持自适应，避免挤压同行内容 */
  fullWidth?: boolean;
  disabled?: boolean;
};

function widthClass(fullWidth?: boolean) {
  return fullWidth ? "w-full md:w-auto md:min-w-[10.5rem]" : undefined;
}

export function CourseAccessButton({
  href,
  onClick,
  children,
  className,
  variant = "default",
  size = "default",
  fullWidth,
  disabled,
}: CourseAccessButtonProps) {
  const { canLearn, requestAccess } = useHrCourseAccess();

  if (canLearn && !disabled) {
    if (href) {
      return (
        <Button
          asChild
          variant={variant}
          size={size}
          className={cn(widthClass(fullWidth), className)}
        >
          <Link href={href} onClick={onClick}>
            {children}
          </Link>
        </Button>
      );
    }
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(widthClass(fullWidth), className)}
        onClick={onClick}
      >
        {children}
      </Button>
    );
  }

  const onDark = isDarkLockedButton(className, variant);

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className={cn(
        "h-auto min-h-10 flex-col gap-1.5 border-2 border-dashed px-4 py-3 normal-case tracking-normal",
        onDark ? lockDarkSurfaceClass : lockSurfaceClass,
        widthClass(fullWidth),
        className
      )}
      onClick={requestAccess}
    >
      <span className="inline-flex items-center gap-2">
        <Lock
          className={cn(
            "size-4 shrink-0",
            onDark ? lockDarkIconClass : lockIconClass
          )}
          aria-hidden
        />
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-extrabold",
            onDark
              ? "text-white [&_svg]:text-white"
              : "text-amber-950 [&_svg]:text-amber-800"
          )}
        >
          {children}
        </span>
      </span>
      <LockedCourseHint onDark={onDark} />
    </Button>
  );
}

export function HrCourseLockBanner({ className }: { className?: string }) {
  const { canLearn } = useHrCourseAccess();
  if (canLearn) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border-2 border-dashed px-3.5 py-3",
        lockSurfaceClass,
        className
      )}
    >
      <Lock className={cn("mt-0.5 size-4 shrink-0", lockIconClass)} aria-hidden />
      <p className={cn("leading-relaxed", lockHintClass)}>
        {HR_COURSE_LOCK_HINT}
      </p>
    </div>
  );
}

export function HrCourseLockOverlay({ children }: { children: React.ReactNode }) {
  const { canLearn, requestAccess } = useHrCourseAccess();
  if (canLearn) return <>{children}</>;

  return (
    <div className="relative min-h-[12rem]">
      <div aria-hidden className="pointer-events-none select-none opacity-35 blur-[0.5px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-start justify-center bg-white/75 px-4 pt-10 backdrop-blur-[1px]">
        <button
          type="button"
          onClick={requestAccess}
          className={cn(
            "flex max-w-xs flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-5 py-6 text-center",
            lockSurfaceClass
          )}
        >
          <Lock className={cn("size-8", lockIconClass)} aria-hidden />
          <span className="mt-1 text-sm font-extrabold text-amber-950">课程暂未开通</span>
          <LockedCourseHint className="text-center" />
        </button>
      </div>
    </div>
  );
}

export function guardCourseAction(canLearn: boolean, requestAccess: () => void): boolean {
  if (canLearn) return true;
  requestAccess();
  return false;
}

"use client";

import { cn } from "@/lib/utils";

type HotelMascotProps = {
  className?: string;
  celebrating?: boolean;
  jumping?: boolean;
  size?: "default" | "large";
  showLabel?: boolean;
};

export function HotelMascot({
  className,
  celebrating,
  jumping,
  size = "default",
  showLabel = true,
}: HotelMascotProps) {
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <svg
        viewBox="0 0 120 140"
        className={cn(
          "drop-shadow-lg transition-transform duration-300",
          size === "large" ? "h-36 w-36" : "h-28 w-28 sm:h-32 sm:w-32",
          jumping && "dining-catch-mascot-jump",
          celebrating && !jumping && "animate-bounce"
        )}
        aria-hidden
      >
        <ellipse cx="60" cy="128" rx="34" ry="8" fill="#000" opacity="0.12" />
        <rect x="38" y="88" width="44" height="36" rx="10" fill="#1CB0F6" />
        <rect x="44" y="94" width="32" height="22" rx="6" fill="#fff" opacity="0.9" />
        <path d="M48 88 L60 78 L72 88" fill="#0039A6" />
        <circle cx="60" cy="52" r="26" fill="#FFD6A8" />
        <ellipse cx="60" cy="34" rx="28" ry="12" fill="#3D2314" />
        <circle cx="50" cy="50" r="4" fill="#2D1810" />
        <circle cx="70" cy="50" r="4" fill="#2D1810" />
        <circle cx="51" cy="49" r="1.5" fill="#fff" />
        <circle cx="71" cy="49" r="1.5" fill="#fff" />
        <path
          d={celebrating ? "M48 62 Q60 72 72 62" : "M50 60 Q60 66 70 60"}
          stroke="#C45C3E"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="28" y="92" width="14" height="28" rx="7" fill="#FFD6A8" />
        <rect x="78" y="92" width="14" height="28" rx="7" fill="#FFD6A8" />
        <rect x="46" y="118" width="12" height="16" rx="4" fill="#2D3748" />
        <rect x="62" y="118" width="12" height="16" rx="4" fill="#2D3748" />
        <rect x="54" y="72" width="12" height="8" rx="2" fill="#E53E3E" />
        <text x="60" y="78" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="bold">
          HOTEL
        </text>
      </svg>
      {showLabel && (
        <p className="mt-1 text-xs font-extrabold text-[#0039A6]">酒店小帮手</p>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Sprout, X } from "lucide-react";

import {
  StudentProfileMenu,
  StudentProfileMobileCard,
} from "@/components/layout/student-profile-menu";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/assessment", label: "水平测评" },
  { href: "/courses", label: "场景课程" },
  { href: "/courses/russian", label: "酒店俄语" },
  { href: "/leaderboard", label: "排行榜" },
  { href: "/about", label: "关于我们" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b-2 transition-all duration-300",
        scrolled
          ? "border-border bg-white/95 shadow-sm backdrop-blur-md"
          : "border-transparent bg-white"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-white shadow-[0_3px_0_0_var(--primary-dark)]">
            51
          </span>
          <span className="font-display text-lg text-foreground">
            HotelEnglish
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/grow-in-hotel"
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-primary/30 bg-primary-light/30 px-3 py-2 text-xs font-extrabold text-primary transition-colors hover:border-primary/50 hover:bg-primary-light/50"
          >
            <Sprout className="size-4" strokeWidth={2.25} />
            Grow in Hotel
          </Link>
          <StudentProfileMenu />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/grow-in-hotel"
            className="flex size-10 items-center justify-center rounded-xl border-2 border-primary/30 bg-primary-light/30 text-primary transition-colors hover:border-primary/50"
            aria-label="Grow in Hotel"
          >
            <Sprout className="size-5" strokeWidth={2.25} />
          </Link>
          <StudentProfileMenu />
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl text-foreground hover:bg-muted"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "关闭菜单" : "打开菜单"}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t-2 border-border bg-white md:hidden">
          <div className="px-6 py-4">
            <StudentProfileMobileCard onNavigate={() => setMobileOpen(false)} />
            <Link
              href="/grow-in-hotel"
              className="mb-3 flex items-center gap-2 rounded-xl border-2 border-primary/30 bg-primary-light/30 px-4 py-3 text-sm font-extrabold text-primary"
              onClick={() => setMobileOpen(false)}
            >
              <Sprout className="size-4" strokeWidth={2.25} />
              Grow in Hotel · 人才成长
            </Link>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl py-3 text-sm font-bold text-foreground hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

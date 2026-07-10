import type { Metadata } from "next";
import Link from "next/link";
import { Bot } from "lucide-react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "AI 真人模拟对练 | 51HotelEnglish",
  description: "AI 模拟对练功能暂时停用。",
};

export default function AiCoachPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted">
        <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted-foreground/10 text-muted-foreground">
            <Bot className="size-8" />
          </div>
          <p className="mt-6 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
            暂时停用
          </p>
          <h1 className="mt-2 font-display text-3xl text-foreground">AI 模拟对练</h1>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-muted-foreground">
            该功能暂时下线维护，请先使用场景课程和水平测评继续学习。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/courses">进入场景课程</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/assessment">水平测评</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

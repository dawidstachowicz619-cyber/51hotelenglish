import Link from "next/link";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

export default function AiCoachPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted pt-20">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-8">
          <div className="card-elevated mx-auto max-w-lg p-10">
            <p className="text-sm font-extrabold uppercase tracking-wide text-secondary">
              Coming Soon
            </p>
            <h1 className="mt-3 font-display text-4xl text-foreground">AI 陪练</h1>
            <p className="mt-6 font-semibold text-muted-foreground">
              AI 模拟真实客诉场景功能即将上线，帮助您在安全环境中锤炼应变能力。
            </p>
            <Button className="mt-10" variant="secondary" asChild>
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

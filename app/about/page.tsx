import Link from "next/link";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted pt-20">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-8">
          <div className="card-elevated mx-auto max-w-lg p-10">
            <p className="text-sm font-extrabold uppercase tracking-wide text-primary">
              About Us
            </p>
            <h1 className="mt-3 font-display text-4xl text-foreground">关于我们</h1>
            <p className="mt-6 font-semibold text-muted-foreground">
              51HotelEnglish 致力于为 hospitality industry
              提供有趣、高效的英语培训解决方案。
            </p>
            <Button className="mt-10" asChild>
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

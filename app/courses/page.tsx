import Link from "next/link";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { CoursesPageContent } from "@/components/courses/courses-page-content";

export default function CoursesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted pt-20">
        <div className="mx-auto max-w-5xl px-6 pb-24 lg:px-8">
          <CoursesPageContent />
        </div>
      </main>
      <Footer />
    </>
  );
}

import { RussianDailyCheckInCourse } from "@/components/courses/russian/daily/russian-daily-checkin-course";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function RussianDailyCheckInPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-[#FFF5F5] to-white pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <RussianDailyCheckInCourse />
        </div>
      </main>
      <Footer />
    </>
  );
}

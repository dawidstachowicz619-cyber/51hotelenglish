import { HotelRussianCampaignCourse } from "@/components/courses/russian/campaign/hotel-russian-campaign-course";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function RussianCampaignPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-[#FFF5F5] to-white pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <HotelRussianCampaignCourse />
        </div>
      </main>
      <Footer />
    </>
  );
}

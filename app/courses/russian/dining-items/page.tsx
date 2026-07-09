import { HotelRussianDiningItemsCourse } from "@/components/courses/russian/dining-items/hotel-russian-dining-items-course";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function HotelRussianDiningItemsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-[#FFF5F5] to-white pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <HotelRussianDiningItemsCourse />
        </div>
      </main>
      <Footer />
    </>
  );
}

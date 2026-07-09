import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { FeatureSection } from "@/components/home/feature-section";
import { HeroSection } from "@/components/home/hero-section";
import { HotelRussianSection } from "@/components/home/hotel-russian-section";
import { RussianHeroSection } from "@/components/home/russian-hero-section";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <RussianHeroSection />
        <HeroSection />
        <FeatureSection />
        <HotelRussianSection />
      </main>
      <Footer />
    </>
  );
}

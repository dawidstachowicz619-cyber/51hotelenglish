import type { Metadata } from "next";

import { AssessmentFlow } from "@/components/assessment/assessment-flow";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "CEFR 英语水平测评 | 51HotelEnglish",
  description:
    "基于欧洲共同语言参考标准（CEFR）的英语水平测评，包含选择题、判断题、填空题、阅读理解等多种题型，学习前先测一测。",
};

export default function AssessmentPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted pt-24 pb-16">
        <AssessmentFlow />
      </main>
      <Footer />
    </>
  );
}

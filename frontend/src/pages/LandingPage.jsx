import React from "react";
import { HeroSection } from "@/components/shared/landing/hero";
import { Features } from "@/components/features-8";
import { Skiper16 } from "@/components/skiper16";
import { CTASection } from "@/components/shared/landing/cta";
import { Footer } from "@/components/shared/landing/footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <Features />
      <Skiper16 />
      <CTASection />
      <Footer />
    </div>
  );
}

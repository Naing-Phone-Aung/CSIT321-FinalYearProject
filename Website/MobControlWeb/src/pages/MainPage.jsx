import React from "react";
import HeaderSection from "../components/HeaderSection";
import HeroSection from "../components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FeatureSection from "@/components/FeatureSection";
import CommunitySection from "@/components/CommunitySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import SmoothScroll from "@/components/ui/SmoothScroll";
import PricingSection from "@/components/PricingSection";
import FooterSection from "@/components/FooterSection";
import ContactSection from "@/components/ContactSection";

const MainPage = () => {
  return (
    <SmoothScroll>
      <HeaderSection />
      <HeroSection />
      <AboutSection />
      <FeatureSection />
      <TestimonialsSection />
      <PricingSection />
      <CommunitySection />
      <ContactSection />
      <FooterSection />
    </SmoothScroll>
  );
};

export default MainPage;

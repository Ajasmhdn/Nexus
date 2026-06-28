import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import SocialProof from "@/components/landing/SocialProof";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6">
        <Hero />
        <Features />
        <SocialProof />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}

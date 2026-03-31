'use client';

import React from 'react';
import LandingPageLayout from './LandingPageLayout';
import AIResumeHero from '@/components/landing/AIResumeHero';
import DemoVideoSection from '@/components/landing/DemoVideoSection';
import AIScrollSection from '@/components/landing/AIScrollSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import SocialProofSection from '@/components/landing/SocialProofSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <LandingPageLayout>
      <section id="home">
        <AIResumeHero />
      </section>
      <DemoVideoSection />
      <AIScrollSection />
      <section id="recursos">
        <FeaturesSection />
      </section>
      <SocialProofSection />
      <section id="avaliacoes">
        <TestimonialsSection />
      </section>
      <section id="precos">
        <PricingSection />
      </section>
      <CTASection />
      <Footer />
    </LandingPageLayout>
  );
}

import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import SolutionsSection from './components/SolutionsSection';
import StatsSection from './components/StatsSection';
import TestimonialsSection from './components/TestimonialsSection';
import ROICalculatorSection from './components/ROICalculatorSection';
import CTASection from './components/CTASection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <SolutionsSection />
      <ROICalculatorSection />
      <StatsSection />
      <CTASection />
    </>
  );
}

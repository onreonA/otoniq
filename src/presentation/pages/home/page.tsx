import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import SolutionsSection from './components/SolutionsSection';
import StatsSection from './components/StatsSection';
import CTASection from './components/CTASection';

export default function Home() {
  return (
    <div className='min-h-screen bg-white'>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <SolutionsSection />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

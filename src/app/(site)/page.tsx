import Hero from '@/components/Hero';
import About from '@/components/About';
import { NewsSection } from '@/components/cms/NewsSection';
import { VideosSection } from '@/components/cms/VideosSection';
import Schedule from '@/components/Schedule';
import Donations from '@/components/Donations';
import IntensivaoSection from '@/components/intensivao/IntensivaoSection';
import GaleriaWidget from '@/components/intensivao/GaleriaWidget';

export default function HomePage() {
  return (
    <>
      <Hero />
      <IntensivaoSection />
      <About />
      <NewsSection variant="home" />
      <VideosSection />
      <Schedule />
      <GaleriaWidget />
      <Donations />
    </>
  );
}

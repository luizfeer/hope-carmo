import Hero from '@/components/Hero';
import About from '@/components/About';
import { NewsSection } from '@/components/cms/NewsSection';
import { VideosSection } from '@/components/cms/VideosSection';
import Schedule from '@/components/Schedule';
import Donations from '@/components/Donations';
import SermonSeries from '@/components/SermonSeries';

export default function HomePage() {
  return (
    <>
      <Hero />
      <SermonSeries />
      <About />
      <NewsSection variant="home" />
      <VideosSection />
      <Schedule />
      <Donations />
    </>
  );
}

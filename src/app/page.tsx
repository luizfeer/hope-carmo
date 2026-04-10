import Hero from '@/components/Hero';
import About from '@/components/About';
import News from '@/components/News';
import Videos from '@/components/Videos';
import Schedule from '@/components/Schedule';
import Donations from '@/components/Donations';
import SermonSeries from '@/components/SermonSeries';

export default function HomePage() {
  return (
    <>
      <Hero />
      <SermonSeries />
      <About />
      <News />
      <Videos />
      <Schedule />
      <Donations />
    </>
  );
}

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

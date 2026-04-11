import SiteShell from '@/components/SiteShell';
import RadioPlayer from '@/components/RadioPlayer';
import { PesquisaModalProvider } from '@/components/PesquisaModalProvider';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PesquisaModalProvider>
        <SiteShell>{children}</SiteShell>
      </PesquisaModalProvider>
      <RadioPlayer />
    </>
  );
}

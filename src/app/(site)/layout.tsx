import SiteShell from '@/components/SiteShell';
import RadioPlayer from '@/components/RadioPlayer';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteShell>{children}</SiteShell>
      <RadioPlayer />
    </>
  );
}

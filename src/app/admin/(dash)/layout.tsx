import { AdminDashboardShell } from '@/components/admin/AdminDashboardShell';

export default function AdminDashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}

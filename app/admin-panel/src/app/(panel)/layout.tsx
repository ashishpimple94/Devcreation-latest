import { RequireStaff } from '@/components/admin/RequireStaff';
import { AdminShell } from '@/components/admin/AdminShell';

/** Guards the whole panel behind a staff session and wraps it in the admin shell. */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireStaff>
      <AdminShell>{children}</AdminShell>
    </RequireStaff>
  );
}

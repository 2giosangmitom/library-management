'use client';

import DashboardShell from './DashboardShell';
import type { CurrentUser } from '@/lib/server-auth';

export default function DashboardLayoutClient({
  user,
  children
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  return <DashboardShell user={user}>{children}</DashboardShell>;
}

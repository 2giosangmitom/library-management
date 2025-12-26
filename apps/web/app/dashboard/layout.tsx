import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthError, fetchCurrentUser } from '@/lib/server-auth';
import type { CurrentUser } from '@/lib/server-auth';
import DashboardLayoutClient from './_components/DashboardLayoutClient';

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');

  let user: CurrentUser;
  try {
    user = await fetchCurrentUser(cookieHeader);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect('/signin');
    }

    throw error;
  }

  if (user.role !== 'ADMIN' && user.role !== 'LIBRARIAN') {
    redirect('/signin');
  }

  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
}

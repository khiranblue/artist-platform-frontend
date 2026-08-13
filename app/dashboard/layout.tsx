import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/currentUser';
import { SignOutButton } from '@/components/SignOutButton';
import styles from './dashboard.module.css';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  // Server-side redirect — an unauthenticated visitor never even
  // receives the dashboard HTML, unlike a client-side-only guard.
  if (!user) redirect('/login');

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <nav className={styles.nav}>
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/upload">Upload work</Link>
          <Link href="/dashboard/invites">Invites</Link>
          <Link href="/dashboard/settings">Settings</Link>
        </nav>
        <SignOutButton className={styles.signOut} />
      </aside>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from './SignOutButton';
import styles from './SiteHeader.module.css';

// Auth-flow pages get a bare screen — no top nav — so users aren't
// distracted mid sign-in/registration by links to other parts of the site.
const HIDDEN_ON_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

type CurrentUser = { username: string } | null;

export function SiteHeader({ user }: { user: CurrentUser }) {
  const pathname = usePathname();

  if (pathname && HIDDEN_ON_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.wordmark}>
        Atelier
      </Link>
      <nav className={styles.nav}>
        {user ? (
          <>
            <Link href="/dashboard/capture" className={styles.navLink}>
              Capture
            </Link>
            <Link href="/dashboard" className={styles.navLink}>
              My Work
            </Link>
            <SignOutButton className={styles.navLink} />
          </>
        ) : (
          <Link href="/login" className={styles.navLink}>
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}

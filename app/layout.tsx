import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import styles from './layout.module.css';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/currentUser';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata = {
  title: 'Atelier — Independent Artist Gallery',
  description: 'A self-funded, invite-only gallery for independent artists.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>
        <header className={styles.header}>
          <Link href="/" className={styles.wordmark}>
            Atelier
          </Link>
          <nav className={styles.nav}>
            {user ? (
              <Link href="/dashboard">{user.username}</Link>
            ) : (
              <Link href="/login">Sign in</Link>
            )}
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
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
  // Required so relative OG/twitter image URLs resolve to absolute ones.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://artist-platform-frontend.vercel.app'),
  title: {
    default: 'Atelier — Independent Artist Gallery',
    template: '%s — Atelier',
  },
  description: 'A self-funded, invite-only gallery for independent artists.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>
        <SiteHeader user={user} />
        <main>{children}</main>
      </body>
    </html>
  );
}

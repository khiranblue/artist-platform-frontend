import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { getCurrentUser } from '@/lib/currentUser';
import { DeleteArtworkButton } from '@/components/DeleteArtworkButton';
import styles from './page.module.css';

interface ArtworkDetail {
  artwork_id: string;
  title: string;
  description: string | null;
  preview_url: string | null;
  preview_width: number | null;
  preview_height: number | null;
  original_url?: string;
  artist: { username: string };
}

async function getArtwork(id: string): Promise<ArtworkDetail | null> {
  try {
    // Not passed `auth: true` here deliberately — this route is reachable
    // by anonymous visitors, and the backend itself decides (via
    // optionalAuth) whether to include original_url for an owner. A
    // logged-in owner viewing their own piece would need the cookie
    // forwarded to see original_url; kept anonymous here to keep the
    // public SSR path simple and cacheable. See note below.
    return await apiFetch<ArtworkDetail>(`/artworks/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const artwork = await getArtwork(params.id);
  if (!artwork) return {};
  return {
    title: `${artwork.title} — ${artwork.artist.username} — Atelier`,
    description: artwork.description ?? `A work by ${artwork.artist.username} on Atelier.`,
  };
}

export default async function ArtworkPage({ params }: { params: { id: string } }) {
  const artwork = await getArtwork(params.id);
  if (!artwork) notFound();

  // Ownership determined client-independent, server-side: compares the
  // logged-in visitor's own username (from their session cookie) against
  // the artwork's artist username. No new backend field needed.
  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.username === artwork.artist.username;

  return (
    <article className={styles.page}>
      <div className={styles.imageColumn}>
        {artwork.preview_url && artwork.preview_width && artwork.preview_height && (
          <Image
            src={artwork.preview_url}
            alt={artwork.title}
            width={artwork.preview_width}
            height={artwork.preview_height}
            style={{ width: '100%', height: 'auto' }}
            priority
          />
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.infoHeader}>
          <h1 className={styles.title}>{artwork.title}</h1>
          {isOwner && <DeleteArtworkButton artworkId={artwork.artwork_id} />}
        </div>
        <Link href={`/artists/${artwork.artist.username}`} className={styles.artist}>
          {artwork.artist.username}
        </Link>
        {artwork.description && <p className={styles.description}>{artwork.description}</p>}
      </div>
    </article>
  );
}

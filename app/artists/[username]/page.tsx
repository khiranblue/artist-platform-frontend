import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { ArtworkCard, ArtworkSummary } from '@/components/ArtworkCard';
import styles from './page.module.css';

interface ArtistProfileResponse {
  artist: { username: string; display_name: string | null; bio: string | null };
  artworks: Omit<ArtworkSummary, 'artist'>[];
  page: number;
  limit: number;
  has_more: boolean;
}

async function getArtistProfile(username: string, page: number): Promise<ArtistProfileResponse> {
  return apiFetch(`/artists/${encodeURIComponent(username)}?page=${page}`);
}

export default async function ArtistPage({
  params,
  searchParams,
}: {
  params: { username: string };
  searchParams: { page?: string };
}) {
  const page = Math.max(Number(searchParams.page) || 1, 1);

  let data: ArtistProfileResponse;
  try {
    data = await getArtistProfile(params.username, page);
  } catch (err) {
    // A 404 here means the username doesn't exist (or is banned/frozen —
    // the API deliberately doesn't distinguish). Any other error should
    // surface normally rather than being silently swallowed as "not found".
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const { artist, artworks, has_more } = data;
  // Safe fallback for a missing display name — never render a raw
  // technical username as if it were a chosen display name.
  const displayName = artist.display_name || `@${artist.username}`;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.name}>{displayName}</h1>
        {artist.bio && <p className={styles.bio}>{artist.bio}</p>}
      </section>

      {artworks.length === 0 ? (
        <p className={styles.empty}>No published work yet.</p>
      ) : (
        <div className={styles.grid}>
          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork.artwork_id}
              artwork={{ ...artwork, artist: { username: artist.username } }}
            />
          ))}
        </div>
      )}

      <nav className={styles.pager}>
        {page > 1 && (
          <Link href={`/artists/${artist.username}?page=${page - 1}`} className={styles.pagerLink}>
            ← Previous
          </Link>
        )}
        {has_more && (
          <Link href={`/artists/${artist.username}?page=${page + 1}`} className={styles.pagerLink}>
            More work →
          </Link>
        )}
      </nav>
    </div>
  );
}

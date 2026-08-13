import { apiFetch } from '@/lib/api';
import { ArtworkCard, ArtworkSummary } from '@/components/ArtworkCard';
import styles from './page.module.css';

// Revalidated periodically rather than fully static or fully dynamic —
// the gallery is public, SEO-relevant content that changes as artists
// publish, but doesn't need to be real-time on every request.
export const revalidate = 60;

async function getGallery(): Promise<{ artworks: ArtworkSummary[] }> {
  return apiFetch('/artworks?limit=24');
}

export default async function HomePage() {
  const { artworks } = await getGallery();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Work, shown plainly.</h1>
        <p className={styles.heroSub}>
          An independent, invite-only gallery. No algorithm, no feed — just the work.
        </p>
      </section>

      {artworks.length === 0 ? (
        <p className={styles.empty}>Nothing published yet. Check back soon.</p>
      ) : (
        <div className={styles.grid}>
          {artworks.map((artwork) => (
            <ArtworkCard key={artwork.artwork_id} artwork={artwork} />
          ))}
        </div>
      )}
    </div>
  );
}

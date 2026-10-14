import Image from 'next/image';
import Link from 'next/link';
import styles from './ArtworkCard.module.css';

export interface SeriesSummary {
  series_id: string;
  title: string | null;
  field: string;
  entry_count: number;
  cover_url: string | null;
  cover_width: number | null;
  cover_height: number | null;
  owner: { username: string; display_name: string | null };
}

/**
 * One gallery card per series. Reuses ArtworkCard's styles so the grid
 * stays visually identical; the only addition is the image count.
 */
export function SeriesCard({ series }: { series: SeriesSummary }) {
  // No title → no placeholder word. A grid of "Untitled" repeated on most
  // cards is noise; the artist's name alone is the caption.
  const title = series.title?.trim() || null;
  const href = `/series/${series.series_id}`;
  const ownerName = series.owner.display_name || series.owner.username;
  const count = series.entry_count > 1 ? `${series.entry_count} images` : null;
  return (
    <div className={styles.card}>
      <Link href={href} className={styles.imageLink}>
        <div className={styles.frame}>
          {series.cover_url && series.cover_width && series.cover_height ? (
            <Image
              src={series.cover_url}
              alt={title ?? `Work by ${ownerName}`}
              width={series.cover_width}
              height={series.cover_height}
              style={{ width: '100%', height: 'auto' }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className={styles.placeholder} aria-hidden="true" />
          )}
        </div>
      </Link>
      <div className={styles.caption}>
        {title ? (
          <Link href={href} className={styles.title}>
            {title}
            {count && <span className={styles.artist}> · {count}</span>}
          </Link>
        ) : count ? (
          <Link href={href} className={styles.artist}>
            {count}
          </Link>
        ) : (
          // Keeps the artist's name on the right, where it sits on every other card.
          <span aria-hidden="true" />
        )}
        {/* A display name can be up to 60 characters and .artist never wraps,
            so without minWidth/ellipsis a long one would push out of the card. */}
        <Link
          href={`/artists/${series.owner.username}`}
          className={styles.artist}
          dir="auto"
          title={ownerName}
          style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {ownerName}
        </Link>
      </div>
    </div>
  );
}

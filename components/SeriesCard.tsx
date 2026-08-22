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
  const title = series.title ?? 'Untitled';
  const href = `/series/${series.series_id}`;
  return (
    <div className={styles.card}>
      <Link href={href} className={styles.imageLink}>
        <div className={styles.frame}>
          {series.cover_url && series.cover_width && series.cover_height ? (
            <Image
              src={series.cover_url}
              alt={title}
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
        <Link href={href} className={styles.title}>
          {title}
          {series.entry_count > 1 && (
            <span className={styles.artist}> · {series.entry_count} images</span>
          )}
        </Link>
        <Link href={`/artists/${series.owner.username}`} className={styles.artist}>
          {series.owner.display_name || series.owner.username}
        </Link>
      </div>
    </div>
  );
}

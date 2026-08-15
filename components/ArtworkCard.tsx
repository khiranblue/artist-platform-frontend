import Image from 'next/image';
import Link from 'next/link';
import styles from './ArtworkCard.module.css';

export interface ArtworkSummary {
  artwork_id: string;
  title: string;
  preview_url: string | null;
  preview_width: number | null;
  preview_height: number | null;
  artist: { username: string };
}

export function ArtworkCard({ artwork }: { artwork: ArtworkSummary }) {
  return (
    <div className={styles.card}>
      <Link href={`/artworks/${artwork.artwork_id}`} className={styles.imageLink}>
        <div className={styles.frame}>
          {artwork.preview_url && artwork.preview_width && artwork.preview_height ? (
            <Image
              src={artwork.preview_url}
              alt={artwork.title}
              width={artwork.preview_width}
              height={artwork.preview_height}
              style={{ width: '100%', height: 'auto' }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className={styles.placeholder} aria-hidden="true" />
          )}
        </div>
      </Link>
      <div className={styles.caption}>
        <Link href={`/artworks/${artwork.artwork_id}`} className={styles.title}>
          {artwork.title}
        </Link>
        <Link href={`/artists/${artwork.artist.username}`} className={styles.artist}>
          {artwork.artist.username}
        </Link>
      </div>
    </div>
  );
}

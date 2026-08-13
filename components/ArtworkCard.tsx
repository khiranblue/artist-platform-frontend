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
    <Link href={`/artworks/${artwork.artwork_id}`} className={styles.card}>
      <div className={styles.frame}>
        {artwork.preview_url && artwork.preview_width && artwork.preview_height ? (
          <Image
            src={artwork.preview_url}
            alt={artwork.title}
            width={artwork.preview_width}
            height={artwork.preview_height}
            // Explicit width/height above is what reserves the exact box
            // server-side before a single byte of image data arrives —
            // this is the actual CLS fix, not a CSS approximation.
            style={{ width: '100%', height: 'auto' }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true" />
        )}
      </div>
      <div className={styles.caption}>
        <span className={styles.title}>{artwork.title}</span>
        <span className={styles.artist}>{artwork.artist.username}</span>
      </div>
    </Link>
  );
}

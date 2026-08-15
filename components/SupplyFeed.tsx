'use client';

import Image from 'next/image';
import styles from '@/app/dashboard/supplies/page.module.css';

export interface SupplyPost {
  id: string;
  category_id: string;
  description: string;
  created_at: string;
  artist: { username: string };
  thumbnail_url: string | null;
  preview_url: string | null;
}

export function SupplyFeed({ posts }: { posts: SupplyPost[] }) {
  return (
    <div className={styles.grid}>
      {posts.map((post) => (
        <div key={post.id} className={styles.postCard}>
          <div className={styles.postFrame}>
            {post.thumbnail_url ? (
              <Image
                src={post.thumbnail_url}
                alt={post.description}
                width={300}
                height={300}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className={styles.placeholder} aria-hidden="true" />
            )}
          </div>
          <p className={styles.postDescription}>{post.description}</p>
          <span className={styles.postArtist}>{post.artist.username}</span>
        </div>
      ))}
    </div>
  );
}

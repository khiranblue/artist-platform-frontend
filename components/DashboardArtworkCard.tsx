'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DeleteArtworkButton } from './DeleteArtworkButton';
import styles from './DashboardArtworkCard.module.css';

export interface DashboardArtwork {
  id: string;
  title: string;
  visibility: string;
  is_hidden: boolean;
  preview_url: string | null;
  preview_width: number | null;
  preview_height: number | null;
}

export function DashboardArtworkCard({
  artwork,
  onDeleted,
}: {
  artwork: DashboardArtwork;
  onDeleted: (id: string) => void;
}) {
  const [visibility, setVisibility] = useState(artwork.visibility);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVisibilityChange(next: string) {
    const previous = visibility;
    setVisibility(next);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/artworks/${artwork.id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: next }),
      });
      if (!res.ok) throw new Error('failed');
    } catch {
      setVisibility(previous);
      setError('Could not update visibility.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.card}>
      <Link href={`/artworks/${artwork.id}`} className={styles.imageLink}>
        <div className={styles.frame}>
          {artwork.preview_url && artwork.preview_width && artwork.preview_height ? (
            <Image
              src={artwork.preview_url}
              alt={artwork.title}
              width={artwork.preview_width}
              height={artwork.preview_height}
              style={{ width: '100%', height: 'auto' }}
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          ) : (
            <div className={styles.placeholder} aria-hidden="true" />
          )}
          {artwork.is_hidden && <span className={styles.hiddenBadge}>Hidden by moderation</span>}
        </div>
      </Link>
      <div className={styles.footer}>
        <span className={styles.title}>{artwork.title}</span>
        <div className={styles.controls}>
          <select
            value={visibility}
            onChange={(e) => handleVisibilityChange(e.target.value)}
            disabled={saving}
            className={styles.visibilitySelect}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
          </select>
          <DeleteArtworkButton artworkId={artwork.id} onDeleted={() => onDeleted(artwork.id)} />
        </div>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

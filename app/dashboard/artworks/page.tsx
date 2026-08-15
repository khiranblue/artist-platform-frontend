'use client';

import { useEffect, useState } from 'react';
import { DashboardArtworkCard, DashboardArtwork } from '@/components/DashboardArtworkCard';
import styles from './page.module.css';

export default function MyArtworksPage() {
  const [artworks, setArtworks] = useState<DashboardArtwork[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/artworks')
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then((data) => setArtworks(data.artworks))
      .catch(() => setError('Could not load your artworks.'));
  }, []);

  function handleDeleted(id: string) {
    setArtworks((prev) => (prev ? prev.filter((a) => a.id !== id) : prev));
  }

  return (
    <div>
      <h1 className={styles.heading}>My Artworks</h1>

      {error && <p className={styles.error}>{error}</p>}

      {!error && artworks === null && <p className={styles.empty}>Loading…</p>}

      {artworks && artworks.length === 0 && (
        <p className={styles.empty}>You haven&apos;t published anything yet.</p>
      )}

      {artworks && artworks.length > 0 && (
        <div className={styles.grid}>
          {artworks.map((artwork) => (
            <DashboardArtworkCard key={artwork.id} artwork={artwork} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}

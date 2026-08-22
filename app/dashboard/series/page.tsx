'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface OwnSeries {
  series_id: string;
  title: string | null;
  field: string;
  visibility: string;
  entry_count: number;
  cover_url: string | null;
  updated_at: string;
}

const FIELD_LABELS: Record<string, string> = {
  painting: 'Painting',
  wood: 'Wood',
  metal: 'Metal',
  plants: 'Plants',
  other: 'Other',
};

function SeriesRow({ series }: { series: OwnSeries }) {
  const [visibility, setVisibility] = useState(series.visibility);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVisibilityChange(next: string) {
    const previous = visibility;
    setVisibility(next);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/series/${series.series_id}`, {
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
      <Link href={`/series/${series.series_id}`} className={styles.imageLink}>
        <div className={styles.frame}>
          {series.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={series.cover_url} alt="" className={styles.cover} />
          ) : (
            <div className={styles.placeholder} aria-hidden="true" />
          )}
        </div>
      </Link>
      <div className={styles.footer}>
        <div>
          <Link href={`/series/${series.series_id}`} className={styles.title}>
            {series.title ?? 'Untitled'}
          </Link>
          <div className={styles.meta}>
            {FIELD_LABELS[series.field] ?? series.field} · {series.entry_count}{' '}
            {series.entry_count === 1 ? 'image' : 'images'}
          </div>
        </div>
        <select
          value={visibility}
          onChange={(e) => handleVisibilityChange(e.target.value)}
          disabled={saving}
          className={styles.visibilitySelect}
        >
          <option value="private">Private</option>
          <option value="unlisted">Unlisted</option>
          <option value="public">Public</option>
        </select>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export default function MySeriesPage() {
  const [series, setSeries] = useState<OwnSeries[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/series')
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then((data) => setSeries(data.series))
      .catch(() => setError('Could not load your series.'));
  }, []);

  return (
    <div>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>My Series</h1>
        <Link href="/dashboard/capture" className={styles.captureLink}>
          + Capture
        </Link>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {!error && series === null && <p className={styles.empty}>Loading…</p>}
      {series && series.length === 0 && (
        <p className={styles.empty}>Nothing yet. Capture your first photo.</p>
      )}
      {series && series.length > 0 && (
        <div className={styles.list}>
          {series.map((s) => (
            <SeriesRow key={s.series_id} series={s} />
          ))}
        </div>
      )}
    </div>
  );
}

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

function SeriesRow({ series, onDeleted }: { series: OwnSeries; onDeleted: (id: string) => void }) {
  const [visibility, setVisibility] = useState(series.visibility);
  const [title, setTitle] = useState<string | null>(series.title);
  const [field, setField] = useState(series.field);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(series.title ?? '');
  const [draftField, setDraftField] = useState(series.field);

  async function handleSaveDetails() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/series/${series.series_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draftTitle.trim() || null, field: draftField }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setTitle(data.title ?? null);
      setField(data.field ?? draftField);
      setEditing(false);
    } catch {
      setError('Could not save the changes.');
    } finally {
      setSaving(false);
    }
  }
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const count = series.entry_count;
    const msg = count > 0
      ? `Delete this series and its ${count} ${count === 1 ? 'image' : 'images'}? This cannot be undone.`
      : 'Delete this empty series?';
    if (!window.confirm(msg)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/series/${series.series_id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('failed');
      onDeleted(series.series_id);
    } catch {
      setError('Could not delete this series.');
      setDeleting(false);
    }
  }

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
        {editing ? (
          <div className={styles.editor}>
            <input
              className={styles.titleInput}
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Series title"
              maxLength={255}
              autoFocus
            />
            <select
              className={styles.visibilitySelect}
              value={draftField}
              onChange={(e) => setDraftField(e.target.value)}
            >
              {Object.entries(FIELD_LABELS).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
            <button type="button" className={styles.saveButton} onClick={handleSaveDetails} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => {
                setDraftTitle(title ?? '');
                setDraftField(field);
                setEditing(false);
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <Link href={`/series/${series.series_id}`} className={styles.title}>
              {title ?? 'Untitled'}
            </Link>
            <div className={styles.meta}>
              {FIELD_LABELS[field] ?? field} · {series.entry_count}{' '}
              {series.entry_count === 1 ? 'image' : 'images'}
              {' · '}
              <button type="button" className={styles.editLink} onClick={() => setEditing(true)}>
                Edit
              </button>
            </div>
          </div>
        )}
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
        <button type="button" onClick={handleDelete} disabled={deleting} className={styles.deleteButton}>
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
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

  function handleDeleted(id: string) {
    setSeries((prev) => (prev ? prev.filter((x) => x.series_id !== id) : prev));
  }

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
            <SeriesRow key={s.series_id} series={s} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}

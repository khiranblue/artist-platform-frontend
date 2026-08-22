'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';
import formStyles from '../../auth.module.css';

type Stage = 'idle' | 'uploading' | 'processing' | 'ready' | 'saving' | 'error';

interface OwnSeries {
  series_id: string;
  title: string | null;
  field: string;
  entry_count: number;
}

const FIELDS: Array<[string, string]> = [
  ['painting', 'Painting'],
  ['wood', 'Wood'],
  ['metal', 'Metal'],
  ['plants', 'Plants'],
  ['other', 'Other'],
];

/**
 * Quick capture — the workshop flow. One tap opens the camera, then an
 * optional note and a choice of series. Everything is private by
 * default; publishing is a separate, deliberate decision on the series.
 */
export default function CapturePage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [ownSeries, setOwnSeries] = useState<OwnSeries[]>([]);
  const [seriesChoice, setSeriesChoice] = useState<string>('new');
  const [newTitle, setNewTitle] = useState('');
  const [newField, setNewField] = useState('other');

  useEffect(() => {
    // ?series=<id> (from a series page's "+ Capture" link) preselects that
    // series so adding the next photo is one tap, not a dropdown hunt.
    const preselected = new URLSearchParams(window.location.search).get('series');
    fetch('/api/dashboard/series')
      .then((r) => (r.ok ? r.json() : { series: [] }))
      .then((d) => {
        const list: OwnSeries[] = d.series ?? [];
        setOwnSeries(list);
        if (preselected && list.some((x) => x.series_id === preselected)) {
          setSeriesChoice(preselected);
        }
      })
      .catch(() => setOwnSeries([]));
  }, []);

  async function pollStatus(id: string): Promise<'confirmed' | 'failed'> {
    let delayMs = 1000;
    for (let attempt = 0; attempt < 20; attempt++) {
      const res = await fetch(`/api/upload-reservations/${id}/status`);
      const data = await res.json();
      if (data.status === 'confirmed') return 'confirmed';
      if (data.status === 'failed' || data.status === 'expired') return 'failed';
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs = Math.min(delayMs * 1.5, 8000);
    }
    return 'failed';
  }

  async function handleFileSelected(file: File) {
    setError(null);
    setStage('uploading');
    setPreviewSrc(URL.createObjectURL(file));

    const expectedSizeMb = file.size / (1024 * 1024);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';

    try {
      const intentRes = await fetch('/api/artworks/upload-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expected_size_mb: expectedSizeMb, file_extension: extension }),
      });
      const intent = await intentRes.json();
      if (!intentRes.ok) {
        setError(
          intent.error === 'quota_exceeded'
            ? `Not enough storage left (${intent.available_mb?.toFixed(1)} MB available).`
            : 'Could not start the upload. Try again.'
        );
        setStage('error');
        return;
      }

      const formData = new FormData();
      for (const [key, value] of Object.entries(intent.upload_fields)) {
        formData.append(key, value as string);
      }
      formData.append('file', file);

      const uploadRes = await fetch(intent.upload_url, { method: 'POST', body: formData });
      if (!uploadRes.ok) {
        setError('The upload to storage failed. Try again.');
        setStage('error');
        return;
      }

      setReservationId(intent.reservation_id);
      setStage('processing');
      const result = await pollStatus(intent.reservation_id);
      if (result === 'failed') {
        setError('The image could not be processed. Try another one.');
        setStage('error');
        return;
      }
      setStage('ready');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
      setStage('error');
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!reservationId) return;
    setStage('saving');
    setError(null);

    try {
      let seriesId = seriesChoice;
      if (seriesChoice === 'new') {
        const sRes = await fetch('/api/series', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle || null, field: newField, visibility: 'private' }),
        });
        const sData = await sRes.json();
        if (!sRes.ok) {
          setError(sData.message || sData.error || 'Could not create the series.');
          setStage('ready');
          return;
        }
        seriesId = sData.series_id;
      }

      const res = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation_id: reservationId,
          title: null,
          description: null,
          visibility: 'private',
          series_id: seriesId,
          note: note || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || 'Could not save this capture.');
        setStage('ready');
        return;
      }
      router.push(`/series/${data.series_id}`);
    } catch (err) {
      console.error(err);
      setError('Something went wrong saving this capture.');
      setStage('ready');
    }
  }

  return (
    <div>
      <h1 className={styles.heading}>Capture</h1>

      {stage === 'idle' && (
        <div className={styles.card}>
          <label className={formStyles.submit} style={{ display: 'inline-block', cursor: 'pointer' }}>
            Take a photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
            />
          </label>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
            Private by default. Add it to a series now or later.
          </p>
        </div>
      )}

      {(stage === 'uploading' || stage === 'processing') && (
        <div className={styles.card}>
          {previewSrc && <img src={previewSrc} alt="" style={{ width: '100%', borderRadius: 'var(--radius)' }} />}
          <p>{stage === 'uploading' ? 'Uploading…' : 'Processing…'}</p>
        </div>
      )}

      {(stage === 'ready' || stage === 'saving') && (
        <form onSubmit={handleSave} className={formStyles.form}>
          {previewSrc && <img src={previewSrc} alt="" style={{ width: '100%', borderRadius: 'var(--radius)' }} />}
          <label className={formStyles.field}>
            <span>Note (optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
          </label>
          <label className={formStyles.field}>
            <span>Series</span>
            <select value={seriesChoice} onChange={(e) => setSeriesChoice(e.target.value)}>
              <option value="new">New series</option>
              {ownSeries.map((s) => (
                <option key={s.series_id} value={s.series_id}>
                  {(s.title ?? 'Untitled') + ` · ${s.field} · ${s.entry_count}`}
                </option>
              ))}
            </select>
          </label>
          {seriesChoice === 'new' && (
            <>
              <label className={formStyles.field}>
                <span>Series title (optional)</span>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={255} />
              </label>
              <label className={formStyles.field}>
                <span>Field</span>
                <select value={newField} onChange={(e) => setNewField(e.target.value)}>
                  {FIELDS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          {error && <p className={formStyles.error}>{error}</p>}
          <button type="submit" className={formStyles.submit} disabled={stage === 'saving'}>
            {stage === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}

      {stage === 'error' && (
        <div className={styles.card}>
          <p className={formStyles.error}>{error}</p>
          <button className={formStyles.submit} onClick={() => setStage('idle')}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

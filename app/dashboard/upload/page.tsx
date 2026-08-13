'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';
import formStyles from '../../auth.module.css';

type Stage = 'idle' | 'uploading' | 'processing' | 'ready' | 'publishing' | 'error';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');

  async function pollStatus(id: string): Promise<'confirmed' | 'failed'> {
    let delayMs = 1000;
    // Exponential backoff, capped — matches the approved design: cheap
    // polling that doesn't hammer the server while a large file processes.
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

    const expectedSizeMb = file.size / (1024 * 1024);
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

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
            : 'Could not start the upload. Check the file and try again.'
        );
        setStage('error');
        return;
      }

      // Uploads directly to GCS from the browser — never touches our own
      // server, per the offloading design decided early in this project.
      // NOTE: the bucket's CORS configuration must allow POST from this
      // frontend's origin, or this request will be blocked by the browser.
      const formData = new FormData();
      for (const [key, value] of Object.entries(intent.upload_fields)) {
        formData.append(key, value as string);
      }
      formData.append('file', file); // must be appended LAST for GCS POST policies

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
        setError('The file could not be processed. Try a different image.');
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

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!reservationId) return;
    setStage('publishing');
    setError(null);

    try {
      const res = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: reservationId, title, description, visibility }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || 'Could not publish this work.');
        setStage('ready');
        return;
      }
      router.push(`/artworks/${data.artwork_id}`);
    } catch (err) {
      console.error(err);
      setError('Something went wrong publishing this work.');
      setStage('ready');
    }
  }

  return (
    <div>
      <h1 className={styles.heading}>Upload work</h1>

      {stage === 'idle' && (
        <div className={styles.card}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
          />
        </div>
      )}

      {stage === 'uploading' && <p>Uploading…</p>}
      {stage === 'processing' && <p>Processing your image — this takes a few seconds.</p>}

      {stage === 'ready' && (
        <form onSubmit={handlePublish} className={formStyles.form}>
          <label className={formStyles.field}>
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={255} />
          </label>
          <label className={formStyles.field}>
            <span>Description</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} />
          </label>
          <label className={formStyles.field}>
            <span>Visibility</span>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="public">Public — visible in the gallery</option>
              <option value="unlisted">Unlisted — only reachable by direct link</option>
              <option value="private">Private — only visible to you</option>
            </select>
          </label>
          {error && <p className={formStyles.error}>{error}</p>}
          <button type="submit" className={formStyles.submit}>
            Publish
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

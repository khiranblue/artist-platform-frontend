'use client';

import { useState, useRef } from 'react';
import formStyles from '@/app/auth.module.css';

type Stage = 'idle' | 'uploading' | 'processing' | 'ready' | 'posting' | 'error';

interface Category {
  id: string;
  name: string;
}

export function SupplyUploadForm({
  categories,
  onPosted,
}: {
  categories: Category[];
  onPosted: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [description, setDescription] = useState('');

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
    const expectedSizeMb = file.size / (1024 * 1024);
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    try {
      const intentRes = await fetch('/api/supply-upload-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expected_size_mb: expectedSizeMb, file_extension: extension }),
      });
      const intent = await intentRes.json();
      if (!intentRes.ok) {
        setError(
          intent.error === 'quota_exceeded'
            ? `Not enough storage left (${intent.available_mb?.toFixed(1)} MB available).`
            : 'Could not start the upload.'
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
        setError('The file could not be processed.');
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

  async function handleSubmitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!reservationId) return;
    setStage('posting');
    setError(null);
    try {
      const res = await fetch('/api/supplies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: reservationId, category_id: categoryId, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === 'quota_exceeded'
            ? `Posting limit reached (${data.limit} per ${data.window}).`
            : data.message || 'Could not publish this post.'
        );
        setStage('ready');
        return;
      }
      setStage('idle');
      setReservationId(null);
      setDescription('');
      onPosted();
    } catch (err) {
      console.error(err);
      setError('Something went wrong publishing this post.');
      setStage('ready');
    }
  }

  return (
    <div>
      {stage === 'idle' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
        />
      )}
      {stage === 'uploading' && <p>Uploading…</p>}
      {stage === 'processing' && <p>Processing…</p>}
      {(stage === 'ready' || stage === 'posting') && (
        <form onSubmit={handleSubmitPost} className={formStyles.form}>
          <label className={formStyles.field}>
            <span>Category</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className={formStyles.field}>
            <span>Description</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={300}
            />
          </label>
          {error && <p className={formStyles.error}>{error}</p>}
          <button type="submit" className={formStyles.submit} disabled={stage === 'posting'}>
            {stage === 'posting' ? 'Posting…' : 'Post'}
          </button>
        </form>
      )}
      {stage === 'error' && (
        <>
          <p className={formStyles.error}>{error}</p>
          <button className={formStyles.submit} onClick={() => setStage('idle')}>
            Try again
          </button>
        </>
      )}
    </div>
  );
}

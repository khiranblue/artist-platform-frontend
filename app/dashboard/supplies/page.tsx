'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import formStyles from '../../auth.module.css';

type Stage = 'idle' | 'uploading' | 'processing' | 'ready' | 'posting' | 'error';

interface Category {
  id: string;
  name: string;
}
interface SupplyPost {
  id: string;
  category_id: string;
  description: string;
  created_at: string;
  artist: { username: string };
  thumbnail_url: string | null;
  preview_url: string | null;
}

export default function SuppliesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<SupplyPost[] | null>(null);
  const [feedError, setFeedError] = useState<string | null>(null);

  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetch('/api/supply-categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      })
      .catch(() => {});
    loadFeed();
  }, []);

  function loadFeed() {
    fetch('/api/supplies')
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then((data) => setPosts(data.posts))
      .catch(() => setFeedError('Could not load the feed.'));
  }

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
            : 'Could not start the upload. Check the file and try again.'
        );
        setStage('error');
        return;
      }

      // Uploads directly to GCS from the browser — same offloading
      // pattern used by the artwork upload flow.
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
            ? `You've reached your posting limit for this ${data.window === 'daily' ? 'day' : 'week'} (${data.limit} posts).`
            : data.message || 'Could not publish this post.'
        );
        setStage('ready');
        return;
      }
      setStage('idle');
      setReservationId(null);
      setDescription('');
      loadFeed();
    } catch (err) {
      console.error(err);
      setError('Something went wrong publishing this post.');
      setStage('ready');
    }
  }

  return (
    <div>
      <h1 className={styles.heading}>Supply Materials</h1>
      <p className={styles.disclaimer}>
        Prices and availability reflect only the posting artist&apos;s personal experience at the time of
        posting — not a platform guarantee.
      </p>

      <div className={styles.card}>
        {stage === 'idle' && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
          />
        )}

        {stage === 'uploading' && <p>Uploading…</p>}
        {stage === 'processing' && <p>Processing your image — this takes a few seconds.</p>}

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

      {feedError && <p className={styles.error}>{feedError}</p>}
      {!feedError && posts === null && <p className={styles.empty}>Loading…</p>}
      {posts && posts.length === 0 && (
        <p className={styles.empty}>No posts yet — be the first to share.</p>
      )}
      {posts && posts.length > 0 && (
        <div className={styles.grid}>
          {posts.map((post) => (
            <div key={post.id} className={styles.postCard}>

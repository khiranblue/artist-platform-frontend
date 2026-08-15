'use client';

import { useEffect, useState } from 'react';
import { SupplyUploadForm } from '@/components/SupplyUploadForm';
import { SupplyFeed, SupplyPost } from '@/components/SupplyFeed';
import styles from './page.module.css';

interface Category {
  id: string;
  name: string;
}

export default function SuppliesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<SupplyPost[] | null>(null);
  const [feedError, setFeedError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/supply-categories')
      .then((res) => res.json())
      .then(setCategories)
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

  return (
    <div>
      <h1 className={styles.heading}>Supply Materials</h1>
      <p className={styles.disclaimer}>
        Prices and availability reflect only the posting artist&apos;s personal experience at the time of
        posting — not a platform guarantee.
      </p>

      <div className={styles.card}>
        <SupplyUploadForm categories={categories} onPosted={loadFeed} />
      </div>

      {feedError && <p className={styles.error}>{feedError}</p>}
      {!feedError && posts === null && <p className={styles.empty}>Loading…</p>}
      {posts && posts.length === 0 && (
        <p className={styles.empty}>No posts yet — be the first to share.</p>
      )}

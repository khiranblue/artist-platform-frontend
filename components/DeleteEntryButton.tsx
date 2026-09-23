'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DeleteArtworkButton.module.css';

/**
 * Owner-only delete on the series page. In a series of several photos it
 * removes one photo. A single work is deleted as a whole series instead,
 * because the backend's deleteArtwork never removes the series row — deleting
 * the last photo alone would leave an empty series in My Series.
 */
const TEXT = {
  photo: {
    item: 'Delete photo',
    title: 'Delete this photo?',
    body: "This can't be undone. The photo is removed from the series; the others stay as they are.",
    confirm: 'Delete photo',
  },
  work: {
    item: 'Delete this work',
    title: 'Delete this work?',
    body: "This can't be undone. The photo and its page are removed for good.",
    confirm: 'Delete',
  },
} as const;

export function DeleteEntryButton({
  mode,
  artworkId,
  seriesId,
}: {
  mode: 'photo' | 'work';
  artworkId: string;
  seriesId: string;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const text = TEXT[mode];

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const url = mode === 'work' ? `/api/series/${seriesId}` : `/api/artworks/${artworkId}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete_failed');
      if (mode === 'work') {
        // The page itself is gone; My Series is where the artist continues.
        router.push('/dashboard/series');
        router.refresh();
      } else {
        setConfirmOpen(false);
        setDeleting(false);
        router.refresh();
      }
    } catch {
      setError('Could not delete. Try again.');
      setDeleting(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        aria-label="Photo options"
        className={styles.menuButton}
        onClick={() => setMenuOpen((v) => !v)}
      >
        ⋮
      </button>

      {menuOpen && (
        <>
          <div className={styles.menuBackdrop} onClick={() => setMenuOpen(false)} />
          <div className={styles.menu}>
            <button
              type="button"
              className={styles.menuItem}
              onClick={() => {
                setMenuOpen(false);
                setConfirmOpen(true);
              }}
            >
              {text.item}
            </button>
          </div>
        </>
      )}

      {confirmOpen && (
        <div className={styles.overlay} onClick={() => !deleting && setConfirmOpen(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <p className={styles.dialogTitle}>{text.title}</p>
            <p className={styles.dialogBody}>{text.body}</p>
            {error && <p className={styles.dialogError}>{error}</p>}
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : text.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

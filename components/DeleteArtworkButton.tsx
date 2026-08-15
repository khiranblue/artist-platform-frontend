'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DeleteArtworkButton.module.css';

export function DeleteArtworkButton({ artworkId }: { artworkId: string }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/artworks/${artworkId}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('delete_failed');
      }
      router.push('/');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setDeleting(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        aria-label="Artwork options"
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
              Delete artwork
            </button>
          </div>
        </>
      )}

      {confirmOpen && (
        <div className={styles.overlay} onClick={() => !deleting && setConfirmOpen(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <p className={styles.dialogTitle}>Delete this artwork?</p>
            <p className={styles.dialogBody}>
              This can&apos;t be undone. The image and its thumbnails will be permanently removed.
            </p>
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
                {deleting ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

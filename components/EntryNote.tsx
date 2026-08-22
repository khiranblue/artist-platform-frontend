'use client';

import { useState } from 'react';
import styles from './EntryNote.module.css';

/**
 * Series entry caption. Read-only for visitors; the owner can click to
 * edit in place (silent captures get their note later, workshop-style).
 */
export function EntryNote({
  artworkId,
  initialNote,
  editable,
}: {
  artworkId: string;
  initialNote: string | null;
  editable: boolean;
}) {
  const [note, setNote] = useState<string | null>(initialNote);
  const [draft, setDraft] = useState(initialNote ?? '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/artworks/${artworkId}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: draft }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setNote(data.note);
      setDraft(data.note ?? '');
      setEditing(false);
    } catch {
      setError('Could not save the note.');
    } finally {
      setSaving(false);
    }
  }

  if (!editable) {
    return note ? <p className={styles.note}>{note}</p> : null;
  }

  if (!editing) {
    return (
      <button type="button" className={styles.editable} onClick={() => setEditing(true)}>
        {note ? <span className={styles.note}>{note}</span> : <span className={styles.addNote}>+ Add a note</span>}
      </button>
    );
  }

  return (
    <div className={styles.editor}>
      <textarea
        className={styles.textarea}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        maxLength={1000}
        rows={3}
        autoFocus
      />
      <div className={styles.actions}>
        <button type="button" className={styles.save} onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          className={styles.cancel}
          onClick={() => {
            setDraft(note ?? '');
            setEditing(false);
            setError(null);
          }}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

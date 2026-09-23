'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import formStyles from '@/app/auth.module.css';

// Same limits the backend enforces (PATCH /account/profile).
const DISPLAY_NAME_MAX = 60;
const BIO_MAX = 280;
// The counter only appears near the end, so it never reads as a target.
const BIO_COUNTER_FROM = BIO_MAX - 40;

// Hints are spans (a <p> is not allowed inside <label>).
// .field in auth.module.css sets uppercase mono text on everything inside
// the label; hints and the textarea reset that explicitly.
const hint = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontSize: '0.8rem',
  textTransform: 'none',
  letterSpacing: 'normal',
  color: 'var(--text-muted)',
  margin: 0,
} as const;

const textarea = {
  fontFamily: 'var(--font-body)',
  fontSize: '1rem',
  textTransform: 'none',
  letterSpacing: 'normal',
  color: 'var(--text-primary)',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '0.65rem 0.75rem',
  resize: 'vertical',
  minHeight: '5rem',
} as const;

export function ProfileForm({
  username,
  initialDisplayName,
  initialBio,
}: {
  username: string;
  initialDisplayName: string | null;
  initialBio: string | null;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName ?? '');
  const [bio, setBio] = useState(initialBio ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName, bio }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setError('Could not save. Try again.');
        return;
      }
      // Show what the server stored (trimmed, empty -> cleared), not what was typed.
      setDisplayName(data.display_name ?? '');
      setBio(data.bio ?? '');
      setSaved(true);
      router.refresh();
    } catch {
      setError('Could not save. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={formStyles.form}>
      <label className={formStyles.field}>
        <span>Display name</span>
        <input
          type="text"
          dir="auto"
          value={displayName}
          maxLength={DISPLAY_NAME_MAX}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setSaved(false);
          }}
          autoComplete="nickname"
        />
        <span style={hint}>
          How your name appears on your work. A nickname or a signature is fine. Leave it
          empty and people see @{username}.
        </span>
      </label>
      <label className={formStyles.field}>
        <span>About you</span>
        <textarea
          dir="auto"
          value={bio}
          maxLength={BIO_MAX}
          rows={3}
          onChange={(e) => {
            setBio(e.target.value);
            setSaved(false);
          }}
          style={textarea}
        />
        <span style={hint}>
          A line or two for your artist page.
          {bio.length >= BIO_COUNTER_FROM && ` ${bio.length} / ${BIO_MAX}`}
        </span>
      </label>
      <label className={formStyles.field}>
        <span>Username</span>
        <input type="text" value={username} readOnly style={{ opacity: 0.6 }} />
        <span style={hint}>
          Your page&apos;s permanent address. It can&apos;t be changed, so links people saved
          keep working.
        </span>
      </label>
      {error && <p className={formStyles.error}>{error}</p>}
      {saved && <p style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>Saved.</p>}
      <button type="submit" className={formStyles.submit} disabled={submitting}>
        {submitting ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}

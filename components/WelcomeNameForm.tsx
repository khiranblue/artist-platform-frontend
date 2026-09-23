'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import formStyles from '@/app/auth.module.css';

// Same limit the backend enforces (PATCH /account/profile).
const DISPLAY_NAME_MAX = 60;

const hint = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.8rem',
  color: 'var(--text-muted)',
  margin: 0,
} as const;

/**
 * The one question asked right after sign-up. Sends display_name only, so
 * nothing else on the account is touched. Both answers lead to Overview.
 */
export function WelcomeNameForm({ username }: { username: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: name }),
      });
      if (!res.ok) {
        setError('Could not save. Try again.');
        return;
      }
      router.push('/dashboard');
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
          value={name}
          maxLength={DISPLAY_NAME_MAX}
          onChange={(e) => setName(e.target.value)}
          autoComplete="nickname"
          autoFocus
        />
      </label>
      <p style={hint}>
        Skip it and people see @{username}. You can change it any time in Settings.
      </p>
      {error && <p className={formStyles.error}>{error}</p>}
      <button type="submit" className={formStyles.submit} disabled={submitting || !name.trim()}>
        {submitting ? 'Saving…' : 'Save'}
      </button>
      <Link href="/dashboard" className={formStyles.link}>
        Later
      </Link>
    </form>
  );
}

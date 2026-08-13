'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import formStyles from '../app/auth.module.css';

export function GenerateInviteButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/invites/generate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === 'invite_eligibility_not_met'
            ? 'You need one published work or 7 clean days before inviting.'
            : data.error === 'pending_invites_limit'
            ? 'You already have the maximum number of pending invites.'
            : 'Could not generate an invite.'
        );
        return;
      }
      // Refetches the server component above with the new invite included.
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || submitting}
        className={formStyles.submit}
      >
        {submitting ? 'Generating…' : 'Generate invite'}
      </button>
      {error && <p className={formStyles.error}>{error}</p>}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';
import formStyles from '../../auth.module.css';

export default function SettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/account/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: currentPassword, new_email: newEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === 'incorrect_password'
            ? 'Current password is incorrect.'
            : data.error === 'email_already_in_use'
            ? 'That email is already associated with another account.'
            : 'Could not update your email.'
        );
        return;
      }
      setSuccess('Check your inbox to confirm this email address.');
      setCurrentPassword('');
      setNewEmail('');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className={styles.heading}>Settings</h1>
      <div className={styles.card}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
          Adding an email lets you recover your account if you forget your password. It stays
          optional — accounts without one can only be recovered manually.
        </p>
        <form onSubmit={handleSubmit} className={formStyles.form}>
          <label className={formStyles.field}>
            <span>Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <label className={formStyles.field}>
            <span>Email address</span>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          {error && <p className={formStyles.error}>{error}</p>}
          {success && <p style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>{success}</p>}
          <button type="submit" className={formStyles.submit} disabled={submitting}>
            {submitting ? 'Sending…' : 'Send verification link'}
          </button>
        </form>
      </div>
    </div>
  );
}

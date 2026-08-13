'use client';

import { useState } from 'react';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      // Always shown, regardless of the actual outcome — the backend's
      // response is deliberately generic, and the UI must not undo that
      // by branching on success/failure here.
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Reset your password</h1>
      {submitted ? (
        <p>If that account has a verified email, a reset link is on its way.</p>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </div>
  );
}

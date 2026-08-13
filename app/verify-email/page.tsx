'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '../auth.module.css';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    fetch('/api/account/email/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => (res.ok ? setStatus('success') : setStatus('error')))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Email verification</h1>
      {status === 'pending' && <p>Verifying…</p>}
      {status === 'success' && <p>Your email is confirmed. You can now use it to recover your account.</p>}
      {status === 'error' && (
        <p className={styles.error}>This link is invalid or has expired. Request a new one from Settings.</p>
      )}
    </div>
  );
}

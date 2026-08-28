'use client';

import { Fragment, useEffect, useState } from 'react';
import styles from '../dashboard.module.css';
import formStyles from '../../auth.module.css';

interface InviteTreeNode {
  id: string;
  username: string;
  display_name: string | null;
  account_status: string;
  chain_depth: number;
  created_at: string;
  inviter_username: string | null;
  published_count: number;
  last_artwork_at: string | null;
  invites_used: number;
  invites_pending: number;
}

// Authorization is decided entirely by the initial data fetch. Until it
// resolves, and if it fails, this component renders nothing at all — no
// heading, no table shell, no form labels. A logged-in artist who is not
// an admin (or anyone not authenticated) gets a blank page, not a page
// that visibly says "Admin" and shows disabled-looking controls. This is
// the client-side half of the same flat-404 principle the backend already
// applies: existence of this surface is never confirmed to the wrong
// viewer, only real authorization unlocks anything.
type AuthState = 'pending' | 'authorized' | 'unauthorized';

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>('pending');
  const [nodes, setNodes] = useState<InviteTreeNode[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [activeGrantId, setActiveGrantId] = useState<string | null>(null);
  const [grantAmount, setGrantAmount] = useState('');
  const [grantReason, setGrantReason] = useState('');
  const [grantSubmitting, setGrantSubmitting] = useState(false);
  const [grantError, setGrantError] = useState<string | null>(null);
  const [grantSuccess, setGrantSuccess] = useState<string | null>(null);

  const [artworkId, setArtworkId] = useState('');
  const [reasonType, setReasonType] = useState('other');
  const [actionTaken, setActionTaken] = useState('');
  const [hideSubmitting, setHideSubmitting] = useState(false);
  const [hideError, setHideError] = useState<string | null>(null);
  const [hideSuccess, setHideSuccess] = useState<string | null>(null);

  async function loadTree() {
    try {
      const res = await fetch('/api/admin/invite-tree');
      if (!res.ok) {
        setLoadError(true);
        setNodes(null);
        setAuthState('unauthorized');
        return;
      }
      const data = await res.json();
      setNodes(data.nodes);
      setLoadError(false);
      setAuthState('authorized');
    } catch {
      setLoadError(true);
      setAuthState('unauthorized');
    }
  }

  useEffect(() => {
    loadTree();
  }, []);

  async function handleGrantSubmit(e: React.FormEvent, userId: string) {
    e.preventDefault();
    setGrantError(null);
    setGrantSuccess(null);
    setGrantSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/invite-quota`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(grantAmount), reason: grantReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGrantError(data.message || data.error || 'Could not grant quota.');
        return;
      }
      setGrantSuccess(`${data.username}: ${data.previous_quota} -> ${data.new_quota}`);
      setGrantAmount('');
      setGrantReason('');
      setActiveGrantId(null);
      loadTree();
    } finally {
      setGrantSubmitting(false);
    }
  }

  async function handleHideSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHideError(null);
    setHideSuccess(null);
    setHideSubmitting(true);
    try {
      const res = await fetch(`/api/admin/artworks/${artworkId}/hide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason_type: reasonType, action_taken: actionTaken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setHideError(data.message || data.error || 'Could not hide artwork.');
        return;
      }
      setHideSuccess(`Hidden ${data.artist_username}'s artwork at ${data.hidden_at}`);
      setArtworkId('');
      setActionTaken('');
    } finally {
      setHideSubmitting(false);
    }
  }

  // Pending or unauthorized: render truly nothing. No heading, no layout
  // hint that this is an admin surface.
  if (authState !== 'authorized') {
    return null;
  }

  return (
    <div>
      <h1 className={styles.heading}>Admin</h1>

      <div className={styles.card}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
          Invite tree — every user, who invited them, and life signals.
        </p>
        {loadError && <p className={formStyles.error}>No data available.</p>}
        {!loadError && !nodes && <p style={{ fontSize: '0.85rem' }}>Loading…</p>}
        {nodes && (
          <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.4rem 0.3rem 0.4rem 0' }}>User</th>
                <th style={{ padding: '0.4rem 0.3rem' }}>Status</th>
                <th style={{ padding: '0.4rem 0.3rem' }}>Invited by</th>
                <th style={{ padding: '0.4rem 0.3rem' }}>Published</th>
                <th style={{ padding: '0.4rem 0.3rem' }}>Invites</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((n) => (
                <Fragment key={n.id}>
                  <tr style={{ borderBottom: activeGrantId === n.id ? 'none' : '1px solid var(--border)' }}>
                    <td style={{ padding: '0.4rem 0.3rem 0.4rem 0' }}>{n.username}</td>
                    <td style={{ padding: '0.4rem 0.3rem' }}>{n.account_status}</td>
                    <td style={{ padding: '0.4rem 0.3rem' }}>{n.inviter_username ?? '—'}</td>
                    <td style={{ padding: '0.4rem 0.3rem' }}>{n.published_count}</td>
                    <td style={{ padding: '0.4rem 0.3rem' }}>
                      {n.invites_used}/{n.invites_pending}
                    </td>
                    <td style={{ padding: '0.4rem 0.3rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveGrantId(activeGrantId === n.id ? null : n.id);
                          setGrantError(null);
                          setGrantSuccess(null);
                        }}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          background: 'none',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          padding: '0.3rem 0.6rem',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                        }}
                      >
                        Grant quota
                      </button>
                    </td>
                  </tr>
                  {activeGrantId === n.id && (
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td colSpan={6} style={{ padding: '0.6rem 0' }}>
                        <form
                          onSubmit={(e) => handleGrantSubmit(e, n.id)}
                          style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}
                        >
                          <label className={formStyles.field} style={{ minWidth: '80px' }}>
                            <span>Amount</span>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={grantAmount}
                              onChange={(e) => setGrantAmount(e.target.value)}
                              required
                            />
                          </label>
                          <label className={formStyles.field} style={{ flex: 1, minWidth: '200px' }}>
                            <span>Reason</span>
                            <input
                              type="text"
                              value={grantReason}
                              onChange={(e) => setGrantReason(e.target.value)}
                              required
                            />
                          </label>
                          <button
                            type="submit"
                            className={formStyles.submit}
                            disabled={grantSubmitting}
                            style={{ marginTop: 0 }}
                          >
                            {grantSubmitting ? 'Granting…' : 'Confirm'}
                          </button>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
        {grantError && <p className={formStyles.error}>{grantError}</p>}
        {grantSuccess && <p style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>{grantSuccess}</p>}
      </div>

      <div className={styles.card}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
          Hide an artwork by ID — this form does not list artworks; copy the ID from its public page URL.
        </p>
        <form onSubmit={handleHideSubmit} className={formStyles.form}>
          <label className={formStyles.field}>
            <span>Artwork ID</span>
            <input type="text" value={artworkId} onChange={(e) => setArtworkId(e.target.value)} required />
          </label>
          <label className={formStyles.field}>
            <span>Reason type</span>
            <select
              value={reasonType}
              onChange={(e) => setReasonType(e.target.value)}
              style={{
                padding: '0.65rem 0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="content_violation">Content violation</option>
              <option value="invite_fraud">Invite fraud</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className={formStyles.field}>
            <span>Details</span>
            <input type="text" value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} required />
          </label>
          {hideError && <p className={formStyles.error}>{hideError}</p>}
          {hideSuccess && <p style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>{hideSuccess}</p>}
          <button type="submit" className={formStyles.submit} disabled={hideSubmitting}>
            {hideSubmitting ? 'Hiding…' : 'Hide artwork'}
          </button>
        </form>
      </div>
    </div>
  );
}

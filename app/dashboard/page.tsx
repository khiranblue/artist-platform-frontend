import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { getCurrentUser } from '@/lib/currentUser';
import styles from './dashboard.module.css';

// This page reads the session cookie, so it is already dynamic; the
// `cache: 'no-store'` below is what keeps the *data* cache from serving a
// stale series after a new capture. Without it the card would show the
// previous series for up to a full revalidation window.
export const revalidate = 0;

interface LatestSeries {
  series_id: string;
  title: string | null;
  field: string;
  entry_count: number;
  cover_url: string | null;
  updated_at: string;
}

const FIELD_LABELS: Record<string, string> = {
  painting: 'Painting',
  wood: 'Wood',
  metal: 'Metal',
  plants: 'Plants',
  other: 'Other',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** The most recently touched series, or null for a new artist (or any error). */
async function getLatestSeries(): Promise<LatestSeries | null> {
  try {
    const data = await apiFetch<{ series: LatestSeries[] }>('/dashboard/series?limit=1', {
      auth: true,
      cache: 'no-store',
    });
    return data.series?.[0] ?? null;
  } catch {
    return null;
  }
}

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null; // layout already redirects; this satisfies TS narrowing

  const latest = await getLatestSeries();

  const usedPct = Math.min(
    (user.storage_used_mb / Math.max(user.storage_quota_mb, 0.01)) * 100,
    100
  );

  return (
    <div>
      <h1 className={styles.heading}>Overview</h1>

      {/* Picking up where you left off is one tap: ?series=<id> preselects the
          series in Capture and shows its last photo before the camera opens. */}
      {latest ? (
        <div className={styles.card}>
          {latest.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={latest.cover_url}
              alt=""
              style={{
                width: '100%',
                maxHeight: '32vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius)',
                display: 'block',
                marginBottom: 'var(--space-2)',
              }}
            />
          )}
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.1rem' }}>
            {latest.title ?? 'Untitled'}
          </div>
          <div className={styles.rowLabel} style={{ display: 'block', marginTop: '0.25rem' }}>
            {FIELD_LABELS[latest.field] ?? latest.field} · {latest.entry_count}{' '}
            {latest.entry_count === 1 ? 'image' : 'images'} · last added {formatDate(latest.updated_at)}
          </div>
          <Link
            href={`/dashboard/capture?series=${latest.series_id}`}
            style={{
              display: 'inline-block',
              marginTop: 'var(--space-2)',
              padding: '0.35rem 0.7rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent)',
              textDecoration: 'none',
              border: '1px solid var(--accent-dim)',
              borderRadius: 'var(--radius)',
            }}
          >
            + Continue this series
          </Link>
        </div>
      ) : (
        <div className={styles.card}>
          <p style={{ marginTop: 0 }}>Nothing here yet &mdash; and that&apos;s fine.</p>
          <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>
            Photograph anything you&apos;re working on. Even a rough one. No one sees it but
            you. <Link href="/dashboard/capture" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Take the first photo</Link>.
          </p>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Username</span>
          <span>{user.username}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Account status</span>
          <span>{user.account_status}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Storage</span>
          <span>
            {user.storage_used_mb.toFixed(1)} MB / {user.storage_quota_mb.toFixed(0)} MB (
            {usedPct.toFixed(0)}%)
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Email</span>
          <span>
            {user.email ? user.email : user.email_verification_pending ? 'Pending verification' : 'Not set'}
          </span>
        </div>
      </div>
    </div>
  );
}

import { getCurrentUser } from '@/lib/currentUser';
import styles from './dashboard.module.css';

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null; // layout already redirects; this satisfies TS narrowing

  const usedPct = Math.min(
    (user.storage_used_mb / Math.max(user.storage_quota_mb, 0.01)) * 100,
    100
  );

  return (
    <div>
      <h1 className={styles.heading}>Overview</h1>
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

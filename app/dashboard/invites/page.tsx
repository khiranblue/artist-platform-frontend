import { apiFetch } from '@/lib/api';
import styles from '../dashboard.module.css';
import { GenerateInviteButton } from '@/components/GenerateInviteButton';

interface InviteStatus {
  pending_count: number;
  max_pending: number;
  available_slots: number;
  is_eligible: boolean;
}

interface InviteRow {
  code: string;
  status: string;
  expires_at: string | null;
  created_at: string;
  used_by_username: string | null;
}

export default async function InvitesPage() {
  const [status, list] = await Promise.all([
    apiFetch<InviteStatus>('/invites/status', { auth: true }),
    apiFetch<{ invites: InviteRow[] }>('/invites/mine', { auth: true }),
  ]);

  return (
    <div>
      <h1 className={styles.heading}>Invites</h1>

      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Pending</span>
          <span>
            {status.pending_count} / {status.max_pending}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Eligible to invite</span>
          <span>{status.is_eligible ? 'Yes' : 'Not yet'}</span>
        </div>
      </div>

      <GenerateInviteButton
        disabled={!status.is_eligible || status.available_slots === 0}
      />

      <div className={styles.card} style={{ marginTop: '1.5rem' }}>
        {list.invites.length === 0 ? (
          <p>No invites yet.</p>
        ) : (
          list.invites.map((invite) => (
            <div className={styles.row} key={invite.code}>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{invite.code}</span>
              <span>
                {invite.status}
                {invite.used_by_username ? ` — ${invite.used_by_username}` : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

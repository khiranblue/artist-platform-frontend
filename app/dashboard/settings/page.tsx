import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/currentUser';
import { ProfileForm } from '@/components/ProfileForm';
import { EmailForm } from '@/components/EmailForm';
import styles from '../dashboard.module.css';

// The profile form must open with what is saved now, never a cached copy.
export const dynamic = 'force-dynamic';

const sectionHeading = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  fontWeight: 'normal',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--text-muted)',
  margin: '0 0 var(--space-2)',
} as const;

export default async function SettingsPage() {
  const user = await getCurrentUser();
  // The dashboard layout already redirects; this narrows the type.
  if (!user) redirect('/login');

  return (
    <div>
      <h1 className={styles.heading}>Settings</h1>
      <section className={styles.card}>
        <h2 style={sectionHeading}>Profile</h2>
        <ProfileForm
          username={user.username}
          initialDisplayName={user.display_name}
          initialBio={user.bio}
        />
      </section>
      <section className={styles.card}>
        <h2 style={sectionHeading}>Email</h2>
        <EmailForm />
      </section>
    </div>
  );
}

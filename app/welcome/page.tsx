import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/currentUser';
import { WelcomeNameForm } from '@/components/WelcomeNameForm';
import styles from '../auth.module.css';

export const metadata = { title: 'Welcome' };
// Reads the signed-in user on every request: a name saved elsewhere must
// send the artist straight on instead of asking again.
export const dynamic = 'force-dynamic';

/**
 * Shown once, right after registration (RegisterForm sends new accounts
 * here). An empty display name shows the login name to the public, so this
 * is the one question worth asking at sign-up. "Later" is final: nothing
 * brings this page back, so no flag is stored anywhere — Settings holds the
 * same field for whenever the artist wants it.
 */
export default async function WelcomePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.display_name) redirect('/dashboard');

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>What name should people see?</h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          margin: '0 0 var(--space-3)',
        }}
      >
        It appears on your work and your artist page. A nickname or a signature is fine.
      </p>
      <WelcomeNameForm username={user.username} />
    </div>
  );
}

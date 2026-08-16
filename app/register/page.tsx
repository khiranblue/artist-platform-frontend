import { Suspense } from 'react';
import { RegisterForm } from '@/components/RegisterForm';

// Pure Server Component: exports the tab title. RegisterForm reads
// useSearchParams (for the ?code= invite param), which Next.js requires
// to sit inside a Suspense boundary — otherwise the whole route opts out
// of static rendering and the build warns. The wrapper lives here in the
// server layer, outside the client component, so it actually takes effect.
export const metadata = {
  title: 'Register',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p>}>
      <RegisterForm />
    </Suspense>
  );
}

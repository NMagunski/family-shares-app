import AuthWelcome from '@/components/auth/AuthWelcome';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import React from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/router';

type FirebaseAuthErrorLike = {
  code?: string;
};

function getErrorCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const maybe = (err as FirebaseAuthErrorLike).code;
    return typeof maybe === 'string' ? maybe : undefined;
  }
  return undefined;
}

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!email) {
      setError('Моля, въведи имейл адрес.');
      return;
    }

    try {
      setSubmitting(true);
      await sendPasswordResetEmail(auth, email);
      setMessage(
        'Изпратихме ти имейл с линк за смяна на паролата. Провери пощата си (вкл. спам/промоции).'
      );
    } catch (err: unknown) {
      console.error(err);
      const code = getErrorCode(err);

      if (code === 'auth/user-not-found') {
        setError('Няма регистриран потребител с този имейл.');
      } else if (code === 'auth/invalid-email') {
        setError('Невалиден имейл адрес.');
      } else {
        setError('Възникна грешка. Опитай отново по-късно.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="auth-page">
        <Card className="auth-card auth-recovery"><AuthWelcome mode="recovery"/>
          <h1 className="mb-2 text-xl font-semibold text-eco-text">
            Забравена парола
          </h1>
          <p className="mb-4 text-sm text-eco-text-muted">
            Въведи имейла, с който се регистрира, и ще ти изпратим линк за
            промяна на паролата.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Имейл адрес" id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />

            {error && (
              <p className="text-xs text-eco-error bg-red-500/5 border border-red-500/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {message && (
              <p className="text-xs text-eco-accent bg-emerald-500/5 border border-emerald-500/40 rounded-lg px-3 py-2">
                {message}
              </p>
            )}

            <Button type="submit" className="auth-submit" disabled={submitting}>{submitting ? 'Изпращане...' : 'Изпрати линк за нова парола'}</Button>
          </form>

          <button
            type="button"
            className="mt-4 min-h-[44px] text-sm text-eco-text-muted hover:text-eco-text underline underline-offset-2"
            onClick={() => router.push('/login')}
          >
            ← Обратно към вход
          </button>
        </Card>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;

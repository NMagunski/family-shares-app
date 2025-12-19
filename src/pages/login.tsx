import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type FirebaseAuthErrorLike = {
  code?: string;
  message?: string;
};

function getErrorCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const maybe = (err as FirebaseAuthErrorLike).code;
    return typeof maybe === 'string' ? maybe : undefined;
  }
  return undefined;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { redirect } = router.query;

  // безопасен redirect (само вътрешни URL-и)
  const redirectTarget =
    typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
      await router.replace(redirectTarget);
    } catch (err: unknown) {
      console.error(err);
      const code = getErrorCode(err);

      if (code === 'auth/user-not-found') {
        setError(
          'Няма регистриран потребител с този email. Моля, регистрирай се.'
        );
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password'
      ) {
        setError('Грешен email или парола. Провери данните и опитай отново.');
      } else if (code === 'auth/too-many-requests') {
        setError(
          'Твърде много неуспешни опити за вход. Опитай отново по-късно или смени паролата си.'
        );
      } else {
        setError('Възникна грешка при вход. Опитай отново след малко.');
      }
    } finally {
      setLoading(false);
    }
  }

  const registerHref =
    typeof redirect === 'string' && redirect.startsWith('/')
      ? `/register?redirect=${encodeURIComponent(redirect)}`
      : '/register';

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 px-4">
        <Card className="p-6">
          <h1 className="text-xl font-semibold text-eco-text mb-4">Вход</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Парола"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-sm text-red-500 bg-red-500/5 border border-red-500/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <p className="text-right -mt-2 mb-2">
              <Link
                href="/forgot-password"
                className="text-xs text-eco-accent hover:underline"
              >
                Забравена парола?
              </Link>
            </p>

            <Button type="submit" disabled={loading}>
              {loading ? 'Влизане...' : 'Влез'}
            </Button>
          </form>

          <p className="mt-4 text-sm text-eco-text-muted">
            Нямаш акаунт?{' '}
            <Link href={registerHref} className="text-eco-accent hover:underline">
              Регистрирай се
            </Link>
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default LoginPage;

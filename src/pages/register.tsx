import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { redirect } = router.query;

  // безопасен redirect – само вътрешни пътища
  const redirectTarget =
    typeof redirect === 'string' && redirect.startsWith('/')
      ? redirect
      : '/';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await router.replace(redirectTarget);
    } catch (err: any) {
      console.error(err);
      const code = err?.code as string | undefined;

      if (code === 'auth/email-already-in-use') {
        setError('Вече има регистриран потребител с този email. Можеш да влезеш.');
      } else if (code === 'auth/weak-password') {
        setError('Паролата е твърде слаба. Използвай поне 6 символа.');
      } else {
        setError('Възникна грешка при регистрация. Опитай отново.');
      }
    } finally {
      setLoading(false);
    }
  }

  const loginHref =
    typeof redirect === 'string' && redirect.startsWith('/')
      ? `/login?redirect=${encodeURIComponent(redirect)}`
      : '/login';

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 px-4">
        <Card className="p-6">
          <h1 className="text-xl font-semibold text-eco-text mb-4">
            Регистрация
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
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
              <p className="text-red-400 text-sm">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Регистриране...' : 'Регистрирай се'}
            </Button>
          </form>

          <p className="mt-4 text-sm text-eco-text-muted">
            Вече имаш акаунт?{' '}
            <Link href={loginHref} className="text-eco-accent hover:underline">
              Влез
            </Link>
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default RegisterPage;

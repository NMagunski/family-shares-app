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

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const redirectTarget =
    typeof redirect === 'string' && redirect.length > 0 ? redirect : '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push(redirectTarget);
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
    typeof redirect === 'string' && redirect.length > 0
      ? `/login?redirect=${encodeURIComponent(redirect)}`
      : '/login';

  return (
    <Layout>
      <div
        style={{
          maxWidth: 480,
          margin: '40px auto',
        }}
      >
        <Card>
          <h1 style={{ marginBottom: 16 }}>Регистрация</h1>
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
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
              <p style={{ color: 'red', fontSize: '0.9rem' }}>
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Регистриране...' : 'Регистрирай се'}
            </Button>
          </form>

          <p style={{ marginTop: 12, fontSize: '0.9rem' }}>
            Вече имаш акаунт?{' '}
            <Link href={loginHref} style={{ color: '#2563eb' }}>
              Влез
            </Link>
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default RegisterPage;

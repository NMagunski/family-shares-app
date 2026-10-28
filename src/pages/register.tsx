import { localRedirect } from '@/lib/redirect';
import { community } from '@/lib/community';
import { normalizeUsername } from '@/lib/usernames';
import AuthWelcome from '@/components/auth/AuthWelcome';
import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

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

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { redirect } = router.query;

  // безопасен redirect – само вътрешни пътища
  const redirectTarget =
    localRedirect(redirect);

  const registeredUid = React.useRef<string | null>(null);
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      normalizeUsername(username);
      if (!registeredUid.current) {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        registeredUid.current = credential.user.uid;
      }
      if (auth.currentUser?.uid !== registeredUid.current) throw new Error('Влез отново и избери username в профила.');
      await community({ action: 'username', username, displayName: username });
      await router.replace(redirectTarget);
    } catch (err: unknown) {
      console.error(err);
      const code = getErrorCode(err);

      if (code === 'auth/email-already-in-use') {
        setError(
          'Вече има регистриран потребител с този email. Можеш да влезеш.'
        );
      } else if (code === 'auth/weak-password') {
        setError('Паролата е твърде слаба. Използвай поне 6 символа.');
      } else if (code === 'auth/invalid-email') {
        setError('Невалиден email адрес.');
      } else {
        setError(err instanceof Error && !code ? err.message : 'Възникна грешка при регистрация. Опитай отново.');
      }
    } finally {
      setLoading(false);
    }
  }

  const loginHref =
    typeof redirect === 'string' && localRedirect(redirect, '') !== ''
      ? `/login?redirect=${encodeURIComponent(redirect)}`
      : '/login';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <Card className="p-6 auth-card"><AuthWelcome mode="register"/>
          <h1 className="text-xl font-semibold text-eco-text mb-4">
            Регистрация
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} maxLength={24} autoComplete="username"/>
            <p className="text-xs text-eco-text-muted">Латински букви, цифри и _. Започва с буква; главни и малки букви са равнозначни.</p>
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

            {error && <p className="text-red-400 text-sm">{error}</p>}

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

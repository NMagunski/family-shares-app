import React from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export type AuthMode = 'login' | 'register';

type AuthFormProps = {
  mode: AuthMode;
  onSubmit?: (data: { email: string; password: string }) => Promise<void> | void;
};

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit?.({ email, password });
    } catch (err: any) {
      setError(err?.message || 'Възникна грешка. Опитай отново.');
    } finally {
      setLoading(false);
    }
  }

  const title = mode === 'login' ? 'Вход' : 'Регистрация';

  return (
    <Card>
      <h1 style={{ marginBottom: 12 }}>{title}</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}
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
          <p style={{ color: 'red', fontSize: '0.85rem' }}>
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading}>
          {loading
            ? 'Моля, изчакай...'
            : mode === 'login'
            ? 'Влез'
            : 'Регистрирай се'}
        </Button>
      </form>
    </Card>
  );
};

export default AuthForm;

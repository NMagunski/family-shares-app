import React from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Моля въведи email.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(
        "Ако съществува акаунт с този email, изпратихме ти линк за смяна на паролата."
      );
    } catch (err: any) {
      console.error(err);

      if (err.code === "auth/user-not-found") {
        setError("Няма потребител с този email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Невалиден email адрес.");
      } else {
        setError("Грешка при изпращане на имейл. Опитай отново.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 px-4">
        <Card className="p-6">
          <h1 className="text-xl font-semibold text-eco-text mb-4">
            Нулиране на парола
          </h1>

          <p className="text-sm text-eco-text-muted mb-4">
            Въведи своя email и ще ти изпратим линк за задаване на нова парола.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-emerald-400 text-sm">{success}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? "Изпращане..." : "Изпрати линк"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-eco-text-muted">
            <Link href="/login" className="text-eco-accent hover:underline">
              ← Назад към вход
            </Link>
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;

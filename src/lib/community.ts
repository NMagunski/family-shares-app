import { auth } from '@/lib/firebase';
export async function community<T = { ok: boolean; error?: string }>(body: Record<string, unknown>): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Влез в профила си.');
  const response = await fetch('/api/community', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || 'Заявката не успя.');
  return data as T;
}

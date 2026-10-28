import Link from 'next/link';
import React from 'react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { community } from '@/lib/community';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
export default function Profile() {
  const { user, loading } = useAuth();
  const [username, setUsername] = React.useState(''), [name, setName] = React.useState('');
  const [chosen, setChosen] = React.useState(false), [busy, setBusy] = React.useState(false), [status, setStatus] = React.useState('');
  React.useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'publicProfiles', user.uid), snap => {
      if (snap.exists()) { setUsername(snap.data().username); setName(snap.data().displayName); setChosen(true); }
    }, () => setStatus('Профилът не може да бъде зареден.'));
  }, [user]);
  return <Layout><Card><h1 className="text-3xl mb-4">Твоят профил</h1>{loading ? <p>Зареждане…</p> : !user ? <Link href="/login">Вход</Link> : <form className="grid gap-4" onSubmit={async e => {
    e.preventDefault(); if (busy) return; setBusy(true); setStatus('');
    try { await community({ action: 'username', username, displayName: name }); setChosen(true); setStatus('✓ Профилът е запазен.'); }
    catch (err) { setStatus(err instanceof Error ? err.message : 'Опитай отново.'); } finally { setBusy(false); }
  }}><Input label="Username" value={username} readOnly={chosen} onChange={e => setUsername(e.target.value)} required />
  <p className="text-sm text-eco-text-muted">3–24 латински букви, цифри или _. Започва с буква. Главни и малки букви са равнозначни. Изборът запазва съществуващите ти членства.</p>
  <Input label="Име за показване" value={name} onChange={e => setName(e.target.value)} required maxLength={80}/><Button disabled={busy}>{busy ? 'Запазване…' : 'Запази'}</Button></form>}<p role="status">{status}</p></Card></Layout>;
}

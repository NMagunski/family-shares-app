import Link from 'next/link';
import React from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { community } from '@/lib/community';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { InvitationStatus } from '@/lib/usernames';
type Invite = { id: string; tripId: string; tripName: string; senderName: string; status: InvitationStatus; expiresAt: number; allowedFamilyId?: string; allowedFamilyName?: string };
const labels = { pending: 'Чакаща', accepted: 'Приета', declined: 'Отказана', revoked: 'Отменена', expired: 'Изтекла' };
function Invitation({ invite }: { invite: Invite }) {
  const { user } = useAuth();
  const [families, setFamilies] = React.useState<{id:string;name:string}[]>([]);
  const [familyId, setFamilyId] = React.useState('');
  React.useEffect(() => {
    if (!user) return;
    return onSnapshot(query(collection(db, 'families'), where('userId', '==', user.uid), where('tripId', '==', invite.tripId)), snap => setFamilies(snap.docs.map(d => ({id:d.id,name:d.data().name}))), () => setFamilies([]));
  }, [user, invite.tripId]);
  const [familyName, setFamilyName] = React.useState(''), [busy, setBusy] = React.useState(false), [message, setMessage] = React.useState('');
  const status = invite.status === 'pending' && invite.expiresAt <= Date.now() ? 'expired' : invite.status;
  async function respond(action: string) {
    if (busy) return; setBusy(true); setMessage('');
    try { await community({ action, invitationId: invite.id, familyName, familyId }); setMessage(action === 'accept' ? '✓ Присъедини се успешно.' : 'Поканата е отказана.'); }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Опитай отново.'); } finally { setBusy(false); }
  }
  return <Card><h2 className="text-xl">{invite.tripName}</h2><p>{invite.senderName} те кани.</p><p className="text-eco-text-muted">{labels[status]}</p>{status === 'pending' && <form className="grid gap-3 mt-4" onSubmit={e => { e.preventDefault(); void respond('accept'); }}>{(families.length > 0 || invite.allowedFamilyId) && <label>Твоето семейство<select value={familyId} onChange={e => setFamilyId(e.target.value)}><option value="">Създай ново</option>{invite.allowedFamilyId && <option value={invite.allowedFamilyId}>{invite.allowedFamilyName} — разрешено от подателя</option>}{families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>}<Input label="Име на новото семейство" value={familyName} onChange={e => setFamilyName(e.target.value)} required={!familyId} disabled={!!familyId} maxLength={80}/><Button disabled={busy}>{busy ? 'Обработка…' : 'Приеми и създай семейство'}</Button><Button type="button" variant="secondary" disabled={busy} onClick={() => void respond('decline')}>Откажи</Button></form>}{status === 'accepted' && <a className="text-eco-accent" href={`/trips/${invite.tripId}`}>Към пътуването →</a>}<p role="status">{message}</p></Card>;
}
export default function Invitations() {
  const { user, loading } = useAuth();
  const [invites, setInvites] = React.useState<Invite[]>([]), [error, setError] = React.useState('');
  React.useEffect(() => {
    if (!user) return;
    return onSnapshot(query(collection(db, 'tripInvitations'), where('targetId', '==', user.uid)), snap => setInvites(snap.docs.map(d => ({ ...d.data(), id: d.id } as Invite))), () => setError('Поканите не могат да се заредят.'));
  }, [user]);
  return <Layout><h1 className="text-3xl mb-6">Твоите покани</h1><div className="grid gap-4">{loading ? 'Зареждане…' : !user ? <Link href="/login">Влез в профила си</Link> : invites.length ? invites.map(i => <Invitation key={i.id} invite={i}/>) : 'Няма покани.'}<p role="alert">{error}</p></div></Layout>;
}

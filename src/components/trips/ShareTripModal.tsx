import React from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { community } from '@/lib/community';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
type Profile = { uid: string; username: string; displayName: string };
type Invite = { id: string; targetId: string; status: string; expiresAt: number };
export default function ShareTripModal({ isOpen, onClose, shareUrl }: { isOpen: boolean; onClose: () => void; shareUrl: string }) {
  const tripId = shareUrl.split('/').filter(Boolean).pop() ?? '';
  const opener = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => { if (isOpen) { opener.current = document.activeElement as HTMLElement | null; return () => opener.current?.focus(); } }, [isOpen]);
  const [username, setUsername] = React.useState(''), [profile, setProfile] = React.useState<Profile | null>(null);
  const [busy, setBusy] = React.useState(false), [status, setStatus] = React.useState('');
  const [ownFamilies, setOwnFamilies] = React.useState<{id:string;name:string}[]>([]);
  const [familyId, setFamilyId] = React.useState('');
  const [invites, setInvites] = React.useState<Invite[]>([]);
  React.useEffect(() => {
    if (!isOpen || !tripId) return;
    const stopFamilies = auth.currentUser ? onSnapshot(query(collection(db, 'families'), where('tripId', '==', tripId), where('userId', '==', auth.currentUser.uid)), snap => setOwnFamilies(snap.docs.map(d => ({id:d.id,name:d.data().name}))), () => setOwnFamilies([])) : () => {};
    const stopInvites = onSnapshot(query(collection(db, 'tripInvitations'), where('tripId', '==', tripId)), snap => setInvites(snap.docs.map(d => ({ ...d.data(), id: d.id } as Invite))), () => setStatus('Само организаторът може да преглежда поканите.'));
    return () => { stopFamilies(); stopInvites(); };
  }, [tripId, isOpen]);
  if (!isOpen) return null;
  async function run(action: () => Promise<unknown>, message: string) {
    if (busy) return; setBusy(true); setStatus('');
    try { await action(); setStatus(message); } catch (err) { setStatus(err instanceof Error ? err.message : 'Опитай отново.'); } finally { setBusy(false); }
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onKeyDown={e => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    if (e.key === 'Tab') {
      const nodes = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),[tabindex="0"]')];
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  }}><div role="dialog" aria-modal="true" aria-labelledby="invite-title" className="w-full max-w-md max-h-[90dvh] overflow-y-auto"><Card><h2 id="invite-title" className="text-xl mb-3">Покани приятел</h2><form className="grid gap-3" onSubmit={e => { e.preventDefault(); void run(async () => setProfile(await community<Profile>({ action: 'lookup', username })), 'Потвърди профила по-долу.'); }}><Input autoFocus label="Username" value={username} onChange={e => { setUsername(e.target.value); setProfile(null); }} required/><Button disabled={busy}>{busy ? 'Търсене…' : 'Намери профил'}</Button></form>{profile && <div className="my-4 rounded-xl bg-eco-surface-soft p-4"><p>{profile.displayName} · @{profile.username}</p><label className="grid gap-2 my-3">Семейство при приемане<select value={familyId} onChange={e => setFamilyId(e.target.value)}><option value="">Създава свое семейство</option>{ownFamilies.map(f => <option key={f.id} value={f.id}>Предложи свързване с {f.name}</option>)}</select></label><Button disabled={busy} onClick={() => void run(() => community({ action: 'invite', tripId, targetId: profile.uid, familyId }), '✓ Поканата е изпратена.')}>{busy ? 'Изпращане…' : 'Потвърди и изпрати покана'}</Button></div>}<p role="status" className="my-3">{status}</p>{invites.filter(i => i.status === 'pending' && i.expiresAt > Date.now()).map(i => <div className="flex justify-between items-center gap-2 py-2" key={i.id}><span>Чакаща покана</span><Button variant="secondary" disabled={busy} onClick={() => void run(() => community({ action: 'revoke', invitationId: i.id }), 'Поканата е отменена.')}>Отмени</Button></div>)}<Button variant="secondary" onClick={onClose}>Затвори</Button></Card></div></div>;
}

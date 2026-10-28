import type { NextApiRequest, NextApiResponse } from 'next';
import { adminServices } from '@/server/firebase';
import { normalizeUsername } from '@/lib/usernames';

/** Mutations deliberately run with Admin SDK; no client may grant membership. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { db, auth } = adminServices();
  try {
    const bearer = req.headers.authorization;
    if (!bearer?.startsWith('Bearer ')) return res.status(401).end();
    const { uid } = await auth.verifyIdToken(bearer.slice(7), true);
    const body = req.body as Record<string, unknown>;
    const action = String(body.action ?? '');
    const str = (key: string) => typeof body[key] === 'string' ? body[key] as string : '';
    // Trusted quota, including exact-name lookups. Never return an email.
    await db.runTransaction(async tx => {
      const ref = db.doc(`communityLimits/${uid}`), snap = await tx.get(ref);
      const now = Date.now(), data = snap.data();
      const fresh = !data || now - data.start >= 60_000;
      if (!fresh && data.count >= 20) throw new Error('Твърде много заявки. Опитай след минута.');
      tx.set(ref, { start: fresh ? now : data.start, count: fresh ? 1 : data.count + 1 });
    });
    if (action === 'expense' || action === 'deleteFamily') {
      const tripId = str('tripId');
      if (!tripId || tripId.includes('/')) throw new Error('Невалидно пътуване.');
      const result = await db.runTransaction(async tx => {
        const trip = await tx.get(db.doc(`trips/${tripId}`));
        const membership = await tx.get(db.doc(`tripMemberships/${tripId}_${uid}`));
        const owner = trip.data()?.ownerId === uid;
        if (!trip.exists || (!owner && (!membership.exists || membership.data()?.userId !== uid || membership.data()?.tripId !== tripId)) || trip.data()?.archived || trip.data()?.deleting) throw new Error('Нямаш достъп до активно пътуване.');
        const families = await tx.get(db.collection('families').where('tripId', '==', tripId));
        const ids = new Set(families.docs.map(f => f.id));
        if (action === 'deleteFamily') {
          const familyId = str('familyId');
          if (!owner || !ids.has(familyId)) throw new Error('Само организаторът може да премахва семейство.');
          const expenses = await tx.get(db.collection('expenses').where('tripId', '==', tripId));
          if (expenses.docs.some(e => {
            const d = e.data();
            return d.paidByFamilyId === familyId || d.settlementFromFamilyId === familyId || d.settlementToFamilyId === familyId || !d.involvedFamilyIds?.length || d.involvedFamilyIds.includes(familyId);
          })) throw new Error('Семейството участва в разходи. Запази финансовата история; първо коригирай свързаните записи.');
          const memberships = await tx.get(db.collection('tripMemberships').where('tripId', '==', tripId));
          for (const m of memberships.docs) if (m.data().familyId === familyId) tx.update(m.ref, { familyId: null });
          tx.delete(db.doc(`families/${familyId}`)); return { ok: true };
        }
        const input = body.input as Record<string, unknown>;
        if (!input || typeof input !== 'object') throw new Error('Невалиден разход.');
        const amount = input.amount;
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || amount >= 1e9 || Math.abs(amount * 100 - Math.round(amount * 100)) > .00001 || input.currency !== trip.data()?.currency) throw new Error('Невалидна сума или валута.');
        const paidBy = String(input.paidByFamilyId ?? '');
        const type = input.type ?? 'expense';
        const involved = Array.isArray(input.involvedFamilyIds) ? [...new Set(input.involvedFamilyIds)] : [];
        if (!ids.has(paidBy) || involved.some(id => typeof id !== 'string' || !ids.has(id)) || !['expense','settlement'].includes(String(type))) throw new Error('Невалидни семейства или тип.');
        const payload: Record<string, unknown> = { tripId, amount, currency: input.currency, paidByFamilyId: paidBy, involvedFamilyIds: type === 'settlement' ? [] : involved.length ? involved : [...ids].sort(), comment: String(input.comment ?? '').slice(0, 2000), type };
        if (type === 'settlement') {
          const to = String(input.settlementToFamilyId ?? '');
          if (!ids.has(to) || to === paidBy) throw new Error('Невалидно погасяване.');
          payload.settlementFromFamilyId = paidBy; payload.settlementToFamilyId = to;
        }
        const expenseId = str('expenseId');
        const requestId = str('requestId');
        if ((expenseId || requestId).includes('/') || (!expenseId && !/^[a-zA-Z0-9-]{10,80}$/.test(requestId))) throw new Error('Невалиден запис.');
        const ref = db.doc(`expenses/${expenseId || `${uid}_${requestId}`}`);
        const old = await tx.get(ref);
        if (expenseId && (!old.exists || old.data()?.tripId !== tripId)) throw new Error('Разходът не съществува.');
        if (!expenseId && old.exists) {
          if (Object.entries(payload).some(([key, value]) => JSON.stringify(old.data()?.[key]) !== JSON.stringify(value))) throw new Error('Този запис вече е запазен с други данни. Презареди разходите преди нов опит.');
          return { ...old.data(), id: ref.id };
        }
        payload.createdAt = old.data()?.createdAt ?? new Date().toISOString();
        tx.set(ref, payload); return { ...payload, id: ref.id };
      });
      return res.json(result);
    }
    if (action === 'deleteList' || action === 'deletePersonalList') {
      const id = str('listId');
      if (!id || id.includes('/')) throw new Error('Невалиден списък.');
      const personal = action === 'deletePersonalList';
      const ref = db.doc(`${personal ? 'personalExpenseLists' : 'lists'}/${id}`);
      await db.runTransaction(async tx => {
        const list = await tx.get(ref);
        if (!list.exists) throw new Error('Списъкът не съществува.');
        const data = list.data()!;
        const [trip, membership] = await Promise.all([tx.get(db.doc(`trips/${data.tripId}`)), tx.get(db.doc(`tripMemberships/${data.tripId}_${uid}`))]);
        if (personal ? data.ownerUserId !== uid : trip.data()?.ownerId !== uid && (membership.data()?.userId !== uid || membership.data()?.tripId !== data.tripId)) throw new Error('Нямаш право да изтриеш този списък.');
        if (!trip.exists || trip.data()?.archived || trip.data()?.deleting) throw new Error('Пътуването не е активно.');
        tx.update(ref, { deleting: true });
      });
      if (personal) {
        const items = await db.collection('personalExpenseItems').where('listId', '==', id).get();
        for (const item of items.docs) await item.ref.delete();
      }
      await db.recursiveDelete(ref);
      return res.json({ ok: true });
    }
    if (action === 'deleteTrip') {
      const tripId = str('tripId');
      if (!tripId || tripId.includes('/')) throw new Error('Невалидно пътуване.');
      const tripRef = db.doc(`trips/${tripId}`);
      await db.runTransaction(async tx => {
        const trip = await tx.get(tripRef);
        if (!trip.exists || trip.data()?.ownerId !== uid) throw new Error('Само организаторът може да изтрива.');
        tx.update(tripRef, { deleting: true });
      });
      // Lock prevents new client writes; repeat requests resume incomplete cleanup.
      for (const collectionName of ['personalExpenseLists', 'lists', 'families', 'expenses', 'tripInvitations', 'tripMemberships']) {
        const records = await db.collection(collectionName).where('tripId', '==', tripId).get();
        for (const record of records.docs) {
          if (collectionName === 'personalExpenseLists') {
            const items = await db.collection('personalExpenseItems').where('listId', '==', record.id).get();
            for (const item of items.docs) await item.ref.delete();
          }
          await db.recursiveDelete(record.ref);
        }
      }
      await tripRef.delete();
      return res.json({ ok: true });
    }
    if (action === 'joinPersonal') {
      const token = str('token');
      if (!token || token.length > 100) throw new Error('Невалиден линк.');
      const lists = await db.collection('personalExpenseLists').where('shareToken', '==', token).limit(1).get();
      if (lists.empty) throw new Error('Линкът е невалиден.');
      const ref = lists.docs[0].ref;
      const result = await db.runTransaction(async tx => {
        const list = await tx.get(ref), data = list.data()!;
        const [trip, membership] = await Promise.all([tx.get(db.doc(`trips/${data.tripId}`)), tx.get(db.doc(`tripMemberships/${data.tripId}_${uid}`))]);
        if (!trip.exists || (trip.data()?.archived || trip.data()?.deleting) || (trip.data()?.ownerId !== uid && (!membership.exists || membership.data()?.userId !== uid || membership.data()?.tripId !== data.tripId))) throw new Error('Първо приеми покана за пътуването.');
        const memberUserIds = [...new Set([...data.memberUserIds, uid])];
        tx.update(ref, { memberUserIds });
        return { ...data, memberUserIds, id: ref.id };
      });
      return res.json(result);
    }
    if (action === 'username') {
      const username = normalizeUsername(str('username'));
      const name = str('displayName').trim().slice(0, 80) || username;
      await db.runTransaction(async tx => {
        const ref = db.doc(`usernames/${username}`), profile = db.doc(`publicProfiles/${uid}`);
        const [claim, existing] = await Promise.all([tx.get(ref), tx.get(profile)]);
        if (existing.exists && existing.data()?.username !== username) throw new Error('Username вече е избран.');
        if (claim.exists && claim.data()?.uid !== uid) throw new Error('Това име е заето.');
        tx.set(ref, { uid }); tx.set(profile, { username, displayName: name });
      });
      return res.json({ username });
    }
    if (action === 'lookup') {
      const username = normalizeUsername(str('username'));
      const claim = await db.doc(`usernames/${username}`).get();
      if (!claim.exists) throw new Error('Няма такъв профил.');
      const profile = await db.doc(`publicProfiles/${claim.data()!.uid}`).get();
      return res.json({ uid: claim.data()!.uid, ...profile.data() });
    }
    if (action === 'invite') {
      const tripId = str('tripId'), targetId = str('targetId');
      if (!tripId || !targetId || tripId.includes('/') || targetId.includes('/') || uid === targetId) throw new Error('Невалиден получател.');
      await db.runTransaction(async tx => {
        const tripRef = db.doc(`trips/${tripId}`), inviteRef = db.doc(`tripInvitations/${tripId}_${targetId}`);
        const [trip, member, old, sender, target] = await Promise.all([
          tx.get(tripRef), tx.get(db.doc(`tripMemberships/${tripId}_${targetId}`)), tx.get(inviteRef),
          tx.get(db.doc(`publicProfiles/${uid}`)), tx.get(db.doc(`publicProfiles/${targetId}`))
        ]);
        if (!trip.exists || trip.data()?.ownerId !== uid || (trip.data()?.archived || trip.data()?.deleting)) throw new Error('Само организаторът на активно пътуване може да кани.');
        // Legacy membership check before migration too.
        const legacy = await tx.get(db.collection('families').where('tripId', '==', tripId).where('userId', '==', targetId));
        if (member.exists || !legacy.empty || trip.data()?.ownerId === targetId) throw new Error('Потребителят вече участва.');
        if (!sender.exists || !target.exists) throw new Error('Изберете username в профила.');
        if (old.data()?.status === 'pending' && old.data()!.expiresAt > Date.now()) throw new Error('Вече има чакаща покана.');
        const allowedFamilyId = str('familyId');
        if (allowedFamilyId.includes('/')) throw new Error('Невалидно семейство.');
        const allowedFamily = allowedFamilyId ? await tx.get(db.doc(`families/${allowedFamilyId}`)) : null;
        if (allowedFamilyId && (!allowedFamily?.exists || allowedFamily.data()?.tripId !== tripId || allowedFamily.data()?.userId !== uid)) throw new Error('Можеш да предложиш само свое семейство.');
        tx.set(inviteRef, { allowedFamilyId, allowedFamilyName: allowedFamily?.data()?.name ?? '', tripId, targetId, senderId: uid, senderName: sender.data()!.displayName, tripName: trip.data()!.name, status: 'pending', createdAt: Date.now(), expiresAt: Date.now() + 7 * 86400000 });
      });
      return res.json({ ok: true });
    }
    if (['accept', 'decline', 'revoke'].includes(action)) {
      const id = str('invitationId');
      if (!id || id.includes('/')) throw new Error('Невалидна покана.');
      const result = await db.runTransaction(async tx => {
        const ref = db.doc(`tripInvitations/${id}`), invite = await tx.get(ref), data = invite.data();
        if (!data) throw new Error('Поканата не съществува.');
        const trip = await tx.get(db.doc(`trips/${data.tripId}`));
        if (action === 'revoke' ? trip.data()?.ownerId !== uid : data.targetId !== uid) throw new Error('Нямаш достъп до тази покана.');
        if (data.status === 'accepted' && action === 'accept') return { ok: true, tripId: data.tripId };
        if (data.status !== 'pending') throw new Error('Поканата вече е обработена.');
        if (!trip.exists || (trip.data()?.archived || trip.data()?.deleting) || data.expiresAt <= Date.now()) {
          tx.update(ref, { status: 'expired' }); return { error: 'Поканата е изтекла или пътуването не е активно.' };
        }
        if (action === 'accept') {
          const existingId = str('familyId');
          if (existingId.includes('/')) throw new Error('Невалидно семейство.');
          const familyRef = db.doc(`families/${existingId || `invite_${id}`}`);
          const family = await tx.get(familyRef);
          if (existingId && (!family.exists || (family.data()?.userId !== uid && !(data.allowedFamilyId === existingId && family.data()?.userId === data.senderId)) || family.data()?.tripId !== data.tripId)) throw new Error('Може да свържеш само свое семейство в това пътуване.');
          const name = str('familyName').trim().slice(0, 80);
          if (!existingId && !name) throw new Error('Въведи име на семейството.');
          if (!existingId) tx.set(familyRef, { tripId: data.tripId, userId: uid, name, createdAt: new Date().toISOString() });
          tx.set(db.doc(`tripMemberships/${data.tripId}_${uid}`), { tripId: data.tripId, userId: uid, familyId: familyRef.id, role: 'participant' });
        }
        tx.update(ref, { status: action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'revoked', resolvedAt: Date.now() });
        return { ok: true, tripId: data.tripId };
      });
      return res.json(result);
    }
    return res.status(400).json({ error: 'Непознато действие.' });
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Заявката не успя.' });
  }
}

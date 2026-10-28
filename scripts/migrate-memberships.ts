/** Read-only by default. Run with --apply only after export and review. */
import { adminServices } from '../src/server/firebase';
const { db } = adminServices();
async function main() {
 const apply = process.argv.includes('--apply');
 const trips = await db.collection('trips').get();
 let count = 0;
 for (const trip of trips.docs) {
  const families = await db.collection('families').where('tripId', '==', trip.id).get();
  const users = new Map<string, { role: string; familyId?: string }>();
  users.set(trip.data().ownerId, { role: 'owner' });
  for (const family of families.docs) {
   const uid = family.data().userId;
   if (typeof uid !== 'string' || !uid) throw new Error(`Invalid family ownership: ${family.id}`);
   if (uid !== trip.data().ownerId) users.set(uid, { role: 'participant', familyId: family.id });
  }
  for (const [userId, data] of users) {
   if (!userId) throw new Error(`Trip has no owner: ${trip.id}`);
   count++;
   const ref = db.doc(`tripMemberships/${trip.id}_${userId}`);
   if (apply && !(await ref.get()).exists) await ref.create({ tripId: trip.id, userId, ...data });
  }
 }
 console.log(JSON.stringify({ apply, trips: trips.size, memberships: count }));
}
main().catch(err => { console.error(err); process.exitCode = 1; });

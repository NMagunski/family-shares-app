import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../src/pages/api/community';
import { adminServices } from '../src/server/firebase';
import type { NextApiRequest, NextApiResponse } from 'next';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'demo-tripsplitly';
async function token(uid: string) {
 const { auth } = adminServices();
 await auth.createUser({uid,email:`${uid}@example.test`}).catch(() => {});
 const custom = await auth.createCustomToken(uid);
 const result = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true})});
 return (await result.json()).idToken as string;
}
async function call(token: string, body: Record<string,unknown>) {
 let code=200, data: Record<string,unknown>={};
 const res={status(n:number){code=n;return this;},json(value:Record<string,unknown>){data=value;return this;},end(){return this;}};
 await handler({method:'POST',headers:{authorization:`Bearer ${token}`},body} as NextApiRequest,res as unknown as NextApiResponse);
 return {code,data};
}
test('trusted API: usernames, invitation races, privacy and complete deletion',async () => {
 const {db}=adminServices();
 const owner=await token('host'), guest=await token('guest'), other=await token('other');
 const claims=await Promise.all([call(owner,{action:'username',username:'RaceName'}),call(guest,{action:'username',username:'racename'})]);
 assert.equal(claims.filter(r=>r.code===200).length,1);
 // Reserve distinct names for whichever user lost the race.
 await call(owner,{action:'username',username:claims[0].code===200?'racename':'host_name'});
 await call(guest,{action:'username',username:claims[1].code===200?'racename':'guest_name'});
 await call(other,{action:'username',username:'other_name'});
 await db.doc('trips/race').set({ownerId:'host',name:'Тест',currency:'EUR',archived:false});
 assert.equal((await call(guest,{action:'invite',tripId:'race',targetId:'other'})).code,400);
 assert.equal((await call(owner,{action:'invite',tripId:'race',targetId:'host'})).code,400);
 assert.equal((await call(owner,{action:'invite',tripId:'race',targetId:'guest'})).code,200);
 assert.equal((await call(owner,{action:'invite',tripId:'race',targetId:'guest'})).code,400);
 await db.doc('families/foreign').set({tripId:'another',userId:'host',name:'Чуждо'});
 assert.equal((await call(guest,{action:'accept',invitationId:'race_guest',familyId:'foreign'})).code,400);
 assert.equal((await db.doc('tripInvitations/race_guest').get()).data()?.status,'pending');
 const accepted=await Promise.all([call(guest,{action:'accept',invitationId:'race_guest',familyName:'Гости'}),call(guest,{action:'accept',invitationId:'race_guest',familyName:'Дублиране'})]);
 assert.ok(accepted.every(r=>r.code===200));
 assert.equal((await db.collection('families').where('tripId','==','race').get()).size,1);
 assert.equal((await db.doc('tripMemberships/race_guest').get()).data()?.userId,'guest');
 assert.equal((await call(owner,{action:'invite',tripId:'race',targetId:'guest'})).code,400);
 await call(owner,{action:'invite',tripId:'race',targetId:'other'});
 assert.equal((await call(guest,{action:'revoke',invitationId:'race_other'})).code,400);
 assert.equal((await call(owner,{action:'revoke',invitationId:'race_other'})).code,200);
 assert.equal((await call(other,{action:'accept',invitationId:'race_other',familyName:'Други'})).code,400);
 await call(owner,{action:'invite',tripId:'race',targetId:'other'});
 assert.equal((await call(other,{action:'decline',invitationId:'race_other'})).code,200);
 await call(owner,{action:'invite',tripId:'race',targetId:'other'});
 await db.doc('tripInvitations/race_other').update({expiresAt:0});
 assert.ok((await call(other,{action:'accept',invitationId:'race_other',familyName:'Други'})).data.error);
 assert.equal((await db.doc('tripInvitations/race_other').get()).data()?.status,'expired');
 await db.doc('personalExpenseLists/private').set({tripId:'race',ownerUserId:'guest',memberUserIds:['guest'],shareToken:'secret'});
 await db.doc('personalExpenseItems/privateitem').set({listId:'private',amount:5});
 await db.doc('lists/shared/items/item').set({text:'x'});
 await db.doc('lists/shared').set({tripId:'race'});
 assert.equal((await call(other,{action:'joinPersonal',token:'secret'})).code,400);
 await db.doc('communityLimits/host').delete();
 await db.doc('lists/standalone').set({tripId:'race'});
 await db.doc('lists/standalone/items/i').set({text:'Тест'});
 assert.equal((await call(other,{action:'deleteList',listId:'standalone'})).code,400);
 assert.equal((await call(owner,{action:'deleteList',listId:'standalone'})).code,200);
 assert.equal((await db.doc('lists/standalone/items/i').get()).exists,false);

 const input = {paidByFamilyId:'invite_race_guest',involvedFamilyIds:['invite_race_guest'],amount:1.01,currency:'EUR',type:'expense'};
 const writes = await Promise.all([call(guest,{action:'expense',tripId:'race',requestId:'same-request-123',input}),call(guest,{action:'expense',tripId:'race',requestId:'same-request-123',input})]);
 assert.ok(writes.every(r=>r.code===200));
 assert.equal((await db.collection('expenses').where('tripId','==','race').get()).size,1);
 assert.equal((await call(other,{action:'expense',tripId:'race',requestId:'outsider-123',input})).code,400);
 assert.equal((await call(guest,{action:'expense',tripId:'race',requestId:'invalid-123',input:{...input,amount:1.001}})).code,400);
 assert.equal((await call(guest,{action:'expense',tripId:'race',requestId:'currency-123',input:{...input,currency:'BGN'}})).code,400);
 assert.equal((await call(owner,{action:'deleteFamily',tripId:'race',familyId:'invite_race_guest'})).code,400);
 await db.doc('tripInvitations/race_other').update({status:'pending',expiresAt:Date.now()+100000});
 await db.doc('trips/race').update({archived:true});
 assert.ok((await call(other,{action:'accept',invitationId:'race_other',familyName:'Other'})).data.error);
 await db.doc('trips/race').update({archived:false});
 await db.doc('families/host-shared').set({tripId:'race',userId:'host',name:'Нашето семейство'});
 assert.equal((await call(owner,{action:'invite',tripId:'race',targetId:'other',familyId:'invite_race_guest'})).code,400);
 assert.equal((await call(owner,{action:'invite',tripId:'race',targetId:'other',familyId:'host-shared'})).code,200);
 assert.equal((await call(other,{action:'accept',invitationId:'race_other',familyId:'host-shared'})).code,200);
 assert.equal((await db.doc('families/host-shared').get()).data()?.userId,'host');
 assert.equal((await db.doc('tripMemberships/race_other').get()).data()?.familyId,'host-shared');

 assert.equal((await call(guest,{action:'deleteTrip',tripId:'race'})).code,400);
 assert.equal((await call(owner,{action:'deleteTrip',tripId:'race'})).code,200);
 for (const path of ['trips/race','lists/shared','lists/shared/items/item','personalExpenseLists/private','personalExpenseItems/privateitem','tripMemberships/race_guest','tripInvitations/race_guest']) assert.equal((await db.doc(path).get()).exists,false,path);
});

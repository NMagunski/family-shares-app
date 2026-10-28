import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
const projectId = 'demo-tripsplitly';
test('rules: organizer, participant, outsider and private visibility', async () => {
 const env = await initializeTestEnvironment({projectId,firestore:{rules:readFileSync('firestore.rules','utf8'),host:'127.0.0.1',port:8080}});
 try {
 await env.clearFirestore();
 await env.withSecurityRulesDisabled(async ctx => {
  const db=ctx.firestore();
  for (const [path,data] of Object.entries({
   'trips/t':{ownerId:'owner',archived:false,currency:'EUR'},
   'tripMemberships/t_member':{tripId:'t',userId:'member',role:'participant'},
   'personalExpenseLists/p':{tripId:'t',ownerUserId:'member',memberUserIds:['member'],shareToken:'secret'},
   'personalExpenseItems/i':{listId:'p',amount:1},
   'tripInvitations/i':{tripId:'t',targetId:'outside',status:'pending'}
  })) await setDoc(doc(db,path),data);
 });
 const owner=env.authenticatedContext('owner').firestore(), member=env.authenticatedContext('member').firestore(), outside=env.authenticatedContext('outside').firestore();
 await assertSucceeds(getDoc(doc(owner,'trips/t')));
 await assertSucceeds(getDocs(query(collection(owner,'trips'),where('ownerId','==','owner'))));
 await assertSucceeds(getDoc(doc(member,'trips/t')));
 await assertFails(getDoc(doc(outside,'trips/t')));
 await assertFails(updateDoc(doc(member,'trips/t'),{archived:true}));
 await assertFails(setDoc(doc(outside,'tripMemberships/t_outside'),{tripId:'t',userId:'outside'}));
 await assertFails(updateDoc(doc(outside,'tripInvitations/i'),{status:'accepted'}));
 await assertFails(setDoc(doc(member,'usernames/admin'),{uid:'member'}));
 await assertFails(setDoc(doc(member,'users/member'),{isAdmin:true}));
 await assertFails(getDoc(doc(owner,'personalExpenseLists/p')));
 await assertFails(getDoc(doc(outside,'personalExpenseItems/i')));
 await assertSucceeds(getDoc(doc(member,'personalExpenseItems/i')));
 await assertFails(getDocs(query(collection(member,'personalExpenseLists'),where('tripId','==','t'))));
 await assertSucceeds(getDocs(query(collection(member,'personalExpenseLists'),where('tripId','==','t'),where('memberUserIds','array-contains','member'))));
 await assertFails(updateDoc(doc(member,'personalExpenseLists/p'),{memberUserIds:['member','outside']}));
 assert.ok(true);
 } finally { await env.cleanup(); }
});

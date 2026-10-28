import { localRedirect } from '../src/lib/redirect';
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFamilyBalances, calculateDebts } from '../src/lib/expenses';
import { normalizeUsername } from '../src/lib/usernames';
import type { TripExpense, TripFamily } from '../src/types/trip';
const families = ['a','b','c'].map(id => ({ id, name: id, tripId: 't', userId: id })) as TripFamily[];
const expense = (patch: Partial<TripExpense> = {}): TripExpense => ({ id:'e',tripId:'t',paidByFamilyId:'a',involvedFamilyIds:['a','b','c'],amount:10,currency:'EUR',...patch });
test('cent allocation is deterministic, exact and conserved', () => {
 const b = calculateFamilyBalances(families,[expense()], 'EUR');
 assert.deepEqual(b, {a:6.66,b:-3.33,c:-3.33});
 assert.equal(Object.values(b).reduce((a,b) => a + Math.round(b * 100),0),0);
 assert.deepEqual(calculateFamilyBalances(families,[expense({ involvedFamilyIds:['c','a','b','a'] })]), b);
});
test('excluded payer receives full credit; one cent debt is retained', () => {
 assert.deepEqual(calculateFamilyBalances(families,[expense({ involvedFamilyIds:['b'],amount:.01 })]), {a:.01,b:-.01,c:0});
 assert.deepEqual(calculateDebts(families,{a:.01,b:-.01}), [{fromFamilyId:'b',toFamilyId:'a',amount:.01}]);
});
test('settlements cancel debt and foreign currency is kept out', () => {
 const b = calculateFamilyBalances(families,[expense({amount:2,involvedFamilyIds:['b']}),expense({type:'settlement',amount:2,paidByFamilyId:'b',settlementFromFamilyId:'b',settlementToFamilyId:'a'}),expense({currency:'BGN',amount:999})], 'EUR');
 assert.deepEqual(b,{a:0,b:0,c:0});
});
test('invalid values cannot poison balances and removed IDs preserve conservation', () => {
 assert.deepEqual(calculateFamilyBalances(families,[expense({amount:NaN}),expense({amount:-1})]),{a:0,b:0,c:0});
 assert.deepEqual(calculateFamilyBalances(families,[expense({paidByFamilyId:'removed',amount:1,involvedFamilyIds:['a']})]),{a:-1,b:0,c:0,removed:1});
});
test('username normalization and validation', () => {
 assert.equal(normalizeUsername(' @PeTar_1 '),'petar_1');
 for (const input of ['ab','abc/def','аbc','1abc','a'.repeat(25)]) assert.throws(() => normalizeUsername(input));
});

test('redirect remains on this origin', () => {
 assert.equal(localRedirect('/trips/abc?tab=1'),'/trips/abc?tab=1');
 for (const input of ['//evil.test', '/\\evil.test', 'https://evil.test', '/ path', undefined]) assert.equal(localRedirect(input),'/');
});

test('unavailable membership source does not discard owned or legacy trips', async () => {
 const { availableResults } = await import('../src/lib/availableResults');
 const denied = new Error('permission-denied');
 const shared = await availableResults([Promise.reject(denied), Promise.resolve(['legacy-trip'])]);
 assert.deepEqual(shared.values, ['legacy-trip']);
 assert.deepEqual(shared.errors, [denied]);
 const home = await availableResults([Promise.resolve(['owned-trip']), Promise.resolve(shared.values)]);
 assert.deepEqual(home.values, ['owned-trip', 'legacy-trip']);
 const failedShared = await availableResults([Promise.reject(denied), Promise.reject(denied)]);
 assert.equal(failedShared.errors.length, 2);
 assert.deepEqual((await availableResults([Promise.resolve(['owned-trip']), Promise.resolve(failedShared.values)])).values, ['owned-trip']);
});

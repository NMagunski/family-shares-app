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

test('invitation rollout defaults off until infrastructure is explicitly enabled', async () => {
 const { invitationsEnabled } = await import('../src/lib/features');
 assert.equal(invitationsEnabled({ production: true }), false);
 assert.equal(invitationsEnabled({ production: false }), false);
 assert.equal(invitationsEnabled({ enabled: 'false', production: false }), false);
 assert.equal(invitationsEnabled({ enabled: 'true', production: true }), true);
 assert.equal(invitationsEnabled({ emulator: 'true', production: false }), true);
 assert.equal(invitationsEnabled({ emulator: 'true', production: true }), false);
});

test('30 EUR paid entirely for another family is a purchase, then settlement zeroes balances', async () => {
 const { expenseShares, calculateFamilyShares, totalPurchaseAmount } = await import('../src/lib/expenses');
 const purchase = expense({amount:30,involvedFamilyIds:['b'],allocationMode:'single'});
 assert.deepEqual(expenseShares(['a','b','c'],purchase),{b:30});
 assert.deepEqual(calculateFamilyShares(families,[purchase],'EUR'),{a:0,b:30,c:0});
 assert.deepEqual(calculateFamilyBalances(families,[purchase],'EUR'),{a:30,b:-30,c:0});
 const settlement = expense({type:'settlement',amount:30,paidByFamilyId:'b',involvedFamilyIds:[],settlementFromFamilyId:'b',settlementToFamilyId:'a'});
 assert.deepEqual(calculateFamilyBalances(families,[purchase,settlement],'EUR'),{a:0,b:0,c:0});
 assert.deepEqual(calculateFamilyShares(families,[purchase,settlement],'EUR'),{a:0,b:30,c:0});
 assert.equal(totalPurchaseAmount([purchase,settlement],'EUR'),30);
 const { expenseHistory } = await import('../src/lib/expenseHistory');
 const names = [{id:'a',name:'Магунски'},{id:'b',name:'Атанасови'}];
 assert.equal(expenseHistory(purchase,names).label,'Само за Атанасови');
 assert.match(expenseHistory(purchase,names).sentence,/Магунски платиха 30,00.*€ за Атанасови/);
 assert.match(expenseHistory(settlement,names).label,/Пито платено/);
});

test('self-only purchases leave the payer net balance unchanged', async () => {
 const { calculateFamilyShares, totalPurchaseAmount } = await import('../src/lib/expenses');
 const purchase=expense({amount:30,involvedFamilyIds:['a'],allocationMode:'single'});
 assert.deepEqual(calculateFamilyBalances(families,[purchase],'EUR'),{a:0,b:0,c:0});
 assert.deepEqual(calculateFamilyShares(families,[purchase],'EUR'),{a:30,b:0,c:0});
 assert.equal(totalPurchaseAmount([purchase],'EUR'),30);
});

test('selected recipients exclude payer and distribute every cent consistently', async () => {
 const { expenseShares, calculateFamilyShares, totalPurchaseAmount } = await import('../src/lib/expenses');
 const purchase=expense({amount:.05,involvedFamilyIds:['c','b'],allocationMode:'selected'});
 assert.deepEqual(expenseShares(['a','b','c'],purchase),{b:.03,c:.02});
 assert.deepEqual(calculateFamilyBalances(families,[purchase],'EUR'),{a:.05,b:-.03,c:-.02});
 assert.deepEqual(calculateFamilyShares(families,[purchase,purchase],'EUR'),{a:0,b:.06,c:.04});
 assert.equal(totalPurchaseAmount([purchase,purchase,expense({amount:99,currency:'BGN'})],'EUR'),.10);
});

test('explicit empty selections are invalid; historical allocations survive editing unchanged', async () => {
 const { allocationForSave, allocationModeForExpense, validateAllocation } = await import('../src/lib/expenseAllocation');
 const all=['a','b','c'];
 for (const mode of ['selected','single'] as const) {
  assert.throws(()=>allocationForSave(mode,[],all));
  assert.throws(()=>validateAllocation({allocationMode:mode,involvedFamilyIds:[]},all));
 }
 assert.throws(()=>validateAllocation({allocationMode:'all',involvedFamilyIds:[]},all));
 assert.throws(()=>validateAllocation({involvedFamilyIds:[]},all));
 assert.throws(()=>validateAllocation({allocationMode:'single',involvedFamilyIds:['a','b']},all));
 assert.throws(()=>validateAllocation({allocationMode:'selected',involvedFamilyIds:['unknown']},all));
 assert.deepEqual(allocationForSave('all',[],all),{allocationMode:'all',involvedFamilyIds:all});
 const old=expense({involvedFamilyIds:['a','b']});
 assert.equal(allocationModeForExpense(old),'selected');
 assert.deepEqual(allocationForSave('selected',old.involvedFamilyIds,all,old,false),{involvedFamilyIds:['a','b']});
 const legacyEmpty=expense({involvedFamilyIds:[]});
 assert.deepEqual(validateAllocation({involvedFamilyIds:[]},all,legacyEmpty),{involvedFamilyIds:[]});
 assert.deepEqual(calculateFamilyBalances(families,[legacyEmpty]),{a:6.66,b:-3.33,c:-3.33});
 const snapshot=expense({allocationMode:'all',involvedFamilyIds:['a','b'],amount:30});
 assert.deepEqual(calculateFamilyBalances(families,[snapshot]),{a:15,b:-15,c:0});
 assert.deepEqual(allocationForSave('all',[],all,snapshot,false),{involvedFamilyIds:['a','b'],allocationMode:'all'});
 const single = allocationForSave('single',['b'],all,old,true);
 assert.deepEqual(validateAllocation(single,all,old),single);
 const selected = allocationForSave('selected',['b','c'],all,{...old,...single},true);
 assert.deepEqual(validateAllocation(selected,all,{...old,...single}),selected);
 assert.deepEqual(allocationForSave('all',[],all,{...old,...selected},true),{allocationMode:'all',involvedFamilyIds:all});
});

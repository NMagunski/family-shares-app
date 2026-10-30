import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import type { ExpenseInput } from '../src/lib/expensesStore';
import type { TripExpense } from '../src/types/trip';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {url:'http://localhost'});
Object.defineProperty(globalThis, 'self', {value:dom.window, configurable:true});
Object.defineProperty(globalThis, 'window', {value:dom.window, configurable:true});
Object.defineProperty(globalThis, 'document', {value:dom.window.document, configurable:true});
Object.defineProperty(globalThis, 'navigator', {value:dom.window.navigator, configurable:true});
Object.defineProperty(globalThis, 'HTMLElement', {value:dom.window.HTMLElement, configurable:true});
async function harness() {
 const library = await import('@testing-library/react/pure');
 const { default: userEvent } = await import('@testing-library/user-event');
 const { default: Form } = await import('../src/components/trips/AddExpenseForm');
 return { ...library, userEvent, Form };
}
const families=[{id:'a',name:'Магунски'},{id:'b',name:'Атанасови'},{id:'c',name:'Петрови'}];
const original: TripExpense={id:'old',tripId:'t',paidByFamilyId:'a',involvedFamilyIds:['a','b'],amount:30,currency:'EUR',comment:'Покупка'};

test('form creates a single-recipient expense with payer excluded and validates empty explicit choices', async () => {
 const { render, screen, cleanup, waitFor, userEvent, Form } = await harness();
 const user=userEvent.setup({document:dom.window.document});
 const saved: ExpenseInput[]=[];
 render(<Form families={families} tripCurrency="EUR" onAdd={async input=>{saved.push(input);}}/>);
 try {
  await user.selectOptions(screen.getByLabelText('Платено от'),'a');
  await user.type(screen.getByLabelText('Сума · € (EUR)'),'30');
  await user.click(screen.getByLabelText('За избрани семейства'));
  await user.click(screen.getByRole('button',{name:'Добави разход'}));
  assert.equal(saved.length,0);
  assert.match(screen.getByRole('status').textContent ?? '',/Избери поне едно семейство/);
  await user.click(screen.getByLabelText('За едно семейство'));
  await user.selectOptions(screen.getByLabelText('Семейство, което поема разхода'),'b');
  assert.match(screen.getByText('(платец)',{exact:false}).parentElement?.textContent ?? '',/0.00/);
  await user.click(screen.getByRole('button',{name:'Добави разход'}));
  await waitFor(()=>assert.equal(saved.length,1));
  assert.deepEqual(saved[0].involvedFamilyIds,['b']);
  assert.equal(saved[0].paidByFamilyId,'a'); assert.equal(saved[0].type,'expense'); assert.equal(saved[0].amount,30);
 } finally {cleanup();}
});

test('editing retains historical IDs until allocation is explicitly changed; all modes can be saved', async () => {
 const { render, screen, cleanup, userEvent, Form } = await harness();
 const user=userEvent.setup({document:dom.window.document});
 const saved: ExpenseInput[]=[];
 let record=original;
 for (const mode of ['unchanged','single','selected','all'] as const) {
  render(<Form families={families} tripCurrency="EUR" initialExpense={record} onAdd={async input=>{saved.push(input);}}/>);
  try {
   if (mode==='unchanged') await user.type(screen.getByLabelText('Коментар (по избор)'),' — редакция');
   if (mode==='single') {
    await user.click(screen.getByLabelText('За едно семейство'));
    await user.selectOptions(screen.getByLabelText('Семейство, което поема разхода'),'b');
   }
   if (mode==='selected') {
    await user.click(screen.getByLabelText('За избрани семейства'));
    await user.click(screen.getByLabelText('Петрови'));
   }
   if (mode==='all') await user.click(screen.getByLabelText('За всички'));
   await user.click(screen.getByRole('button',{name:'Запази промените'}));
   const input=saved.at(-1)!;
   assert.deepEqual(input.involvedFamilyIds,mode==='unchanged'?['a','b']:mode==='single'?['b']:mode==='selected'?['b','c']:['a','b','c']);
   if(mode==='unchanged') assert.equal(input.allocationMode,undefined);
   record={...record,...input};
  } finally {cleanup();}
 }
});

test('failed edits keep amount, payer and recipient for retry', async () => {
 const { render, screen, cleanup, userEvent, Form } = await harness();
 const user=userEvent.setup({document:dom.window.document});
 let attempts=0;
 render(<Form families={families} tripCurrency="EUR" initialExpense={{...original,involvedFamilyIds:['b'],allocationMode:'single'}} onAdd={async()=>{attempts++;throw new Error('Тестов отказ');}}/>);
 try {
  await user.click(screen.getByRole('button',{name:'Запази промените'}));
  assert.equal(attempts,1);
  assert.match(screen.getByRole('status').textContent ?? '',/Тестов отказ/);
  assert.equal((screen.getByLabelText('Платено от') as HTMLSelectElement).value,'a');
  assert.equal((screen.getByLabelText('Семейство, което поема разхода') as HTMLSelectElement).value,'b');
  assert.equal((screen.getByLabelText('Сума · € (EUR)') as HTMLInputElement).value,'30');
  await user.click(screen.getByRole('button',{name:'Запази промените'}));
  assert.equal(attempts,2);
 } finally {cleanup();}
});

test('history opens the complete editor and saves payer and recipient independently', async () => {
 const {render, screen, cleanup, userEvent}=await harness();
 const {default:Table}=await import('../src/components/trips/ExpensesTable');
 const user=userEvent.setup({document:dom.window.document});
 const updates: {id:string;input:ExpenseInput}[]=[];
 const fullFamilies=families.map(f=>({...f,tripId:'t',userId:'owner'}));
 render(<Table families={fullFamilies} tripCurrency="EUR" expenses={[original]} onAddExpense={async()=>{}} onDeleteExpense={()=>{}} onUpdateExpense={async(id,input)=>{updates.push({id,input});}}/>);
 try {
  await user.click(screen.getByRole('button',{name:/Покажи подробности/}));
  await user.click(screen.getByRole('button',{name:'Редактирай'}));
  const {within}=await import('@testing-library/react/pure');
  const editor=within(screen.getByRole('region',{name:'Редакция на разход'}));
  await user.click(editor.getByLabelText('За едно семейство'));
  await user.selectOptions(editor.getByLabelText('Семейство, което поема разхода'),'b');
  await user.click(editor.getByRole('button',{name:'Запази промените'}));
  assert.equal(updates[0].id,original.id);
  assert.equal(updates[0].input.paidByFamilyId,'a');
  assert.deepEqual(updates[0].input.involvedFamilyIds,['b']);
  assert.equal(updates[0].input.type,'expense');
  assert.equal(screen.queryByRole('region',{name:'Редакция на разход'}),null);
 } finally {cleanup();}
});

test('compact history hides destructive actions until expanded and keeps delete confirmation', async () => {
 const {render,screen,cleanup,userEvent}=await harness();
 const {default:Table}=await import('../src/components/trips/ExpensesTable');
 const user=userEvent.setup({document:dom.window.document});
 const data={...original,involvedFamilyIds:['b'],allocationMode:'single' as const};
 const deleted:string[]=[];
 let confirms=0;
 dom.window.confirm=()=>{confirms++;return false;};
 render(<Table families={families.map(f=>({...f,tripId:'t',userId:'owner'}))} tripCurrency="EUR" expenses={[data]} onAddExpense={async()=>{}} onUpdateExpense={async()=>{}} onDeleteExpense={id=>deleted.push(id)}/>);
 try {
  assert.equal(screen.queryByRole('button',{name:'Изтрий'}),null);
  assert.equal(screen.queryByRole('button',{name:'Редактирай'}),null);
  assert.ok(screen.getByText('Само за Атанасови'));
  assert.equal(screen.queryByText(/Магунски платиха/),null);
  await user.click(screen.getByRole('button',{name:/Покажи подробности/}));
  assert.ok(screen.getByText(/Магунски платиха/));
  await user.click(screen.getByRole('button',{name:'Изтрий'}));
  assert.equal(confirms,1);assert.deepEqual(deleted,[]);
  dom.window.confirm=()=>true;
  await user.click(screen.getByRole('button',{name:'Изтрий'}));
  assert.deepEqual(deleted,['old']);
 } finally {cleanup();}
});

test('trip banner uses the family action and renders shared debt values without calculating them', async () => {
 const {render,screen,cleanup,userEvent}=await harness();
 const {default:Header}=await import('../src/components/trips/TripHeader');
 const user=userEvent.setup({document:dom.window.document});
 let added=0,invited=0;
 const props={tripName:'Пътуване',total:'57,40 €',familiesCount:3,isOwner:true,onAddFamily:()=>{added++;},onShare:()=>{invited++;},onOpenLists:()=>{},onOpenItinerary:()=>{},onOpenSettings:()=>{}};
 const lines=Array.from({length:4},(_,i)=>({fromName:`Длъжник ${i}`,toName:'Магунски',amount:`${i+1},00 €`}));
 const result=render(<Header {...props} balanceState="debts" settlements={lines}/>);
 try {
  assert.equal(screen.queryByRole('button',{name:'Добави разход'}),null);
  await user.click(screen.getByText('Още'));
  await user.click(screen.getByRole('button',{name:'Добави семейство'}));
  assert.equal(added,1);assert.equal(invited,0);
  await user.click(screen.getByRole('button',{name:'Покани приятел'}));
  assert.equal(invited,1);
  assert.ok(screen.getByText('Длъжник 0 → Магунски'));
  assert.equal(screen.queryByText('Длъжник 3 → Магунски'),null);
  assert.equal(screen.getByRole('link',{name:'Виж всички разплащания'}).getAttribute('href'),'#trip-debts');
  for(const [state,text] of [['loading','Зареждане на разплащанията…'],['error','Разплащанията не могат да се заредят.'],['empty','Все още няма разходи'],['settled','Сметките са уредени']] as const) {
   result.rerender(<Header {...props} balanceState={state} settlements={[]}/>);
   assert.ok(screen.getByText(text));
   if(state==='loading'||state==='error') assert.equal(screen.queryByText('57,40 €'),null);
  }
  result.rerender(<Header {...props} isOwner={false} balanceState="settled"/>);
  assert.equal(screen.queryByRole('button',{name:'Добави семейство'}),null);
  assert.equal(screen.queryByRole('button',{name:'Покани приятел'}),null);
 } finally {cleanup();}
});

test('trip cards keep keyboard expansion, direct opening and owner-only management', async () => {
 const {render,screen,cleanup,userEvent}=await harness();
 const {default:Overview}=await import('../src/components/trips/TripsOverview');
 const user=userEvent.setup({document:dom.window.document});
 const trips=[{id:'owned',name:'Моето пътуване',type:'beach' as const,ownerId:'me',currency:'EUR' as const,createdAt:'2026-10-30T12:00:00Z'},{id:'shared',name:'Споделено пътуване',type:'other' as const,ownerId:'other',currency:'EUR' as const,createdAt:'2026-10-30T12:00:00Z'}];
 const calls:string[]=[];
 render(<Overview activeTrips={trips} archivedTrips={[]} userId="me" loading={false} error={null} onNewTrip={()=>calls.push('new')} onArchive={trip=>calls.push(trip.id)} onDelete={()=>calls.push('delete')}/>);
 try {
  await user.click(screen.getByRole('button',{name:'Ново пътуване'}));assert.deepEqual(calls,['new']);
  const own=screen.getByRole('button',{name:/Моето пътуване/});own.focus();await user.keyboard('{Enter}');assert.equal(own.getAttribute('aria-expanded'),'true');
  assert.equal(screen.getByRole('link',{name:'Отвори Моето пътуване'}).getAttribute('href'),'/trips/owned');
  await user.click(screen.getByRole('button',{name:'Архивирай'}));assert.equal(calls.at(-1),'owned');
  await user.click(screen.getByRole('button',{name:/Споделено пътуване/}));
  assert.equal(screen.getAllByRole('button',{name:'Изтрий'}).length,1);
  assert.equal(screen.getAllByRole('link',{name:'Отвори пътуване'}).length,2);
 } finally {cleanup();}
});

test('password visibility keeps the value, accessible label and autocomplete', async () => {
 const {render,screen,cleanup,userEvent}=await harness();
 const {default:Input}=await import('../src/components/ui/Input');
 const user=userEvent.setup({document:dom.window.document});
 render(<Input label="Парола" type="password" autoComplete="current-password" defaultValue="test-value"/>);
 try {
  const field=screen.getByLabelText('Парола') as HTMLInputElement;
  await user.click(screen.getByRole('button',{name:'Покажи паролата'}));
  assert.equal(field.type,'text');assert.equal(field.value,'test-value');assert.equal(field.autocomplete,'current-password');
  await user.click(screen.getByRole('button',{name:'Скрий паролата'}));assert.equal(field.type,'password');assert.equal(field.value,'test-value');
 } finally {cleanup();}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import type { ExpenseInput } from '../src/lib/expensesStore';
import type { TripExpense } from '../src/types/trip';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {url:'http://localhost'});
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

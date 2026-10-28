import React from 'react';
import Button from '@/components/ui/Button';
import { UserPlus, ListTodo, CalendarDays, Settings, Wallet, LayoutDashboard } from 'lucide-react';
export type TripBalanceState = 'loading' | 'error' | 'empty' | 'settled' | 'debts';
export type TicketSettlement = { fromName: string; toName: string; amount: string };
type TripHeaderProps = {
  tripName: string; total?: string; familiesCount?: number; isOwner?: boolean;
  onAddFamily: () => void; onOpenLists: () => void;
  onOpenItinerary: () => void; onShare: () => void; onOpenSettings: () => void;
  onOpenPersonalExpenses?: () => void;
  balanceState?: TripBalanceState;
  settlements?: TicketSettlement[];
};
export default function TripHeader({ tripName, total, familiesCount, isOwner = true, onAddFamily, onOpenLists, onOpenItinerary, onShare, onOpenSettings, onOpenPersonalExpenses, balanceState = 'loading', settlements = [] }: TripHeaderProps) {
  const unavailable = balanceState === 'loading' || balanceState === 'error';
  return <>
    <div className="trip-hero mb-5">
      <div className="min-w-0"><p className="text-xs tracking-widest text-[#bed9c6]">ЗАЕДНО НА ПЪТ</p>
        <h1 className="my-3 [overflow-wrap:anywhere]">{tripName}</h1>
        <p className="text-[#c3d8ca]">Планът е общ. Спомените също.<br/>А сметките? Вече са подредени.</p>
        {isOwner && <div className="flex flex-wrap gap-3 mt-6"><Button onClick={onAddFamily}><UserPlus size={18}/>Добави семейство</Button><Button variant="secondary" onClick={onShare}><UserPlus size={18}/>Покани приятел</Button></div>}
      </div>
      <div className="trip-ticket" aria-label="Сума и разплащания" aria-busy={balanceState === 'loading'}>
        <p className="ticket-muted text-xs">ОБЩО ЗА ПЪТУВАНЕТО</p>
        {unavailable ? <p className="my-3 text-sm" role="status">{balanceState === 'error' ? 'Неуспешно зареждане на сумите' : 'Зареждане на сумите…'}</p> : <strong className="ticket-total block my-3">{total}</strong>}
        <div className="ticket-balances" aria-live="polite">
          <p className="text-xs font-semibold mb-2">Кой на кого дължи</p>
          {balanceState === 'loading' ? <p className="text-sm">Зареждане на разплащанията…</p>
            : balanceState === 'error' ? <p className="text-sm">Разплащанията не могат да се заредят.</p>
            : balanceState === 'empty' ? <p className="text-sm">Все още няма разходи</p>
            : balanceState === 'settled' ? <p className="text-sm">Сметките са уредени</p>
            : <><ul className="space-y-3">{settlements.slice(0, 3).map((line, index) => <li key={index} className="ticket-settlement"><span className="text-sm" aria-label={`${line.fromName} дължат на ${line.toName}`}>{line.fromName} → {line.toName}</span><strong className="block text-lg mt-1">{line.amount}</strong></li>)}</ul>{settlements.length > 3 && <a className="ticket-link mt-3 inline-flex items-center min-h-[44px] text-sm font-semibold underline underline-offset-4" href="#trip-debts">Виж всички разплащания</a>}</>}
        </div>
        {!unavailable && <p className="ticket-muted text-xs mt-3">{familiesCount} семейства · Без погасяванията</p>}
      </div>
    </div>
    <nav className="trip-nav flex flex-wrap gap-2 border-b border-eco-border pb-4 mb-2" aria-label="Секции на пътуването">
      <span aria-current="page" className="inline-flex items-center gap-2 rounded-xl bg-eco-surface-soft px-3 py-2 text-eco-accent"><LayoutDashboard size={18} className="shrink-0"/>Преглед</span>
      <Button variant="ghost" onClick={onOpenLists}><ListTodo size={18}/>Списъци</Button>
      <Button variant="ghost" onClick={onOpenItinerary}><CalendarDays size={18}/>Програма</Button>
      {onOpenPersonalExpenses && <Button variant="ghost" onClick={onOpenPersonalExpenses}><Wallet size={18}/>Лични разходи</Button>}
      {isOwner && <Button variant="ghost" onClick={onOpenSettings}><Settings size={18}/>Настройки</Button>}
    </nav>
  </>;
}

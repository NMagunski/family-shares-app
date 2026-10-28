import React from 'react';
import Button from '@/components/ui/Button';
import { UserPlus, ListTodo, CalendarDays, Settings, Wallet, Plus, LayoutDashboard } from 'lucide-react';
type TripHeaderProps = {
  tripName: string; total?: string; familiesCount?: number; isOwner?: boolean;
  onAddExpense?: () => void; onAddFamily: () => void; onOpenLists: () => void;
  onOpenItinerary: () => void; onShare: () => void; onOpenSettings: () => void;
  onOpenPersonalExpenses?: () => void;
};
export default function TripHeader({ tripName, total, familiesCount, isOwner = true, onAddExpense, onAddFamily, onOpenLists, onOpenItinerary, onShare, onOpenSettings, onOpenPersonalExpenses }: TripHeaderProps) {
 return <>
  <div className="trip-hero mb-5">
   <div><p className="text-xs tracking-widest text-[#bed9c6]">ЗАЕДНО НА ПЪТ</p>
    <h1 className="my-3">{tripName}</h1>
    <p className="text-[#c3d8ca]">Планът е общ. Спомените също.<br/>А сметките? Вече са подредени.</p>
    <div className="flex flex-wrap gap-3 mt-6"><Button onClick={onAddExpense}><Plus size={18}/>Добави разход</Button>{isOwner && <Button variant="secondary" onClick={onShare}><UserPlus size={18}/>Покани приятел</Button>}</div>
   </div>
   {total && <div className="trip-ticket"><p className="text-xs">ОБЩО ЗА ПЪТУВАНЕТО</p><strong className="text-3xl block my-3">{total}</strong><p className="text-sm border-t border-dashed border-[#bdcbbf] pt-3">{familiesCount} семейства</p><p className="text-xs mt-1">Без погасяванията</p></div>}
  </div>
  <nav className="trip-nav flex flex-wrap gap-2 border-b border-eco-border pb-4 mb-2" aria-label="Секции на пътуването">
   <span aria-current="page" className="inline-flex items-center gap-2 rounded-xl bg-eco-surface-soft px-3 py-2 text-eco-accent"><LayoutDashboard size={18}/>Преглед</span>
   <Button variant="ghost" onClick={onOpenLists}><ListTodo size={18}/>Списъци</Button>
   <Button variant="ghost" onClick={onOpenItinerary}><CalendarDays size={18}/>Програма</Button>
   {onOpenPersonalExpenses && <Button variant="ghost" onClick={onOpenPersonalExpenses}><Wallet size={18}/>Лични разходи</Button>}
   {isOwner && <><Button variant="ghost" onClick={onAddFamily}><UserPlus size={18}/>Семейство</Button><Button variant="ghost" onClick={onOpenSettings}><Settings size={18}/>Настройки</Button></>}
  </nav>
 </>;
}

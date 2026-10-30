import React from 'react';
import type { LucideIcon } from 'lucide-react';

type SectionCardProps = {
  title: string;
  icon?: LucideIcon;
  id?: string;
  tabIndex?: number;
  children: React.ReactNode;
  action?: React.ReactNode;
};
export default function SectionCard({ title, icon: Icon, id, tabIndex, children, action }: SectionCardProps) {
  const headingId = React.useId();
  return <section id={id} tabIndex={tabIndex} aria-labelledby={headingId} className={`${id === 'trip-expenses' ? 'expenses-section ' : ''}section-card min-w-0 rounded-2xl border border-eco-border bg-eco-surface p-4 md:p-5 shadow-eco-soft`}>
    <div className="flex items-center gap-3 mb-3">
      {Icon && <span className="flex shrink-0 items-center justify-center w-9 h-9 rounded-xl bg-eco-surface-soft"><Icon aria-hidden="true" className="w-5 h-5"/></span>}
      <h2 id={headingId} className="min-w-0 text-base md:text-lg font-semibold [overflow-wrap:anywhere]">{title}</h2>
      {action && <div className="section-action">{action}</div>}
    </div>
    <div className="min-w-0 text-sm md:text-base leading-relaxed">{children}</div>
  </section>;
}

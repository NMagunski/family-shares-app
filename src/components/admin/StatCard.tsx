import React from 'react';

type StatCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
};

const StatCard: React.FC<StatCardProps> = ({ label, value, sublabel }) => {
  return (
    <div className="rounded-2xl border border-emerald-700/40 bg-slate-900/70 p-4 shadow-lg shadow-emerald-500/10">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-emerald-300">{value}</p>
      {sublabel && (
        <p className="mt-1 text-xs text-slate-400">{sublabel}</p>
      )}
    </div>
  );
};

export default StatCard;

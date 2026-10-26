import { ClipboardList, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import type { Ticket } from '@/types';

interface StatsProps {
  tickets: Ticket[];
}

export function Stats({ tickets }: StatsProps) {
  const total = tickets.length;
  const pending = tickets.filter((t) => t.status === 'pending').length;
  const inProgress = tickets.filter((t) => t.status === 'in_progress').length;
  const resolved = tickets.filter((t) => t.status === 'resolved').length;

  const cards = [
    {
      label: 'Total de chamados',
      value: total,
      icon: ClipboardList,
      classes:
        'from-primary-500 to-primary-600 ring-primary-100 dark:ring-primary-500/20',
      iconBg: 'bg-primary-600/10 text-primary-600 dark:text-primary-400',
    },
    {
      label: 'Pendentes',
      value: pending,
      icon: Clock,
      classes: 'from-amber-500 to-orange-500 ring-amber-100 dark:ring-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Em andamento',
      value: inProgress,
      icon: Loader2,
      classes: 'from-sky-500 to-cyan-500 ring-sky-100 dark:ring-sky-500/20',
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    },
    {
      label: 'Resolvidos',
      value: resolved,
      icon: CheckCircle2,
      classes: 'from-emerald-500 to-green-500 ring-emerald-100 dark:ring-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700/60`}
        >
          <div
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.classes.split(' ')[0]} ${c.classes.split(' ')[1]}`}
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {c.label}
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                {c.value}
              </p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.iconBg}`}>
              <c.icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import type { Status, Priority } from '@/types';

export const STATUS_META: Record<
  Status,
  { label: string; classes: string; dot: string }
> = {
  pending: {
    label: 'Pendente',
    classes:
      'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-500/30',
    dot: 'bg-amber-500',
  },
  in_progress: {
    label: 'Em andamento',
    classes:
      'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300 ring-1 ring-sky-200 dark:ring-sky-500/30',
    dot: 'bg-sky-500',
  },
  resolved: {
    label: 'Resolvido',
    classes:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-500/30',
    dot: 'bg-emerald-500',
  },
};

export const PRIORITY_META: Record<
  Priority,
  { label: string; classes: string; bar: string }
> = {
  low: {
    label: 'Baixa',
    classes:
      'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-600/40',
    bar: 'bg-slate-400',
  },
  medium: {
    label: 'Média',
    classes:
      'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300 ring-1 ring-orange-200 dark:ring-orange-500/30',
    bar: 'bg-orange-500',
  },
  high: {
    label: 'Alta',
    classes:
      'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-500/30',
    bar: 'bg-red-500',
  },
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `há ${d} d`;
  return formatDate(iso);
}

import { Search, Filter, X } from 'lucide-react';
import { STATUSES, PRIORITIES, CATEGORIES } from '@/types';
import { STATUS_META, PRIORITY_META } from '@/lib/format';
import type { TicketFilters } from '@/lib/tickets';

export type Filters = TicketFilters;

interface FilterBarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const selectBase =
    'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors';

  const hasActive =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== 'all';

  function clear() {
    onChange({ search: '', status: 'all', priority: 'all', category: 'all' });
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 p-3.5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700/60">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Buscar por título, descrição ou local..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <Filter className="h-4 w-4" />
          </div>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as Filters['status'] })}
            className={selectBase}
            aria-label="Filtrar por status"
          >
            <option value="all">Todos os status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
          <select
            value={filters.priority}
            onChange={(e) =>
              onChange({ ...filters, priority: e.target.value as Filters['priority'] })
            }
            className={selectBase}
            aria-label="Filtrar por prioridade"
          >
            <option value="all">Todas as prioridades</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </select>
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className={selectBase}
            aria-label="Filtrar por categoria"
          >
            <option value="all">Todas as categorias</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {hasActive && (
            <button
              onClick={clear}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
              Limpar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

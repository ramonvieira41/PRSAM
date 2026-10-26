import { ClipboardList, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAdd: () => void;
  isFiltered?: boolean;
}

export function EmptyState({ onAdd, isFiltered }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <ClipboardList className="h-7 w-7 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
        {isFiltered ? 'Nenhum chamado encontrado' : 'Nenhum chamado registrado'}
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        {isFiltered
          ? 'Tente ajustar os filtros ou a busca para encontrar o que procura.'
          : 'Comece abrindo o primeiro chamado de manutenção para sua comunidade.'}
      </p>
      {!isFiltered && (
        <button
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Abrir chamado
        </button>
      )}
    </div>
  );
}

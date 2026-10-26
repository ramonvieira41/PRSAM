import { useMemo, useState } from 'react';
import { Wrench, Plus, Sun, Moon, AlertCircle } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useTickets } from '@/hooks/useTickets';
import { ToastProvider, useToast } from '@/components/Toast';
import { Stats } from '@/components/Stats';
import { FilterBar, type Filters } from '@/components/FilterBar';
import { TicketCard } from '@/components/TicketCard';
import { TicketForm, type FormValues } from '@/components/TicketForm';
import { TicketDetail } from '@/components/TicketDetail';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EmptyState } from '@/components/EmptyState';
import type { Ticket } from '@/types';
import { filterTickets } from '@/lib/tickets';

function Dashboard() {
  const { theme, error: themeError, toggle } = useTheme();
  const { tickets, error, canModify, add, update, remove } = useTickets();
  const { notify } = useToast();

  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [viewing, setViewing] = useState<Ticket | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => filterTickets(tickets, filters), [tickets, filters]);

  function openNew() {
    if (!canModify) {
      notify(error ?? 'Não foi possível carregar os chamados.', 'error');
      return;
    }
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(t: Ticket) {
    if (!canModify) {
      notify(error ?? 'Não foi possível carregar os chamados.', 'error');
      return;
    }
    setViewing(null);
    setEditing(t);
    setFormOpen(true);
  }

  function handleSubmit(
    values: FormValues,
    historyEntry?: { action: string; details?: string }
  ) {
    if (!canModify) return;

    const saved = editing
      ? update(editing.id, values, historyEntry)
      : add(values);
    if (!saved) return;

    if (editing) {
      notify('Chamado atualizado com sucesso.');
    } else {
      notify('Chamado aberto com sucesso.');
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!canModify) return;

    if (!remove(id)) return;
    setConfirmId(null);
    setViewing(null);
    notify('Chamado excluído.', 'info');
  }

  const confirmTicket = tickets.find((t) => t.id === confirmId) ?? null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  PRSAM
                </h1>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">
                  Gestão de manutenção
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggle}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
                title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={openNew}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Abrir chamado</span>
                <span className="sm:hidden">Novo</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-6">
        {(error || themeError) && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 p-3.5">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">
              {error && <p>{error}</p>}
              {themeError && <p>{themeError}</p>}
            </div>
          </div>
        )}

        <Stats tickets={tickets} />

        <FilterBar filters={filters} onChange={setFilters} />

        {filtered.length === 0 ? (
          <EmptyState onAdd={openNew} isFiltered={
            filters.search.trim() !== '' ||
            filters.status !== 'all' ||
            filters.priority !== 'all' ||
            filters.category !== 'all'
          } />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                onView={() => setViewing(t)}
                onEdit={() => openEdit(t)}
                onDelete={() => setConfirmId(t.id)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 sm:px-6 pb-6 pt-2">
        <p className="text-center text-xs text-slate-400 dark:text-slate-600">
          PRSAM · Os dados são salvos localmente no seu navegador.
        </p>
      </footer>

      <TicketForm
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <TicketDetail
        ticket={viewing}
        onClose={() => setViewing(null)}
        onEdit={() => viewing && openEdit(viewing)}
        onDelete={() => viewing && setConfirmId(viewing.id)}
      />

      <ConfirmModal
        open={confirmId !== null}
        title="Excluir chamado?"
        message={
          confirmTicket
            ? `O chamado "${confirmTicket.title}" será removido permanentemente. Esta ação não pode ser desfeita.`
            : ''
        }
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}

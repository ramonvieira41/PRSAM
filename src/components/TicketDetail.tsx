import { useEffect } from 'react';
import {
  X,
  MapPin,
  Tag,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  History,
} from 'lucide-react';
import type { Ticket } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { formatDate } from '@/lib/format';

interface TicketDetailProps {
  ticket: Ticket | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TicketDetail({ ticket, onClose, onEdit, onDelete }: TicketDetailProps) {
  useEffect(() => {
    if (!ticket) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ticket, onClose]);

  if (!ticket) return null;

  const info = [
    { icon: MapPin, label: 'Local', value: ticket.location },
    { icon: Tag, label: 'Categoria', value: ticket.category },
    { icon: Calendar, label: 'Aberto em', value: formatDate(ticket.createdAt) },
    { icon: Clock, label: 'Atualizado em', value: formatDate(ticket.updatedAt) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative my-4 w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-800 shadow-2xl animate-scale-in">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white pr-8">
            {ticket.title}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-700 dark:hover:text-primary-400 transition-colors"
              aria-label="Editar"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
              aria-label="Excluir"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>

          {ticket.image && (
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <img src={ticket.image} alt={ticket.title} className="w-full max-h-72 object-cover" />
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5">
              Descrição
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {info.map((it) => (
              <div
                key={it.label}
                className="flex items-start gap-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3"
              >
                <it.icon className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-slate-400 dark:text-slate-500">{it.label}</dt>
                  <dd className="text-sm text-slate-700 dark:text-slate-200">{it.value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div>
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
              <History className="h-4 w-4" />
              Histórico de ocorrências
            </h3>
            {ticket.history.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Sem registros no histórico.
              </p>
            ) : (
              <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-2 space-y-3">
                {ticket.history.map((h) => (
                  <li key={h.id} className="ml-4">
                    <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-primary-500 ring-2 ring-white dark:ring-slate-800" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {h.action}
                    </p>
                    {h.details && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {h.details}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {formatDate(h.timestamp)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

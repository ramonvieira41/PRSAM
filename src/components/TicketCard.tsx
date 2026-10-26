import { MapPin, Calendar, Pencil, Trash2, ImageOff } from 'lucide-react';
import type { Ticket } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { formatRelative } from '@/lib/format';

interface TicketCardProps {
  ticket: Ticket;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export function TicketCard({ ticket, onEdit, onDelete, onView }: TicketCardProps) {
  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700/60 transition-all hover:shadow-md hover:ring-slate-300 dark:hover:ring-slate-600"
    >
      <button
        onClick={onView}
        className="block w-full text-left"
        aria-label={`Ver detalhes do chamado ${ticket.title}`}
      >
        {ticket.image ? (
          <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
            <img
              src={ticket.image}
              alt={ticket.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
            <ImageOff className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          </div>
        )}
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>

        <button
          onClick={onView}
          className="text-left text-base font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          {ticket.title}
        </button>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {ticket.description}
        </p>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{ticket.location}</span>
          <span className="mx-1">·</span>
          <span className="truncate">{ticket.category}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatRelative(ticket.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-700 dark:hover:text-primary-400 transition-colors"
              aria-label="Editar chamado"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
              aria-label="Excluir chamado"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

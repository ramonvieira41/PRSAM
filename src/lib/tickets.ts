import type { Priority, Status, Ticket } from '@/types';

export interface TicketFilters {
  search: string;
  status: Status | 'all';
  priority: Priority | 'all';
  category: string | 'all';
}

function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function filterTickets(tickets: Ticket[], filters: TicketFilters): Ticket[] {
  const query = normalizeSearch(filters.search);

  return tickets.filter((ticket) => {
    if (filters.status !== 'all' && ticket.status !== filters.status) return false;
    if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false;
    if (filters.category !== 'all' && ticket.category !== filters.category) return false;

    if (query) {
      const searchable = normalizeSearch(
        `${ticket.title} ${ticket.description} ${ticket.location}`
      );
      if (!searchable.includes(query)) return false;
    }

    return true;
  });
}

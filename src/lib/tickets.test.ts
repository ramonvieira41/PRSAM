import { describe, expect, it } from 'vitest';
import type { Ticket } from '@/types';
import { filterTickets } from '@/lib/tickets';

const tickets: Ticket[] = [
  {
    id: 'one',
    title: 'Falha elétrica',
    description: 'Luz apagada',
    category: 'Elétrica',
    location: 'Bloco A',
    priority: 'high',
    status: 'pending',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    history: [],
  },
  {
    id: 'two',
    title: 'Vazamento',
    description: 'Torneira pingando',
    category: 'Hidráulica',
    location: 'Bloco B',
    priority: 'low',
    status: 'resolved',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    history: [],
  },
];

const allFilters = {
  search: '',
  status: 'all' as const,
  priority: 'all' as const,
  category: 'all' as const,
};

describe('filterTickets', () => {
  it('matches text without case or accent differences', () => {
    expect(filterTickets(tickets, { ...allFilters, search: 'ELETRICA' })).toEqual([
      tickets[0],
    ]);
  });

  it('combines status, priority, category, and search filters', () => {
    expect(
      filterTickets(tickets, {
        search: 'torneira',
        status: 'resolved',
        priority: 'low',
        category: 'Hidráulica',
      })
    ).toEqual([tickets[1]]);
  });

  it('treats whitespace-only search as no search filter', () => {
    expect(filterTickets(tickets, { ...allFilters, search: '   ' })).toEqual(tickets);
  });
});

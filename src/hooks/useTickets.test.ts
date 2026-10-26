import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTickets } from '@/hooks/useTickets';
import type { FormValues } from '@/components/TicketForm';
import type { Ticket } from '@/types';

const values: FormValues = {
  title: 'Lâmpada queimada',
  description: 'A luz do corredor não acende.',
  category: 'Elétrica',
  location: 'Bloco A',
  priority: 'medium',
  status: 'pending',
};

const storedTicket: Ticket = {
  ...values,
  id: 'existing-ticket',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  history: [{ id: 'history-1', timestamp: '2026-01-01T00:00:00.000Z', action: 'Chamado aberto' }],
};

beforeEach(() => localStorage.clear());

describe('useTickets', () => {
  it('creates, edits with history, removes, and persists tickets', () => {
    const { result, unmount } = renderHook(() => useTickets());
    let created = false;

    act(() => {
      created = result.current.add(values);
    });
    expect(created).toBe(true);
    expect(result.current.tickets).toHaveLength(1);
    const ticketId = result.current.tickets[0].id;

    act(() => {
      result.current.update(ticketId, { ...values, title: 'Lâmpada reparada' }, {
        action: 'Chamado editado',
        details: 'título',
      });
    });
    expect(result.current.tickets[0].title).toBe('Lâmpada reparada');
    expect(result.current.tickets[0].history[0].action).toBe('Chamado editado');

    unmount();
    const reopened = renderHook(() => useTickets());
    expect(reopened.result.current.tickets[0].title).toBe('Lâmpada reparada');

    act(() => {
      reopened.result.current.remove(ticketId);
    });
    expect(reopened.result.current.tickets).toEqual([]);
    expect(JSON.parse(localStorage.getItem('prsam.tickets') ?? 'null')).toEqual([]);
    reopened.unmount();
  });

  it('does not change in-memory tickets or stored data when saving fails', () => {
    localStorage.setItem('prsam.tickets', JSON.stringify([storedTicket]));
    const { result } = renderHook(() => useTickets());
    const storedData = localStorage.getItem('prsam.tickets');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });

    let saved = true;
    act(() => {
      saved = result.current.add(values);
    });

    expect(saved).toBe(false);
    expect(result.current.tickets).toEqual([storedTicket]);
    expect(result.current.error).toMatch(/Não foi possível salvar os chamados/);
    expect(localStorage.getItem('prsam.tickets')).toBe(storedData);
  });

  it('does not allow mutations after stored data fails validation', () => {
    localStorage.setItem('prsam.tickets', '{"invalid":true}');
    const { result } = renderHook(() => useTickets());

    let saved = true;
    act(() => {
      saved = result.current.add(values);
    });

    expect(result.current.canModify).toBe(false);
    expect(saved).toBe(false);
    expect(result.current.tickets).toEqual([]);
    expect(localStorage.getItem('prsam.tickets')).toBe('{"invalid":true}');
  });
});

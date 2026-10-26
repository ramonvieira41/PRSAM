import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadTheme, loadTickets, saveTheme, saveTickets } from '@/lib/storage';
import type { Ticket } from '@/types';

const ticket: Ticket = {
  id: 'ticket-1',
  title: 'Falha elétrica',
  description: 'Luz apagada',
  category: 'Elétrica',
  location: 'Bloco A',
  priority: 'high',
  status: 'pending',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  history: [{ id: 'entry-1', timestamp: '2026-01-01T00:00:00.000Z', action: 'Chamado aberto' }],
};

beforeEach(() => localStorage.clear());

describe('ticket storage', () => {
  it('distinguishes an empty store and restores saved tickets', () => {
    expect(loadTickets()).toEqual({ ok: true, tickets: [] });
    saveTickets([ticket]);
    expect(loadTickets()).toEqual({ ok: true, tickets: [ticket] });
  });

  it('reports invalid stored data without replacing it', () => {
    const invalid = '[{"id":"broken"}]';
    localStorage.setItem('prsam.tickets', invalid);

    expect(loadTickets()).toMatchObject({ ok: false });
    expect(localStorage.getItem('prsam.tickets')).toBe(invalid);
  });

  it('reports read failures distinctly from empty storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    expect(loadTickets()).toMatchObject({ ok: false });
  });

  it('surfaces write failures', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });

    expect(() => saveTickets([ticket])).toThrow('Não foi possível salvar os chamados');
  });
});

describe('theme storage', () => {
  it('falls back to system theme and reports localStorage read failures', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });
    vi.stubGlobal('matchMedia', () => ({ matches: true }));

    expect(loadTheme()).toEqual({
      theme: 'dark',
      error: 'Não foi possível carregar a preferência de tema. O tema do sistema será usado.',
    });
  });

  it('surfaces theme write failures', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    expect(() => saveTheme('dark')).toThrow('Não foi possível salvar a preferência de tema');
  });
});

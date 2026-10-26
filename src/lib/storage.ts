import type { Ticket } from '@/types';

const TICKETS_KEY = 'prsam.tickets';
const THEME_KEY = 'prsam.theme';

export type TicketLoadResult =
  | { ok: true; tickets: Ticket[] }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isHistoryEntry(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.timestamp === 'string' &&
    typeof value.action === 'string' &&
    (value.details === undefined || typeof value.details === 'string')
  );
}

function isTicket(value: unknown): value is Ticket {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    typeof value.category === 'string' &&
    typeof value.location === 'string' &&
    (value.priority === 'low' ||
      value.priority === 'medium' ||
      value.priority === 'high') &&
    (value.status === 'pending' ||
      value.status === 'in_progress' ||
      value.status === 'resolved') &&
    (value.image === undefined || typeof value.image === 'string') &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    Array.isArray(value.history) &&
    value.history.every(isHistoryEntry)
  );
}

export function loadTickets(): TicketLoadResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(TICKETS_KEY);
  } catch {
    return {
      ok: false,
      error:
        'Não foi possível carregar os chamados do armazenamento local. ' +
        'Os dados armazenados não foram alterados.',
    };
  }

  if (raw === null) return { ok: true, tickets: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      error:
        'Os dados dos chamados estão inválidos ou corrompidos. ' +
        'Eles não foram alterados para evitar perda de informações.',
    };
  }

  if (!Array.isArray(parsed) || !parsed.every(isTicket)) {
    return {
      ok: false,
      error:
        'Os dados dos chamados estão inválidos ou corrompidos. ' +
        'Eles não foram alterados para evitar perda de informações.',
    };
  }

  return { ok: true, tickets: parsed };
}

export function saveTickets(tickets: Ticket[]): void {
  try {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  } catch {
    throw new Error(
      'Não foi possível salvar os chamados no armazenamento local. ' +
        'Verifique o espaço disponível e as permissões do navegador; ' +
        'as alterações recentes podem não estar salvas.'
    );
  }
}

export type Theme = 'light' | 'dark';

export interface ThemeLoadResult {
  theme: Theme;
  error: string | null;
}

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function loadTheme(): ThemeLoadResult {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return { theme: stored, error: null };
    return { theme: getSystemTheme(), error: null };
  } catch {
    return {
      theme: getSystemTheme(),
      error: 'Não foi possível carregar a preferência de tema. O tema do sistema será usado.',
    };
  }
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    throw new Error('Não foi possível salvar a preferência de tema neste navegador.');
  }
}

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

import { useCallback, useRef, useState } from 'react';
import type { Ticket } from '@/types';
import { loadTickets, saveTickets, uid } from '@/lib/storage';
import type { FormValues } from '@/components/TicketForm';

function makeEntry(action: string, details?: string) {
  return { id: uid(), timestamp: new Date().toISOString(), action, details };
}

export function useTickets() {
  const [initialState] = useState(() => {
    const result = loadTickets();
    return {
      tickets: result.ok ? result.tickets : [],
      canModify: result.ok,
      error: result.ok ? null : result.error,
    };
  });
  const [tickets, setTickets] = useState<Ticket[]>(initialState.tickets);
  const [error, setError] = useState<string | null>(initialState.error);
  const ticketsRef = useRef(initialState.tickets);
  const canModify = initialState.canModify;

  const commit = useCallback((update: (current: Ticket[]) => Ticket[]) => {
    if (!canModify) return false;
    const next = update(ticketsRef.current);
    try {
      saveTickets(next);
      ticketsRef.current = next;
      setTickets(next);
      setError(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.');
      return false;
    }
  }, [canModify]);

  const add = useCallback((values: FormValues) => {
    return commit((current) => {
      const now = new Date().toISOString();
      const ticket: Ticket = {
        ...values,
        id: uid(),
        createdAt: now,
        updatedAt: now,
        history: [makeEntry('Chamado aberto')],
      };
      return [ticket, ...current];
    });
  }, [commit]);

  const update = useCallback(
    (id: string, values: FormValues, historyEntry?: { action: string; details?: string }) => {
      return commit((current) =>
        current.map((t) => {
          if (t.id !== id) return t;
          const history = historyEntry
            ? [makeEntry(historyEntry.action, historyEntry.details), ...t.history]
            : t.history;
          return { ...t, ...values, updatedAt: new Date().toISOString(), history };
        })
      );
    },
    [commit]
  );

  const remove = useCallback((id: string) => {
    return commit((current) => current.filter((t) => t.id !== id));
  }, [commit]);

  return { tickets, error, canModify, add, update, remove };
}

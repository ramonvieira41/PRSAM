export type Status = 'pending' | 'in_progress' | 'resolved';
export type Priority = 'low' | 'medium' | 'high';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  details?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  priority: Priority;
  status: Status;
  image?: string;
  createdAt: string;
  updatedAt: string;
  history: HistoryEntry[];
}

export const CATEGORIES = [
  'Elétrica',
  'Hidráulica',
  'Estrutural',
  'Limpeza',
  'Segurança',
  'Equipamentos',
  'Paisagismo',
  'Outros',
] as const;

export const STATUSES: Status[] = ['pending', 'in_progress', 'resolved'];
export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

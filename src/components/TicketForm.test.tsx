import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TicketForm } from '@/components/TicketForm';

describe('TicketForm', () => {
  it('shows field errors and prevents submitting invalid values', () => {
    const onSubmit = vi.fn();
    render(<TicketForm open initial={null} onClose={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir chamado' }));

    expect(screen.getByText('Informe um título.')).toBeInTheDocument();
    expect(screen.getByText('Descreva o problema.')).toBeInTheDocument();
    expect(screen.getByText('Informe o local.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Título/)).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('trims valid values and supports keyboard submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TicketForm open initial={null} onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/Título/), '  Lâmpada queimada  ');
    await user.type(screen.getByLabelText(/Descrição/), '  A luz não acende.  ');
    const location = screen.getByLabelText(/Local/);
    await user.type(location, '  Bloco A  ');
    await user.keyboard('{Enter}');

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Lâmpada queimada',
        description: 'A luz não acende.',
        location: 'Bloco A',
      }),
      expect.objectContaining({ action: 'Chamado aberto' })
    );
  });
});

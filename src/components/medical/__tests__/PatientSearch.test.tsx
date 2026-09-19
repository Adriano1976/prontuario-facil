import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PatientSearch from '../PatientSearch';

const makePatient = (index: number) => ({
  id: `patient-${index}`,
  created_date: '2026-01-01T00:00:00.000Z',
  full_name: `Paciente ${index}`,
  cpf: `000.000.000-${String(index).padStart(2, '0')}`,
  birth_date: '1990-01-01',
  phone: `(11) 99999-${String(index).padStart(4, '0')}`,
  status: 'ativo' as const,
  lgpd_consent: true as const,
  lgpd_consent_date: '2026-01-01T00:00:00.000Z',
  lgpd_consent_ip: 'client-side',
});

const patients = [
  {
    ...makePatient(1),
    full_name: 'Ana Souza',
    cpf: '111.111.111-11',
    phone: '(11) 99999-1111',
  },
  {
    ...makePatient(2),
    full_name: 'Bruno Lima',
    cpf: '222.222.222-22',
    phone: '(11) 98888-2222',
  },
  ...Array.from({ length: 5 }, (_, index) => makePatient(index + 3)),
];

function renderSearch() {
  return render(
    <MemoryRouter>
      <PatientSearch patients={patients} />
    </MemoryRouter>,
  );
}

describe('PatientSearch', () => {
  it('does not show results before two characters are entered', async () => {
    const user = userEvent.setup();
    renderSearch();

    const input = screen.getByPlaceholderText('Buscar paciente (nome, CPF ou telefone)...');
    await user.click(input);
    await user.type(input, 'A');

    expect(screen.queryByText('Ana Souza')).not.toBeInTheDocument();
  });

  it('searches by patient name', async () => {
    const user = userEvent.setup();
    renderSearch();

    const input = screen.getByPlaceholderText('Buscar paciente (nome, CPF ou telefone)...');
    await user.type(input, 'Ana');

    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.queryByText('Bruno Lima')).not.toBeInTheDocument();
  });

  it('searches by CPF and phone', async () => {
    const user = userEvent.setup();
    renderSearch();

    const input = screen.getByPlaceholderText('Buscar paciente (nome, CPF ou telefone)...');
    await user.type(input, '222.222');
    expect(screen.getByText('Bruno Lima')).toBeInTheDocument();

    await user.click(screen.getByRole('button'));
    await user.type(input, '98888-2222');
    expect(screen.getByText('Bruno Lima')).toBeInTheDocument();
  });

  it('limits the results to five patients', async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.type(
      screen.getByPlaceholderText('Buscar paciente (nome, CPF ou telefone)...'),
      'Paciente',
    );

    expect(screen.getAllByRole('link')).toHaveLength(5);
  });
});

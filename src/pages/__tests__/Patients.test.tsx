import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Patients from '../Patients';
import type { ReactNode } from 'react';

const patients = [
  {
    id: 'patient-1',
    full_name: 'Ana Souza',
    cpf: '111.111.111-11',
    birth_date: '1990-01-01',
    phone: '(11) 99999-1111',
    email: 'ana@example.com',
    health_insurance: 'Saúde Mais',
    blood_type: 'A+',
    status: 'ativo',
    lgpd_consent: true,
    lgpd_consent_date: '2026-01-01T00:00:00.000Z',
    lgpd_consent_ip: 'client-side',
  },
  {
    id: 'patient-2',
    full_name: 'Bruno Lima',
    cpf: '222.222.222-22',
    birth_date: '1985-01-01',
    phone: '(11) 98888-2222',
    email: 'bruno@example.com',
    status: 'inativo',
    lgpd_consent: true,
    lgpd_consent_date: '2026-01-01T00:00:00.000Z',
    lgpd_consent_ip: 'client-side',
  },
];

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: patients, isLoading: false }),
}));

vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: {
      me: vi.fn().mockResolvedValue({
        id: 'demo-user-001',
        email: 'demo@medrecord.local',
      }),
    },
  },
}));

vi.mock('@/api/sessionScope', () => ({
  resolveScope: vi.fn(() => ({ kind: 'user', user_id: 'demo-user-001' })),
}));

vi.mock('@/lib/session', () => ({
  toSessionUser: vi.fn((user) => ({
    kind: 'authenticated',
    ...user,
  })),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children: ReactNode;
  }) => (
    <select
      aria-label="Filtro de status"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    >
      {children}
    </select>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
}));

function renderPatients() {
  return render(
    <MemoryRouter>
      <Patients />
    </MemoryRouter>,
  );
}

describe('Patients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the patient list contract', () => {
    renderPatients();

    expect(screen.getByRole('heading', { name: 'Pacientes' })).toBeInTheDocument();
    expect(screen.getByText('2 pacientes cadastrados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Novo Paciente/i })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Buscar por nome, CPF, telefone ou email...'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('Bruno Lima')).toBeInTheDocument();
    expect(screen.getByText('Saúde Mais')).toBeInTheDocument();
    expect(screen.getByText('A+')).toBeInTheDocument();
  });

  it('filters patients by name', async () => {
    const user = userEvent.setup();
    renderPatients();

    await user.type(
      screen.getByPlaceholderText('Buscar por nome, CPF, telefone ou email...'),
      'Ana',
    );

    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.queryByText('Bruno Lima')).not.toBeInTheDocument();
    expect(screen.getByText('1 pacientes cadastrados')).toBeInTheDocument();
  });

  it('filters patients by status', async () => {
    const user = userEvent.setup();
    renderPatients();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Filtro de status' }), 'ativo');

    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.queryByText('Bruno Lima')).not.toBeInTheDocument();
    expect(screen.getByText('1 pacientes cadastrados')).toBeInTheDocument();
  });
});

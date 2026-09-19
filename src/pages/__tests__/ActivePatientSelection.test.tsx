import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NewAppointment from '../NewAppointment';
import NewConsultation from '../NewConsultation';

const { filterOwned, filterAsAdmin, queryOptions, patients } = vi.hoisted(() => ({
  filterOwned: vi.fn().mockResolvedValue([]),
  filterAsAdmin: vi.fn().mockResolvedValue([]),
  queryOptions: [] as Array<{
    queryKey: string[];
    queryFn?: () => Promise<unknown>;
  }>,
  patients: [] as Array<Record<string, unknown>>,
}));

/** Paciente devolvido pela consulta de pacientes ativos. */
const activePatient = {
  id: 'patient-1',
  full_name: 'Ana Souza',
  cpf: '111.111.111-11',
  phone: '(11) 99999-1111',
  status: 'ativo',
  created_date: '2026-01-01T00:00:00.000Z',
};

/** Paciente inativo: a consulta da tela pede `status: 'ativo'` e não o devolve. */
const inactivePatient = {
  id: 'patient-2',
  full_name: 'Bruno Lima',
  cpf: '222.222.222-22',
  phone: '(11) 98888-2222',
  status: 'inativo',
  created_date: '2026-01-01T00:00:00.000Z',
};

vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: {
      me: vi.fn().mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
      }),
    },
    entities: {
      Patient: { filterOwned, filterAsAdmin },
      Appointment: { filterOwned, filterAsAdmin, create: vi.fn() },
      Consultation: { filterOwned, filterAsAdmin, create: vi.fn() },
      Doctor: { filter: vi.fn().mockResolvedValue([]) },
    },
    integrations: {
      Core: { SendEmail: vi.fn() },
    },
  },
}));

vi.mock('@/api/sessionScope', () => ({
  resolveScope: vi.fn(() => ({ kind: 'user', user_id: 'user-123' })),
}));

vi.mock('@/lib/session', () => ({
  toSessionUser: vi.fn((user) => ({ kind: 'authenticated', ...user })),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey: string[]; queryFn?: () => Promise<unknown> }) => {
    queryOptions.push(options);
    return {
      data: options.queryKey[0] === 'patients' ? patients : [],
      isLoading: false,
    };
  },
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

function renderConsultation() {
  return render(
    <MemoryRouter>
      <NewConsultation />
    </MemoryRouter>,
  );
}

describe('active patient selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryOptions.length = 0;
    patients.length = 0;
    window.history.replaceState({}, '', '/');
  });

  it('loads only active patients for a new appointment', async () => {
    render(
      <MemoryRouter>
        <NewAppointment />
      </MemoryRouter>,
    );

    const patientsQuery = queryOptions.find((query) => query.queryKey[0] === 'patients');
    expect(patientsQuery?.queryFn).toBeDefined();

    await patientsQuery?.queryFn?.();

    expect(filterOwned).toHaveBeenCalledWith(
      { kind: 'user', user_id: 'user-123' },
      { status: 'ativo' },
    );
  });

  it('loads only active patients for a new consultation', async () => {
    renderConsultation();

    const patientsQuery = queryOptions.find((query) => query.queryKey[0] === 'patients');
    expect(patientsQuery?.queryFn).toBeDefined();

    await patientsQuery?.queryFn?.();

    expect(filterOwned).toHaveBeenCalledWith(
      { kind: 'user', user_id: 'user-123' },
      { status: 'ativo' },
      '-full_name',
    );
  });

  it('offers the active patient and selects it into the form', async () => {
    const user = userEvent.setup();
    patients.push(activePatient);

    renderConsultation();

    await user.type(screen.getByPlaceholderText('Buscar paciente por nome ou CPF...'), 'Ana');

    const option = screen.getByRole('button', { name: /Ana Souza/ });
    await user.click(option);

    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trocar' })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Buscar paciente por nome ou CPF...')).not.toBeInTheDocument();
  });

  it('never offers an inactive patient: the query asks for ativo and the screen has no other source', async () => {
    const user = userEvent.setup();
    patients.push(activePatient);

    renderConsultation();

    const patientsQuery = queryOptions.find((query) => query.queryKey[0] === 'patients');
    await patientsQuery?.queryFn?.();
    expect(filterOwned).toHaveBeenCalledWith(
      { kind: 'user', user_id: 'user-123' },
      { status: 'ativo' },
      '-full_name',
    );

    const search = screen.getByPlaceholderText('Buscar paciente por nome ou CPF...');

    // Busca pelo nome e pelo CPF do paciente inativo: nada aparece, porque a
    // tela não guarda lista própria — só o que a consulta de ativos devolveu.
    await user.type(search, 'Bruno Lima');
    expect(screen.queryByText(inactivePatient.full_name)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Bruno Lima/ })).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, inactivePatient.cpf);
    expect(screen.queryByRole('button', { name: /Bruno Lima/ })).not.toBeInTheDocument();
    expect(screen.queryByText(inactivePatient.cpf)).not.toBeInTheDocument();

    // Controle positivo: o mesmo campo encontra o paciente que a consulta devolveu.
    await user.clear(search);
    await user.type(search, 'Ana');
    expect(screen.getByRole('button', { name: /Ana Souza/ })).toBeInTheDocument();
  });
});

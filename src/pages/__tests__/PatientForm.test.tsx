import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientForm from '../PatientForm';

const { createPatient, mutate, navigate, toast } = vi.hoisted(() => ({
  createPatient: vi.fn(),
  mutate: vi.fn(),
  navigate: vi.fn(),
  toast: vi.fn(),
}));

vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: {
      me: vi.fn().mockResolvedValue({
        id: 'demo-user-001',
        email: 'demo@medrecord.local',
      }),
    },
    entities: {
      Patient: {
        create: createPatient,
        filterOwned: vi.fn(),
        filterAsAdmin: vi.fn(),
      },
    },
    integrations: {
      Core: {
        UploadFile: vi.fn(),
      },
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

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined, isLoading: false }),
  useMutation: () => ({ mutate, isPending: false }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock('@/components/medical/AccessLogger', () => ({
  ACCESS_ACTIONS: {
    CREATE_PATIENT: 'create_patient',
    EDIT_PATIENT: 'edit_patient',
  },
  logAccess: vi.fn(),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast }),
}));

vi.mock('@/components/medical/LGPDConsent', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div role="dialog">Termo de Consentimento LGPD</div> : null,
}));

describe('PatientForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/PatientForm');
  });

  it('blocks saving a new patient and opens the LGPD term without consent', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PatientForm />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText('Nome completo do paciente'), 'Carla Mendes');
    await user.type(screen.getByPlaceholderText('000.000.000-00'), '12345678900');
    const birthDate = document.querySelector('input[type="date"]');
    expect(birthDate).not.toBeNull();
    await user.type(birthDate as HTMLInputElement, '1990-05-10');
    await user.type(
      screen.getAllByPlaceholderText('(00) 00000-0000')[0],
      '11999998888',
    );
    await user.click(screen.getByRole('button', { name: /Salvar Paciente/i }));

    expect(mutate).not.toHaveBeenCalled();
    expect(createPatient).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toHaveTextContent('Termo de Consentimento LGPD');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientForm from '../PatientForm';
import type { ReactNode } from 'react';

const { createPatient, updatePatient, mutate, navigate, toast, uploadFile } = vi.hoisted(() => ({
  createPatient: vi.fn(),
  updatePatient: vi.fn(),
  mutate: vi.fn(),
  navigate: vi.fn(),
  toast: vi.fn(),
  uploadFile: vi.fn(),
}));

const existingPatient = {
  id: 'patient-1',
  full_name: 'Carla Mendes',
  cpf: '123.456.789-00',
  birth_date: '1990-05-10',
  phone: '(11) 99999-8888',
  email: 'carla@example.com',
  gender: '',
  address: '',
  emergency_contact: '',
  emergency_phone: '',
  health_insurance: '',
  insurance_number: '',
  blood_type: 'desconhecido',
  allergies: '',
  chronic_conditions: '',
  medications_in_use: '',
  notes: '',
  photo_url: '',
  status: 'ativo',
  lgpd_consent: true,
  lgpd_consent_date: '2026-01-01T00:00:00.000Z',
  lgpd_consent_ip: 'client-side',
};
const existingPatientData = [existingPatient];

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
        update: updatePatient,
        filterOwned: vi.fn(),
        filterAsAdmin: vi.fn(),
      },
    },
    integrations: {
      Core: {
        UploadFile: uploadFile,
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
  useQuery: (options: { queryKey: string[] }) => ({
    data:
      options.queryKey[0] === 'patient' && options.queryKey[1] === 'patient-1'
        ? existingPatientData
        : undefined,
    isLoading: false,
  }),
  useMutation: (options: {
    mutationFn: (data: unknown) => Promise<void>;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  }) => ({
    mutate: (data: unknown) => {
      mutate(data);
      // O caminho de falha é tão contrato quanto o de sucesso: a dupla
      // resolve/recusa reproduz o que o gancho real entrega ao formulário.
      void options.mutationFn(data).then(
        () => options.onSuccess?.(),
        (error: unknown) => options.onError?.(error),
      );
    },
    isPending: false,
  }),
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

/**
 * Dublê do módulo de seleção, no mesmo padrão já usado em `Patients.test.tsx`.
 *
 * Motivo: o seletor real renderiza as opções num portal e exige eventos de ponteiro
 * que o DOM simulado não reproduz — abrir o seletor real neste arquivo levava o
 * `userEvent` a estourar o tempo limite. Com o dublê, as opções existem no documento
 * e a verificação do conjunto fechado de tipo sanguíneo (BR-P02) passa a medir o que
 * o formulário decide: exatamente quais valores ele oferece.
 */
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
      aria-label="Seletor"
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

vi.mock('@/components/medical/LGPDConsent', () => ({
  default: ({
    open,
    onAccept,
  }: {
    open: boolean;
    onAccept: () => void;
  }) =>
    open ? (
      <div role="dialog">
        <span>Termo de Consentimento LGPD</span>
        <input type="checkbox" aria-label="Aceite LGPD" />
        <button type="button" onClick={onAccept}>
          Aceitar e Continuar
        </button>
      </div>
    ) : null,
}));

type User = ReturnType<typeof userEvent.setup>;

function renderForm() {
  return render(
    <MemoryRouter>
      <PatientForm />
    </MemoryRouter>,
  );
}

/** Preenche os quatro campos obrigatórios do cadastro. */
async function fillRequiredFields(user: User) {
  await user.type(screen.getByPlaceholderText('Nome completo do paciente'), 'Carla Mendes');
  await user.type(screen.getByPlaceholderText('000.000.000-00'), '12345678900');
  const birthDate = document.querySelector('input[type="date"]');
  expect(birthDate).not.toBeNull();
  await user.type(birthDate as HTMLInputElement, '1990-05-10');
  await user.type(screen.getAllByPlaceholderText('(00) 00000-0000')[0], '11999998888');
}

/** Preenche os obrigatórios e aceita o termo de consentimento. */
async function fillAndAcceptConsent(user: User) {
  await fillRequiredFields(user);
  await user.click(screen.getByRole('button', { name: 'Ver Termo' }));
  await user.click(screen.getByRole('checkbox', { name: 'Aceite LGPD' }));
  await user.click(screen.getByRole('button', { name: 'Aceitar e Continuar' }));
}

function photoInput() {
  return document.getElementById('photo-input') as HTMLInputElement;
}

function selectablePhoto() {
  return new File(['conteudo-da-foto'], 'carla.png', { type: 'image/png' });
}

describe('PatientForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // `clearAllMocks` não devolve a implementação ao estado inicial; os três
    // dublês abaixo são rearmados para que nenhum teste herde o desfecho
    // (resolvido ou recusado) do teste anterior.
    createPatient.mockReset();
    updatePatient.mockReset();
    uploadFile.mockReset();
    window.history.replaceState({}, '', '/PatientForm');
  });

  it('blocks saving a new patient and opens the LGPD term without consent', async () => {
    const user = userEvent.setup();

    renderForm();
    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Salvar Paciente/i }));

    expect(mutate).not.toHaveBeenCalled();
    expect(createPatient).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toHaveTextContent('Termo de Consentimento LGPD');
  });

  it('persists consent metadata when the LGPD term is accepted', async () => {
    const user = userEvent.setup();
    createPatient.mockResolvedValue({
      id: 'patient-3',
    });

    renderForm();
    await fillAndAcceptConsent(user);
    await user.click(screen.getByRole('button', { name: /Salvar Paciente/i }));

    await vi.waitFor(() => expect(createPatient).toHaveBeenCalledOnce());
    const payload = createPatient.mock.calls[0][0];
    expect(payload).toMatchObject({
      full_name: 'Carla Mendes',
      cpf: '123.456.789-00',
      phone: '(11) 99999-8888',
      lgpd_consent: true,
      lgpd_consent_ip: 'client-side',
    });
    expect(payload.lgpd_consent_date).toEqual(expect.any(String));
  });

  it('updates an existing patient without asking for new LGPD consent', async () => {
    const user = userEvent.setup();
    updatePatient.mockResolvedValue({
      id: 'patient-1',
    });
    window.history.replaceState({}, '', '/PatientForm?id=patient-1');

    renderForm();

    const nameInput = await screen.findByPlaceholderText('Nome completo do paciente');
    await user.clear(nameInput);
    await user.type(nameInput, 'Carla Mendes Atualizada');
    expect(screen.queryByRole('button', { name: 'Ver Termo' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Salvar Paciente/i }));

    await vi.waitFor(() => expect(updatePatient).toHaveBeenCalledOnce());
    expect(updatePatient).toHaveBeenCalledWith(
      'patient-1',
      expect.objectContaining({
        full_name: 'Carla Mendes Atualizada',
        lgpd_consent: true,
        lgpd_consent_date: '2026-01-01T00:00:00.000Z',
        lgpd_consent_ip: 'client-side',
      }),
    );
    expect(createPatient).not.toHaveBeenCalled();
  });

  it('keeps the new-patient form filled and warns when the creation fails', async () => {
    const user = userEvent.setup();
    createPatient.mockRejectedValue(new Error('Servidor indisponível'));

    renderForm();
    await fillAndAcceptConsent(user);
    await user.click(screen.getByRole('button', { name: /Salvar Paciente/i }));

    await vi.waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Não foi possível salvar o paciente',
        description: 'Servidor indisponível',
      }),
    );
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Novo Paciente' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome completo do paciente')).toHaveValue('Carla Mendes');
  });

  it('keeps the edit form filled and warns when the update fails', async () => {
    const user = userEvent.setup();
    updatePatient.mockRejectedValue(new Error('Falha ao gravar a alteração'));
    window.history.replaceState({}, '', '/PatientForm?id=patient-1');

    renderForm();

    const nameInput = await screen.findByPlaceholderText('Nome completo do paciente');
    await user.clear(nameInput);
    await user.type(nameInput, 'Carla Mendes Atualizada');
    await user.click(screen.getByRole('button', { name: /Salvar Paciente/i }));

    await vi.waitFor(() => expect(updatePatient).toHaveBeenCalledOnce());
    await vi.waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Não foi possível salvar o paciente',
        description: 'Falha ao gravar a alteração',
      }),
    );
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Editar Paciente' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome completo do paciente')).toHaveValue(
      'Carla Mendes Atualizada',
    );
  });

  it('falls back to the connection hint when the failure carries no message', async () => {
    const user = userEvent.setup();
    createPatient.mockRejectedValue({ status: 500 });

    renderForm();
    await fillAndAcceptConsent(user);
    await user.click(screen.getByRole('button', { name: /Salvar Paciente/i }));

    await vi.waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Não foi possível salvar o paciente',
        description: 'Verifique a conexão com o servidor e tente novamente.',
      }),
    );
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Novo Paciente' })).toBeInTheDocument();
  });

  it('previews the selected photo, uploads it, and saves the returned URL', async () => {
    const user = userEvent.setup();
    createPatient.mockResolvedValue({ id: 'patient-9' });
    uploadFile.mockResolvedValue({ file_url: 'https://cdn.example/carla.png' });

    renderForm();
    await user.upload(photoInput(), selectablePhoto());

    expect(await screen.findByAltText('Foto')).toBeInTheDocument();

    await fillAndAcceptConsent(user);
    await user.click(screen.getByRole('button', { name: /Salvar Paciente/i }));

    await vi.waitFor(() => expect(uploadFile).toHaveBeenCalledOnce());
    expect(uploadFile.mock.calls[0][0].file).toBeInstanceOf(File);

    await vi.waitFor(() => expect(createPatient).toHaveBeenCalledOnce());
    expect(createPatient.mock.calls[0][0]).toMatchObject({
      photo_url: 'https://cdn.example/carla.png',
    });
  });

  it('warns and saves nothing when the photo upload fails', async () => {
    const user = userEvent.setup();
    uploadFile.mockRejectedValue(new Error('Falha no envio da imagem'));

    renderForm();
    await user.upload(photoInput(), selectablePhoto());
    await fillAndAcceptConsent(user);
    await user.click(screen.getByRole('button', { name: /Salvar Paciente/i }));

    await vi.waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Não foi possível salvar o paciente',
        description: 'Falha no envio da imagem',
      }),
    );
    expect(createPatient).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Novo Paciente' })).toBeInTheDocument();
  });

  it('offers exactly the permitted blood types and nothing else (BR-P02)', () => {
    renderForm();

    // O campo nasce com `desconhecido`, que é o que o distingue do seletor de gênero.
    const tipoSanguineo = screen
      .getAllByRole('combobox')
      .find((element) => (element as HTMLSelectElement).value === 'desconhecido');
    expect(tipoSanguineo).toBeDefined();

    const oferecidos = Array.from((tipoSanguineo as HTMLSelectElement).options).map(
      (option) => option.value,
    );
    expect(oferecidos).toEqual([
      'A+',
      'A-',
      'B+',
      'B-',
      'AB+',
      'AB-',
      'O+',
      'O-',
      'desconhecido',
    ]);
  });
});

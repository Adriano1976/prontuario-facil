import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetail from '../PatientDetail';

const { deletePatient, logAccess, patientFilterOwned, rows } = vi.hoisted(() => ({
  deletePatient: vi.fn(),
  logAccess: vi.fn(),
  patientFilterOwned: vi.fn(),
  rows: {} as Record<string, unknown[]>,
}));

const patient = {
  id: 'patient-1',
  full_name: 'Carla Mendes',
  cpf: '123.456.789-00',
  birth_date: '1990-05-10',
  phone: '(11) 99999-8888',
  email: 'carla@example.com',
  health_insurance: 'Saúde Mais',
  insurance_number: '12345',
  blood_type: 'A+',
  allergies: 'Penicilina',
  chronic_conditions: 'Asma',
  medications_in_use: 'Budesonida',
  status: 'ativo',
  lgpd_consent: true,
  lgpd_consent_date: '2026-01-01T00:00:00.000Z',
  lgpd_consent_ip: 'client-side',
};

const consultation = {
  id: 'consultation-1',
  patient_id: 'patient-1',
  created_date: '2026-01-10T10:00:00.000Z',
  date: '2026-01-10T10:00:00.000Z',
  status: 'concluida',
  chief_complaint: 'Dor de cabeça',
};
const prescription = {
  id: 'prescription-1',
  patient_id: 'patient-1',
  created_date: '2026-01-12T00:00:00.000Z',
  type: 'receita_simples',
};
const exam = {
  id: 'exam-1',
  patient_id: 'patient-1',
  created_date: '2026-01-11T00:00:00.000Z',
  date: '2026-01-11T00:00:00.000Z',
  name: 'Hemograma',
};
const appointment = {
  id: 'appointment-1',
  patient_id: 'patient-1',
  created_date: '2026-01-13T09:00:00.000Z',
  date: '2026-01-13T09:00:00.000Z',
  status: 'confirmado',
};

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
        filterOwned: patientFilterOwned,
        filterAsAdmin: vi.fn(),
        delete: deletePatient,
      },
      Consultation: { create: vi.fn() },
      Prescription: { create: vi.fn() },
      Exam: { create: vi.fn() },
      Appointment: { create: vi.fn() },
    },
  },
}));

vi.mock('@/api/sessionScope', () => ({
  asUserScope: vi.fn(() => ({ kind: 'user', user_id: 'demo-user-001' })),
  resolveScope: vi.fn(() => ({ kind: 'user', user_id: 'demo-user-001' })),
}));

vi.mock('@/lib/session', () => ({
  toSessionUser: vi.fn((user) => ({
    kind: 'authenticated',
    ...user,
  })),
}));

vi.mock('@/components/medical/AccessLogger', () => ({
  ACCESS_ACTIONS: {
    VIEW_PATIENT: 'view_patient',
    DELETE_RECORD: 'delete_record',
  },
  logAccess,
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey: string[] }) => ({
    data: rows[options.queryKey[0]],
    isLoading: false,
  }),
  useMutation: (options: {
    mutationFn: () => Promise<unknown>;
    onSuccess?: () => void;
  }) => ({
    mutate: () => {
      void options.mutationFn().then(() => options.onSuccess?.());
    },
    isPending: false,
  }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

/**
 * Dublê da linha do tempo que marca no DOM exatamente as coleções que a página
 * entregou. É esse repasse que `PatientDetail` decide em cada aba; o desenho de
 * cada tipo de evento é provado em
 * `src/components/medical/__tests__/ConsultationTimeline.test.tsx`.
 */
vi.mock('@/components/medical/ConsultationTimeline', () => ({
  default: ({
    consultations = [],
    prescriptions = [],
    exams = [],
    appointments = [],
  }: {
    consultations?: Array<{ id: string }>;
    prescriptions?: Array<{ id: string }>;
    exams?: Array<{ id: string }>;
    appointments?: Array<{ id: string }>;
  }) => (
    <div>
      {consultations.map((item) => (
        <p key={`consulta-${item.id}`}>evento-consulta:{item.id}</p>
      ))}
      {prescriptions.map((item) => (
        <p key={`documento-${item.id}`}>evento-documento:{item.id}</p>
      ))}
      {exams.map((item) => (
        <p key={`exame-${item.id}`}>evento-exame:{item.id}</p>
      ))}
      {appointments.map((item) => (
        <p key={`agendamento-${item.id}`}>evento-agendamento:{item.id}</p>
      ))}
    </div>
  ),
}));

vi.mock('@/components/medical/ExamUploader', () => ({
  default: () => null,
}));

vi.mock('@/components/medical/PrescriptionEditor', () => ({
  default: () => null,
}));

type User = ReturnType<typeof userEvent.setup>;

function renderDetail() {
  return render(
    <MemoryRouter>
      <PatientDetail />
    </MemoryRouter>,
  );
}

/** Abre o diálogo de exclusão pelo botão de lixeira do cabeçalho. */
async function openDeleteDialog(user: User) {
  const deleteButton = Array.from(document.querySelectorAll('button')).find((button) =>
    button.className.includes('text-rose-600'),
  );
  expect(deleteButton).toBeDefined();
  await user.click(deleteButton as HTMLButtonElement);
}

describe('PatientDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of Object.keys(rows)) {
      delete rows[key];
    }
    window.history.replaceState({}, '', '/PatientDetail?id=patient-1');
    rows.patient = [patient];
    patientFilterOwned.mockResolvedValue([patient]);
    deletePatient.mockResolvedValue({ success: true });
  });

  it('renders patient details, clinical alerts, and audit logging', async () => {
    renderDetail();

    expect(await screen.findByRole('heading', { name: 'Carla Mendes' })).toBeInTheDocument();
    expect(screen.getByText('Penicilina')).toBeInTheDocument();
    expect(screen.getByText('Alergias')).toBeInTheDocument();
    expect(screen.getByText('Asma')).toBeInTheDocument();
    expect(screen.getByText('Budesonida')).toBeInTheDocument();
    expect(screen.getByText('Saúde Mais')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Editar/i })).toHaveAttribute(
      'href',
      '/PatientForm?id=patient-1',
    );

    await vi.waitFor(() =>
      expect(logAccess).toHaveBeenCalledWith(
        'view_patient',
        'Patient',
        'patient-1',
        'Carla Mendes',
      ),
    );
  });

  it('shows the not-found state, without auditing, when the query returns no patient', async () => {
    rows.patient = [];

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: 'Paciente não encontrado' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para lista' })).toHaveAttribute(
      'href',
      '/Patients',
    );
    expect(screen.queryByText('Informações do Paciente')).not.toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(logAccess).not.toHaveBeenCalled();
  });

  it('deletes the patient only after confirmation and audits the deletion', async () => {
    const user = userEvent.setup();

    renderDetail();
    await screen.findByRole('heading', { name: 'Carla Mendes' });

    await openDeleteDialog(user);

    expect(screen.getByRole('alertdialog')).toHaveTextContent('Excluir paciente?');
    expect(deletePatient).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    // O escopo vem primeiro: excluir endereçando um identificador o exige (BR-MIGRAR-034).
    await vi.waitFor(() =>
      expect(deletePatient).toHaveBeenCalledWith(
        { kind: 'user', user_id: 'demo-user-001' },
        'patient-1',
      ),
    );
    expect(logAccess).toHaveBeenCalledWith(
      'delete_record',
      'Patient',
      'patient-1',
      'Carla Mendes',
    );
  });

  it('closes the dialog, keeps the patient, and never deletes when the user cancels', async () => {
    const user = userEvent.setup();

    renderDetail();
    await screen.findByRole('heading', { name: 'Carla Mendes' });

    await openDeleteDialog(user);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    await vi.waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(deletePatient).not.toHaveBeenCalled();
    expect(logAccess).not.toHaveBeenCalledWith(
      'delete_record',
      'Patient',
      'patient-1',
      'Carla Mendes',
    );
    expect(screen.getByRole('heading', { name: 'Carla Mendes' })).toBeInTheDocument();
  });

  it('counts the events and shows only the selected type in each history tab', async () => {
    const user = userEvent.setup();
    rows.consultations = [consultation];
    rows.prescriptions = [prescription];
    rows.exams = [exam];
    rows.appointments = [appointment];

    renderDetail();
    await screen.findByRole('heading', { name: 'Carla Mendes' });

    expect(screen.getByRole('tab', { name: 'Agendamentos (1)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Consultas (1)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Documentos (1)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Exames (1)' })).toBeInTheDocument();

    // Aba padrão: os quatro tipos convivem.
    expect(screen.getByText('evento-consulta:consultation-1')).toBeInTheDocument();
    expect(screen.getByText('evento-documento:prescription-1')).toBeInTheDocument();
    expect(screen.getByText('evento-exame:exam-1')).toBeInTheDocument();
    expect(screen.getByText('evento-agendamento:appointment-1')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Agendamentos (1)' }));
    expect(screen.getByText('evento-agendamento:appointment-1')).toBeInTheDocument();
    expect(screen.queryByText('evento-consulta:consultation-1')).not.toBeInTheDocument();
    expect(screen.queryByText('evento-documento:prescription-1')).not.toBeInTheDocument();
    expect(screen.queryByText('evento-exame:exam-1')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Consultas (1)' }));
    expect(screen.getByText('evento-consulta:consultation-1')).toBeInTheDocument();
    expect(screen.queryByText('evento-agendamento:appointment-1')).not.toBeInTheDocument();
    expect(screen.queryByText('evento-documento:prescription-1')).not.toBeInTheDocument();
    expect(screen.queryByText('evento-exame:exam-1')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Documentos (1)' }));
    expect(screen.getByText('evento-documento:prescription-1')).toBeInTheDocument();
    expect(screen.queryByText('evento-consulta:consultation-1')).not.toBeInTheDocument();
    expect(screen.queryByText('evento-agendamento:appointment-1')).not.toBeInTheDocument();
    expect(screen.queryByText('evento-exame:exam-1')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Exames (1)' }));
    expect(screen.getByText('evento-exame:exam-1')).toBeInTheDocument();
    expect(screen.queryByText('evento-consulta:consultation-1')).not.toBeInTheDocument();
    expect(screen.queryByText('evento-documento:prescription-1')).not.toBeInTheDocument();
    expect(screen.queryByText('evento-agendamento:appointment-1')).not.toBeInTheDocument();
  });
});

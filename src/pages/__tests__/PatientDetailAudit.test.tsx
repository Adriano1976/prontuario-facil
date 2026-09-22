import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetail from '../PatientDetail';
import { EMAIL_DA_SESSAO } from '@/test/auditFixtures';
import type { AccessLog } from '@/types';

/**
 * Prova de TELA da **auditoria** da visualização de paciente, em `PatientDetail`.
 *
 * O QUE SE MEDE AQUI: `RF-04` — abrir o detalhe grava `view_patient` com a entidade, o
 * identificador e o nome do paciente — e `RF-20` — a mesma visualização grava **de novo**
 * quando o objeto do paciente muda de identidade.
 *
 * ⚠️ POR QUE ESTE ARQUIVO EXISTE, EM VEZ DE UM BLOCO NO `PatientDetail.test.tsx`.
 * O arquivo vizinho **dubla o módulo `AccessLogger`** (`logAccess` é uma espiã), e com isso
 * prova a **chamada**, não o transporte. A decisão D-02 do roadmap exige medir no
 * transporte, e isso é incompatível com aquele arranjo: o dublê de módulo vale para o
 * arquivo inteiro. Separar é o único caminho honesto — e o desvio está registrado no
 * `progress.jsonl` e no `legacy-impact.md`.
 *
 * ⚠️ O MÓDULO NÃO É DUBLADO AQUI (decisão D-02). `AccessLogger` corre de verdade e o que se
 * substitui é `base44.entities.AccessLog`.
 */

const { criarRegistro, linhas } = vi.hoisted(() => ({
  criarRegistro: vi.fn(),
  linhas: {} as Record<string, unknown[]>,
}));

/** Mesmos dados e mesmos dublês de tela do arquivo vizinho, com o transporte no lugar. */
const paciente = {
  id: 'patient-1',
  created_date: '2026-01-01T00:00:00.000Z',
  full_name: 'Carla Mendes',
  cpf: '123.456.789-00',
  birth_date: '1990-05-10',
  phone: '(11) 99999-8888',
  email: 'carla@example.com',
  status: 'ativo',
  lgpd_consent: true,
  lgpd_consent_date: '2026-01-01T00:00:00.000Z',
  lgpd_consent_ip: 'client-side',
};

vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: {
      me: vi.fn().mockResolvedValue({
        id: 'demo-user-001',
        // Literal, e não a constante importada: as fábricas de `vi.mock` são içadas acima
        // dos imports, e referenciar um valor importado aqui falha na inicialização.
        email: 'demo@medrecord.local',
      }),
    },
    entities: {
      Patient: { filterOwned: vi.fn(), filterAsAdmin: vi.fn(), delete: vi.fn() },
      Consultation: { create: vi.fn() },
      Prescription: { create: vi.fn() },
      Exam: { create: vi.fn() },
      Appointment: { create: vi.fn() },
      // O TRANSPORTE da auditoria é o que se substitui — nunca o módulo `AccessLogger`.
      AccessLog: { asUser: () => ({ create: criarRegistro }) },
    },
  },
}));

vi.mock('@/api/sessionScope', () => ({
  asUserScope: vi.fn(() => ({ kind: 'user', user_id: 'demo-user-001' })),
  resolveScope: vi.fn(() => ({ kind: 'user', user_id: 'demo-user-001' })),
}));

vi.mock('@/lib/session', () => ({
  toSessionUser: vi.fn((usuario) => ({ kind: 'authenticated', ...usuario })),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (opcoes: { queryKey: string[] }) => ({
    data: linhas[opcoes.queryKey[0]],
    isLoading: false,
  }),
  useMutation: (opcoes: { mutationFn: () => Promise<unknown>; onSuccess?: () => void }) => ({
    mutate: () => {
      void opcoes.mutationFn().then(() => opcoes.onSuccess?.());
    },
    isPending: false,
  }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

/** Os componentes pesados da tela não participam da promessa medida. */
vi.mock('@/components/medical/ConsultationTimeline', () => ({ default: () => null }));
vi.mock('@/components/medical/ExamUploader', () => ({ default: () => null }));
vi.mock('@/components/medical/PrescriptionEditor', () => ({ default: () => null }));

function renderizarDetalhe() {
  return render(
    <MemoryRouter>
      <PatientDetail />
    </MemoryRouter>,
  );
}

/** As ações gravadas, na ordem em que o transporte as recebeu. */
function acoesGravadas(): string[] {
  return criarRegistro.mock.calls.map(
    (chamada) => (chamada[0] as { action: string }).action,
  );
}

describe('PatientDetail — a visualização é auditada no transporte', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const chave of Object.keys(linhas)) delete linhas[chave];
    window.history.replaceState({}, '', '/PatientDetail?id=patient-1');
    linhas.patient = [paciente];
    criarRegistro.mockResolvedValue({} as AccessLog);
  });

  it('grava view_patient com a entidade, o identificador e o nome do paciente', async () => {
    renderizarDetalhe();

    await screen.findByRole('heading', { name: 'Carla Mendes' });
    await vi.waitFor(() => expect(criarRegistro).toHaveBeenCalledTimes(1));

    const documento = criarRegistro.mock.calls[0][0] as Record<string, unknown>;

    expect(documento.action).toBe('view_patient');
    expect(documento.entity_type).toBe('Patient');
    expect(documento.entity_id).toBe('patient-1');
    expect(documento.patient_name).toBe('Carla Mendes');
    expect(documento.user_email).toBe(EMAIL_DA_SESSAO);
    expect(documento.ip_address).toBe('client-side');
  });

  it('grava DE NOVO quando o objeto do paciente muda de identidade', async () => {
    const { rerender } = renderizarDetalhe();

    await screen.findByRole('heading', { name: 'Carla Mendes' });
    await vi.waitFor(() => expect(criarRegistro).toHaveBeenCalledTimes(1));

    // Mesmo paciente, **objeto novo** — que é o que um refetch da consulta devolve. O efeito
    // declara `[patient, patientId]` como dependências, então a identidade nova o faz rodar
    // outra vez. A renderização é o veículo: reproduz o que o refetch faria, sem depender de
    // nenhum controle da tela.
    linhas.patient = [{ ...paciente }];

    rerender(
      <MemoryRouter>
        <PatientDetail />
      </MemoryRouter>,
    );

    await vi.waitFor(() => expect(criarRegistro).toHaveBeenCalledTimes(2));

    // O defeito, afirmado: DUAS gravações para UMA visualização, e as duas da mesma ação.
    expect(criarRegistro).toHaveBeenCalledTimes(2);
    expect(acoesGravadas()).toEqual(['view_patient', 'view_patient']);
  });
});

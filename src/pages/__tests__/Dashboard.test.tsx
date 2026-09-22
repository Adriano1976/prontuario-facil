import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Dashboard from '../Dashboard';
import { EMAIL_DA_SESSAO, USUARIO_DA_SESSAO } from '@/test/auditFixtures';
import type { AccessLog } from '@/types';

/**
 * Prova de TELA da gravação de acesso ao painel, em `Dashboard`.
 *
 * O QUE SE MEDE AQUI: `PT-007.3` — a montagem do Dashboard grava **um** registro de
 * auditoria, com a ação e o detalhe que o cenário enuncia, e sem campos de entidade.
 *
 * ⚠️ O MÓDULO NÃO É DUBLADO (decisão D-02). `AccessLogger` corre de verdade e o que se
 * substitui é o transporte.
 *
 * ⚠️ A TELA É DENSA, e os dublês devolvem **conjuntos vazios** de propósito (risco R-01):
 * a verificação afirma a gravação e nada mais, e não precisa que a página passe tempo
 * agregando. Os três componentes pesados são substituídos por nada pelo mesmo motivo.
 *
 * ⚠️ A AÇÃO GRAVADA É `login`, e não uma ação de painel — o enum não tem nenhuma. Toda
 * visita ao Dashboard é contabilizada como um login, e é isso que a prova registra.
 */

const { buscarUsuario, criarRegistro } = vi.hoisted(() => ({
  buscarUsuario: vi.fn(),
  criarRegistro: vi.fn(),
}));

vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: { me: buscarUsuario },
    entities: {
      Patient: { listOwned: vi.fn().mockResolvedValue([]) },
      Consultation: { listOwned: vi.fn().mockResolvedValue([]) },
      Prescription: { listOwned: vi.fn().mockResolvedValue([]) },
      Appointment: { listOwned: vi.fn().mockResolvedValue([]) },
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

/** As quatro consultas devolvem conjuntos vazios; a chave é ignorada de propósito. */
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: [], isLoading: false }),
}));

/** Os três componentes pesados não participam da promessa medida. */
vi.mock('@/components/medical/StatsCard', () => ({ default: () => null }));
vi.mock('@/components/medical/PatientSearch', () => ({ default: () => null }));
vi.mock('@/components/medical/ReportsView', () => ({ default: () => null }));

function renderizarDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard — o acesso ao painel é auditado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarUsuario.mockResolvedValue({ ...USUARIO_DA_SESSAO });
    criarRegistro.mockResolvedValue({} as AccessLog);
  });

  it('grava exatamente um registro ao montar, com a ação e o detalhe do cenário', async () => {
    renderizarDashboard();

    // O efeito de montagem roda uma vez: um registro, e não dois. A contagem exata é o que
    // separa "gravou" de "gravou uma vez por renderização".
    await vi.waitFor(() => expect(criarRegistro).toHaveBeenCalledTimes(1));
    expect(criarRegistro).toHaveBeenCalledTimes(1);

    const documento = criarRegistro.mock.calls[0][0] as Record<string, unknown>;

    // A ação é `login`: o enum do schema não tem ação de acesso a painel, então toda visita
    // ao Dashboard entra na contagem de logins.
    expect(documento.action).toBe('login');
    expect(documento.details).toBe('Acesso ao dashboard');
    expect(documento.user_email).toBe(EMAIL_DA_SESSAO);

    // O evento não tem entidade, e os campos chegam ausentes em vez de vazios.
    expect(documento.entity_type).toBeUndefined();
    expect(documento.entity_id).toBeUndefined();
    expect(documento.patient_name).toBeUndefined();

    expect(documento.ip_address).toBe('client-side');
  });
});

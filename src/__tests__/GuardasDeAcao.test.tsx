import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Doctors from '@/pages/Doctors';
import Templates from '@/pages/Templates';
import { medico } from '@/test/appointmentsFixtures';
import { MODELO_RECEITA } from '@/test/templateFixtures';

/**
 * Prova das GUARDAS DE AÇÃO de Médicos e Templates (achado F-01).
 *
 * O QUE SE MEDE AQUI: que as ações de escrita — criar, editar e excluir — não são
 * OFERECIDAS a quem não é administrador, e que a LEITURA continua funcionando para ele.
 * É a metade que faltava do F-01: `RbacRotas.test.tsx` prova que a rota não é bloqueada
 * (BR-MIGRAR-017/020 permitem a leitura), e esta prova mede o que se esconde DENTRO dela.
 *
 * POR QUE ELA EXISTE: sem esta prova, apagar um `{isAdmin && ...}` de qualquer botão
 * deixaria a suíte inteira verde — e a restrição de escrita voltaria a depender só da
 * regra do servidor, que é exatamente o que o achado F-01 mandou reforçar na interface.
 *
 * COMO: as páginas são renderizadas de verdade, com a sessão vinda de `base44.auth.me`
 * (portanto passando por `toSessionUser`) e a lista vinda de um dublê do cliente. O botão
 * de EXCLUIR não tem nome acessível — é só um ícone —, e por isso dois recursos entram:
 * a contagem total de botões no caso sem papel, e o contêiner de ações do cartão no caso
 * com papel.
 *
 * ⚠️ Cada render recebe um cliente de consulta próprio: o cache de um caso não pode
 * responder pelo seguinte, senão a prova mediria o cache em vez da guarda.
 */

const { sessao, listas } = vi.hoisted(() => ({
  sessao: { valor: null as Record<string, unknown> | null },
  listas: { medicos: [] as unknown[], modelos: [] as unknown[] },
}));

vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: { me: vi.fn(async () => sessao.valor) },
    entities: {
      Doctor: {
        list: vi.fn(async () => listas.medicos),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      Template: {
        list: vi.fn(async () => listas.modelos),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  },
}));

/** A forma que o servidor devolve — crua, para que a conversão da sessão seja exercitada. */
const SESSAO_SEM_PAPEL = {
  id: 'demo-user-001',
  email: 'demo@medrecord.local',
  full_name: 'Dra. Demo',
};
const SESSAO_ADMIN = { ...SESSAO_SEM_PAPEL, role: 'admin' };

function renderizar(tela: 'medicos' | 'modelos') {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Pagina = tela === 'medicos' ? Doctors : Templates;

  return render(
    <QueryClientProvider client={cliente}>
      <MemoryRouter>
        <Pagina />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Médicos — as ações de escrita são de administrador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listas.medicos = [medico()];
  });

  it('esconde criar, editar e excluir de quem não é admin, e ainda mostra a lista', async () => {
    sessao.valor = SESSAO_SEM_PAPEL;

    renderizar('medicos');

    // A LEITURA continua: é o que BR-MIGRAR-017 garante a qualquer autenticado.
    expect(await screen.findByText('Dra. Helena Prado')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /Novo Médico/i })).toBeNull();
    expect(screen.queryAllByRole('button', { name: /Editar/i })).toHaveLength(0);

    // O botão de excluir não tem nome acessível — nenhuma consulta por papel o alcança.
    // A tela tem UM botão neste caso, e é o de voltar: nenhuma ação de escrita sobrou.
    expect(screen.queryAllByRole('button')).toHaveLength(1);
  });

  it('oferece as três ações ao administrador', async () => {
    sessao.valor = SESSAO_ADMIN;

    renderizar('medicos');

    expect(await screen.findByText('Dra. Helena Prado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Novo Médico/i })).toBeInTheDocument();

    // O contêiner de ações do cartão tem exatamente dois botões: editar e excluir. É
    // assim que o botão sem nome entra na prova.
    const editar = screen.getByRole('button', { name: /Editar/i });
    expect(within(editar.parentElement as HTMLElement).getAllByRole('button')).toHaveLength(2);
  });
});

describe('Templates — as ações de escrita são de administrador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listas.modelos = [MODELO_RECEITA];
  });

  it('esconde criar, editar e excluir de quem não é admin, e ainda mostra a lista', async () => {
    sessao.valor = SESSAO_SEM_PAPEL;

    renderizar('modelos');

    // BR-MIGRAR-020: a leitura dos modelos ativos é liberada a profissionais.
    expect(await screen.findByText('Receita Padrão')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /Novo Template/i })).toBeNull();
    expect(screen.queryAllByRole('button', { name: /Editar/i })).toHaveLength(0);

    // Mesma conta do caso de Médicos: só o botão de voltar permanece.
    expect(screen.queryAllByRole('button')).toHaveLength(1);
  });

  it('oferece as ações ao administrador', async () => {
    sessao.valor = SESSAO_ADMIN;

    renderizar('modelos');

    expect(await screen.findByText('Receita Padrão')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Novo Template/i })).toBeInTheDocument();

    const editar = screen.getByRole('button', { name: /Editar/i });
    expect(within(editar.parentElement as HTMLElement).getAllByRole('button')).toHaveLength(2);
  });

  it('no estado vazio, o convite para criar não é oferecido a quem não é admin', async () => {
    sessao.valor = SESSAO_SEM_PAPEL;
    listas.modelos = [];

    renderizar('modelos');

    // O estado vazio é o terceiro lugar onde a criação se oferece — e o mais fácil de
    // esquecer, porque não fica ao lado dos outros dois.
    expect(await screen.findByText('Nenhum template criado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Criar Primeiro Template/i })).toBeNull();
  });

  it('no estado vazio, o convite para criar é oferecido ao administrador', async () => {
    sessao.valor = SESSAO_ADMIN;
    listas.modelos = [];

    renderizar('modelos');

    // O contraste torna a ausência acima significativa: o botão existe, e é a guarda que
    // o esconde — não a ausência do estado vazio.
    expect(await screen.findByText('Nenhum template criado')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Criar Primeiro Template/i }),
    ).toBeInTheDocument();
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Prova do interruptor de papel do usuário de demonstração — `VITE_OFFLINE_ROLE`.
 *
 * O QUE SE MEDE AQUI:
 *
 * 1. **SEM** a variável, o usuário de demonstração continua exatamente o do legado —
 *    sem papel. É a paridade da BR-MIGRAR-039, e é o que o adendo `011-rbac-frontend`
 *    exigiu ao recusar a promoção incondicional do usuário de demonstração.
 * 2. **COM** `VITE_OFFLINE_ROLE=admin`, o papel é declarado e chega até as guardas: o
 *    escopo resolvido é administrativo, que é o que abre `/AccessLogs` e as ações de
 *    escrita de Médicos e Templates.
 * 3. Qualquer **outro** valor é ignorado — papel desconhecido não vira acesso.
 *
 * COMO: o papel é lido uma única vez, na carga do módulo, então cada caso descarta o
 * registro de módulos e importa o adaptador de novo. O valor é sempre DECLARADO no
 * caso, nunca herdado do `.env.local` de quem roda a suíte — do contrário a prova
 * mediria a máquina, e não o código.
 */

/** Importa o adaptador do zero, para que a leitura do ambiente aconteça de novo. */
async function carregarAdaptador() {
  vi.resetModules();
  return import('../mockClient');
}

describe('Modo offline — o papel declarado do usuário de demonstração', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('sem a variável, o usuário de demonstração continua SEM papel', async () => {
    vi.stubEnv('VITE_OFFLINE_ROLE', '');

    const { OFFLINE_USER } = await carregarAdaptador();

    expect(OFFLINE_USER).toEqual({
      id: 'demo-user-001',
      email: 'demo@medrecord.local',
      full_name: 'Dra. Demo',
    });
    // O papel é AUSENTE, e não `undefined` presente: é a forma que o legado tinha.
    expect('role' in OFFLINE_USER).toBe(false);
  });

  it('com VITE_OFFLINE_ROLE=admin, o usuário de demonstração declara o papel', async () => {
    vi.stubEnv('VITE_OFFLINE_ROLE', 'admin');

    const { createMockClient } = await carregarAdaptador();

    await expect(createMockClient().auth.me()).resolves.toMatchObject({ role: 'admin' });
  });

  it('um valor desconhecido é ignorado e não vira papel administrativo', async () => {
    vi.stubEnv('VITE_OFFLINE_ROLE', 'superuser');

    const { createMockClient } = await carregarAdaptador();
    const usuario = (await createMockClient().auth.me()) as Record<string, unknown>;

    expect(usuario.role).toBeUndefined();
  });

  it('o papel declarado chega às guardas: o escopo resolvido é administrativo', async () => {
    vi.stubEnv('VITE_OFFLINE_ROLE', 'admin');

    const { createMockClient } = await carregarAdaptador();
    const { toSessionUser } = await import('@/lib/session');
    const { resolveScope } = await import('../sessionScope');

    const sessao = toSessionUser(await createMockClient().auth.me());
    if (!sessao) throw new Error('a sessão de demonstração deveria ser montada');

    // É este o elo entre a declaração de ambiente e a tela: sem papel, o escopo é de
    // dono (BR-MIGRAR-034) e a trilha de auditoria devolve conjunto vazio.
    expect(resolveScope(sessao)).toEqual({ kind: 'admin' });
  });
});

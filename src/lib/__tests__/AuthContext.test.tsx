import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Prova do achado **F-02** — a camada que decide a sessão.
 *
 * O QUE SE MEDE AQUI: a verificação de sessão (1) acontece **sem** credencial legível pelo
 * cliente, (2) sobrevive a uma **nova montagem** do provedor, e (3) **distingue** falha de
 * verificação de ausência de sessão.
 *
 * POR QUE A AUSÊNCIA DE `hasSessionToken` NO DUBLÊ É O PONTO: o dublê abaixo **não** expõe
 * mais aquele símbolo, e o armazenamento começa vazio. Se o provedor voltar a decidir a
 * verificação por uma credencial legível, ele encontrará `undefined`, não consultará o
 * servidor, e o caso (1) falha. É assim que a reintrodução do portão antigo é detectada.
 *
 * COMO: a camada de dados é substituída, e o registro de módulos é descartado a cada caso
 * para que o curto-circuito do modo offline seja reavaliado do zero.
 */

const { authMock } = vi.hoisted(() => ({
  authMock: {
    me: vi.fn(),
    getPublicSettings: vi.fn(),
    logout: vi.fn(),
    redirectToLogin: vi.fn(),
  },
}));

vi.mock('@/api/base44Client', () => ({
  base44: { auth: authMock },
}));

vi.mock('@/api/mockClient', () => ({
  OFFLINE_USER: {
    id: 'demo-user-001',
    email: 'demo@medrecord.local',
    full_name: 'Dra. Demo',
  },
}));

/** A forma crua que o servidor devolve, para que `toSessionUser` também participe. */
const SESSAO = {
  id: 'medico-001',
  email: 'medico@clinica.local',
  full_name: 'Dra. Teste',
  role: 'admin',
};

/**
 * Monta o provedor com a URL do serviço de sessão já respondendo conforme o caso.
 *
 * O consumidor só anuncia o que o provedor decidiu — e o `erro:` é o que torna a
 * distinção entre falha e ausência observável de fora.
 */
async function montar() {
  const { AuthProvider, useAuth } = await import('../AuthContext');

  const Consumidor = () => {
    const { user, isAuthenticated, isLoadingAuth, authError } = useAuth();

    return (
      <>
        <div>{`loading:${String(isLoadingAuth)}`}</div>
        <div>{`auth:${String(isAuthenticated)}`}</div>
        <div>{`erro:${authError?.type ?? 'nenhum'}`}</div>
        <div>{user?.full_name ?? 'no-user'}</div>
      </>
    );
  };

  return render(
    <AuthProvider>
      <Consumidor />
    </AuthProvider>,
  );
}

describe('AuthProvider — a sessão e a credencial que o cliente não lê', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
    authMock.getPublicSettings.mockResolvedValue({ id: 'app-de-teste' });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('usa o usuário de demonstração quando o modo offline está ativo', async () => {
    vi.stubEnv('VITE_OFFLINE', 'true');

    await montar();

    expect(await screen.findByText('loading:false')).toBeInTheDocument();
    expect(await screen.findByText('auth:true')).toBeInTheDocument();
    expect(await screen.findByText('Dra. Demo')).toBeInTheDocument();
  });

  it('verifica a sessão mesmo SEM credencial legível no armazenamento', async () => {
    vi.stubEnv('VITE_OFFLINE', 'false');
    authMock.me.mockResolvedValue(SESSAO);

    await montar();

    // O armazenamento está vazio e o dublê não expõe `hasSessionToken`. Ainda assim a
    // sessão é decidida — porque a credencial que a sustenta é o cookie do servidor, e não
    // algo que este cliente consiga ler.
    expect(await screen.findByText('auth:true')).toBeInTheDocument();
    expect(screen.queryByText('no-user')).not.toBeInTheDocument();
    expect(await screen.findByText('Dra. Teste')).toBeInTheDocument();
    expect(await screen.findByText('erro:nenhum')).toBeInTheDocument();
  });

  it('mantém a sessão numa nova montagem, sem nada persistido', async () => {
    vi.stubEnv('VITE_OFFLINE', 'false');
    authMock.me.mockResolvedValue(SESSAO);

    const primeira = await montar();
    expect(await screen.findByText('auth:true')).toBeInTheDocument();
    primeira.unmount();

    // A recarga é a nova montagem. Sem persistência, é aqui que a sessão se perderia se o
    // portão antigo tivesse ficado.
    await montar();

    expect(await screen.findByText('auth:true')).toBeInTheDocument();
    expect(authMock.me).toHaveBeenCalledTimes(2);
    expect(window.localStorage.getItem('base44_access_token')).toBeNull();
  });

  it('distingue FALHA de verificação de AUSÊNCIA de sessão', async () => {
    vi.stubEnv('VITE_OFFLINE', 'false');
    // Sem `status`: é falha de transporte, não resposta do servidor.
    authMock.me.mockRejectedValue(new Error('sem rede'));

    await montar();

    expect(await screen.findByText('erro:session_check_failed')).toBeInTheDocument();
    expect(await screen.findByText('auth:false')).toBeInTheDocument();
  });

  it('trata 401 como AUSÊNCIA de sessão, e não como falha', async () => {
    vi.stubEnv('VITE_OFFLINE', 'false');
    authMock.me.mockRejectedValue({ status: 401, message: 'Authentication required' });

    await montar();

    expect(await screen.findByText('erro:auth_required')).toBeInTheDocument();
  });
});

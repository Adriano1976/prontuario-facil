import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/api/base44Client', () => ({
  hasSessionToken: true,
  base44: {
    auth: {
      me: vi.fn(),
      getPublicSettings: vi.fn(),
      logout: vi.fn(),
      redirectToLogin: vi.fn(),
    },
  },
}));

vi.mock('@/api/mockClient', () => ({
  OFFLINE_USER: {
    id: 'demo-user-001',
    email: 'demo@medrecord.local',
    full_name: 'Dra. Demo',
  },
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_OFFLINE', 'true');
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('uses the offline demo user when offline mode is enabled', async () => {
    const { AuthProvider, useAuth } = await import('../AuthContext');

    const TestConsumer = () => {
      const { user, isAuthenticated, isLoadingAuth } = useAuth();

      return (
        <>
          <div>{`loading:${String(isLoadingAuth)}`}</div>
          <div>{`auth:${String(isAuthenticated)}`}</div>
          <div>{user?.full_name ?? 'no-user'}</div>
        </>
      );
    };

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(await screen.findByText('loading:false')).toBeInTheDocument();
    expect(await screen.findByText('auth:true')).toBeInTheDocument();
    expect(await screen.findByText('Dra. Demo')).toBeInTheDocument();
  });
});

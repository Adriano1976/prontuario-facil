import { describe, expect, it } from 'vitest';
import { asUserScope, isAdminScope, resolveScope } from '../sessionScope';

describe('patient access scopes', () => {
  it('scopes an authenticated non-admin user to their own records', () => {
    const user = {
      kind: 'authenticated' as const,
      id: 'user-123',
      email: 'user@example.com',
      role: 'user' as const,
    };

    expect(resolveScope(user)).toEqual({ kind: 'user', user_id: 'user-123' });
    expect(asUserScope(user)).toEqual({ kind: 'user', user_id: 'user-123' });
    expect(isAdminScope(resolveScope(user))).toBe(false);
  });

  it('allows an administrator scope explicitly', () => {
    const admin = {
      kind: 'authenticated' as const,
      id: 'admin-123',
      email: 'admin@example.com',
      role: 'admin' as const,
    };

    expect(resolveScope(admin)).toEqual({ kind: 'admin' });
    expect(isAdminScope(resolveScope(admin))).toBe(true);
    expect(asUserScope(admin)).toEqual({ kind: 'user', user_id: 'admin-123' });
  });

  it('uses an empty owner scope while authentication is unavailable', () => {
    expect(resolveScope(null)).toEqual({ kind: 'user', user_id: '' });
    expect(asUserScope(undefined)).toEqual({ kind: 'user', user_id: '' });
  });
});

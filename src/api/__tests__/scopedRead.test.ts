import { describe, expect, it, vi } from 'vitest';
import { createScopedReader } from '../scopedRead';

describe('scoped patient reads', () => {
  it('adds the authenticated user as the owner filter', async () => {
    const filter = vi.fn().mockResolvedValue([]);
    const reader = createScopedReader<{ status?: string; created_by_id?: string }>({
      list: vi.fn(),
      filter,
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    });

    await reader.filterOwned(
      { kind: 'user', user_id: 'user-123' },
      { status: 'ativo' },
    );

    expect(filter).toHaveBeenCalledWith({
      status: 'ativo',
      created_by_id: 'user-123',
    }, undefined, undefined);
  });

  it('does not add an owner filter for an explicit admin read', async () => {
    const filter = vi.fn().mockResolvedValue([]);
    const reader = createScopedReader<{ status?: string; created_by_id?: string }>({
      list: vi.fn(),
      filter,
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    });

    await reader.filterAsAdmin({ kind: 'admin' }, { status: 'ativo' });

    expect(filter).toHaveBeenCalledWith({ status: 'ativo' }, undefined, undefined);
  });
});

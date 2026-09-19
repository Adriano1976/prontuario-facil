import { beforeEach, describe, expect, it } from 'vitest';
import { createMockClient, OFFLINE_USER } from '../mockClient';

describe('createMockClient', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates and lists a patient with offline ownership metadata', async () => {
    const client = createMockClient();

    const created = await client.entities.Patient.create({
      full_name: 'Ana Souza',
      email: 'ana@teste.com',
      cpf: '12345678900',
      phone: '11999999999',
      status: 'ativo',
    });

    expect(created.id).toBeTruthy();
    expect(created.created_by_id).toBe(OFFLINE_USER.id);
    expect(created.created_date).toBeTruthy();

    const list = await client.entities.Patient.list();
    expect(list.some((item) => item.id === created.id)).toBe(true);
  });

  it('returns the demo user for auth.me() in offline mode', async () => {
    const client = createMockClient();

    await expect(client.auth.me()).resolves.toMatchObject({
      id: OFFLINE_USER.id,
      email: OFFLINE_USER.email,
      full_name: OFFLINE_USER.full_name,
    });
  });
});

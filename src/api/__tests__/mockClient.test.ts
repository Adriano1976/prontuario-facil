import { beforeEach, describe, expect, it } from 'vitest';
import type { RawEntities } from '../contract';
import { createAppDataClient } from '../registry';
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

  it('shows a patient created offline in the scoped listing (defeito DIV-01, watch W009)', async () => {
    const bruto = createMockClient();
    const cliente = createAppDataClient(bruto.entities as unknown as RawEntities, bruto);
    const escopo = { kind: 'user', user_id: OFFLINE_USER.id } as const;

    const criado = await cliente.entities.Patient.create({
      full_name: 'Paciente Criado no Offline',
      cpf: '00000000000',
      birth_date: '1990-01-01',
      phone: '11000000000',
      lgpd_consent: false,
    });

    // A leitura escopada aplica o filtro de dono por cima das condições. Sem o
    // `created_by_id` que o adaptador passou a preencher, o registro existiria no
    // armazenamento e ainda assim não apareceria aqui — foi o defeito DIV-01.
    const listados = await cliente.entities.Patient.listOwned(escopo);
    expect(listados.some((paciente) => paciente.id === criado.id)).toBe(true);

    const filtrados = await cliente.entities.Patient.filterOwned(escopo, { id: criado.id });
    expect(filtrados).toHaveLength(1);
  });
});

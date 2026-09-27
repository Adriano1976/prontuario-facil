import { describe, expect, it, vi } from 'vitest';
import { createEntityRepository } from '../entities';

/**
 * Prova da **transparência do adaptador** quanto ao deslocamento.
 *
 * O QUE SE MEDE AQUI: que `createEntityRepository` não engole o terceiro parâmetro. É o ponto
 * exato onde a capacidade se perdia — o SDK do provedor já expõe `skip`
 * (`entities.types.d.ts:248`), e o adaptador declarava `(sort, limit)` e repassava dois argumentos.
 *
 * POR QUE ISTO BASTA COMO PROVA DE PARIDADE. O adaptador é o único caminho entre o contrato e o
 * SDK; se ele repassa os três argumentos intactos, então as duas implementações recebem
 * exatamente os mesmos parâmetros, e a concordância passa a depender só de cada uma honrá-los —
 * o que a prova do cliente de modo offline mede do outro lado, em `mockClientOffline.test.ts`.
 * Comparar o adaptador contra o mock diretamente mediria o mock, não o adaptador.
 *
 * ⚠️ `skip` é o TERCEIRO posicional, e não há como informá-lo sem informar `limit` — é a forma do
 * SDK, e é a forma que o contrato passa a espelhar. Quem quiser "do N em diante, sem teto" passa
 * `undefined` no limite; o comportamento disso é o de cada implementação, e está registrado nas
 * notas de execução do `actions.md`.
 */

type Registro = { id: string; nome: string };

/** Fonte espiã: registra os argumentos e devolve vazio. */
function fonteEspiada() {
  const listar = vi.fn(async (_sort?: string, _limit?: number, _skip?: number) => [] as Registro[]);
  const filtrar = vi.fn(
    async (
      _condicoes: Record<string, unknown>,
      _sort?: string,
      _limit?: number,
      _skip?: number,
    ) => [] as Registro[],
  );

  const fonte = {
    list: listar,
    filter: filtrar,
    create: vi.fn(async () => ({ id: 'novo', nome: 'novo' })),
    update: vi.fn(async () => ({ id: 'novo', nome: 'novo' })),
    delete: vi.fn(async () => ({ success: true })),
  };

  return { fonte, listar, filtrar };
}

describe('Contrato — o adaptador repassa o deslocamento', () => {
  it('`list` chega à fonte com ordenação, limite e deslocamento intactos', async () => {
    const { fonte, listar } = fonteEspiada();
    const repositorio = createEntityRepository<Registro, { nome: string }>(fonte);

    await repositorio.list('nome', 10, 20);

    expect(listar).toHaveBeenCalledWith('nome', 10, 20);
  });

  it('`filter` chega à fonte com as condições e os três parâmetros intactos', async () => {
    const { fonte, filtrar } = fonteEspiada();
    const repositorio = createEntityRepository<Registro, { nome: string }>(fonte);

    await repositorio.filter({ nome: 'Ana' }, 'nome', 10, 20);

    expect(filtrar).toHaveBeenCalledWith({ nome: 'Ana' }, 'nome', 10, 20);
  });

  it('envolver a fonte não muda a janela devolvida', async () => {
    // A fonte abaixo recorta como o SDK documenta: ordena, e devolve `[skip, skip + limit)`.
    const registros: Registro[] = Array.from({ length: 6 }, (_, indice) => ({
      id: `r${indice}`,
      nome: `Nome ${indice}`,
    }));

    const cru = {
      list: async (_sort?: string, limit?: number, skip?: number) => {
        const ordenado = [...registros].sort((a, b) => (a.nome < b.nome ? -1 : 1));
        const inicio = skip ?? 0;
        return ordenado.slice(inicio, inicio + (limit ?? ordenado.length));
      },
      filter: async () => [] as Registro[],
      create: async () => registros[0] as Registro,
      update: async () => registros[0] as Registro,
      delete: async () => ({ success: true }),
    };

    const adaptado = createEntityRepository<Registro, { nome: string }>(cru);

    expect((await adaptado.list('nome', 2, 2)).map((r) => r.nome)).toEqual(['Nome 2', 'Nome 3']);
    expect(await adaptado.list('nome', 2, 2)).toEqual(await cru.list('nome', 2, 2));
  });
});

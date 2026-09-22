import { beforeEach, describe, expect, it } from 'vitest';
import { createMockClient } from '../mockClient';
import { mockSeed } from '../mockSeed';

/**
 * Prova de EXECUÇÃO do adaptador do modo offline — os seis cenários de `PT-009` e as regras
 * declaradas que os cenários não nomeiam.
 *
 * | Requisito | Cenário / regra | Como é provado |
 * |-----------|-----------------|----------------|
 * | `RF-05` | `PT-009.3` · `BR-OFF04` | a primeira leitura semeia o **seed real** sob a chave prefixada |
 * | `RF-07` | `BR-OFF04` | conteúdo inválido na chave não lança e devolve o seed |
 * | `RF-06` | `PT-009.3` | criar, atualizar e excluir refletem, e sobrevivem a nova instância |
 * | `RF-09` | `PT-009.5` · `BR-OFF06` | a criação preenche identificador e datas |
 * | `RF-10` | `PT-009.5` · `BR-OFF07` | a atualização preserva o identificador e mescla |
 * | `RF-11` | `PT-009.5` · `BR-OFF07` | identificador desconhecido rejeita com a mensagem exata |
 * | `RF-12` | `PT-009.6` · `BR-OFF08` · `L4` | o filtro casa só por igualdade exata |
 * | `RF-13` | `PT-009.6` · `BR-OFF09` · `L5` | ordenação de um campo, com corte **depois** de ordenar |
 * | `RF-08` | `PT-009.4` · `BR-OFF10` · `L1` | registro com dono alheio é visível e editável |
 * | `RF-14` | `#3.2` | nome fora do domínio devolve repositório e conjunto vazio |
 * | `RF-15` | `BR-OFF11` · `BR-OFF12` | os no-ops não mudam o armazenamento |
 * | `RF-16` | `L3` | o envio de arquivo devolve dado embutido e não persiste |
 * | `RF-17` | `L6` | o repositório não expõe leitura direta por identificador |
 * | `RF-18` | `BR-OFF06` | identificador informado pelo chamador **sobrepõe** o gerado |
 * | `RF-19` | `#6` | o envio de e-mail é recusado com mensagem própria |
 * | `RF-20` | `BR-OFF07` | excluir identificador inexistente resolve com sucesso |
 *
 * ⚠️ ESTE ARQUIVO NÃO LÊ A VARIÁVEL DE AMBIENTE. Ele exercita o adaptador chamando métodos, com
 * armazenamento limpo. A prova da **ativação** — qual cliente o módulo exporta — vive no arquivo
 * irmão `offlineActivation.test.ts`, porque ela precisa descartar o registro de módulos, e essa é
 * uma intervenção global que contaminaria este arranjo.
 *
 * ⚠️ O ESTADO DE PARTIDA É AFIRMADO, e não suposto. A limpeza no `beforeEach` sem conferência é uma
 * suposição, e suposição é o que faz uma verificação passar sem medir (`R-04`).
 *
 * ⚠️ A ENTIDADE DE RASCUNHO ESTÁ FORA DO DOMÍNIO, de propósito. O acesso é dinâmico e devolve
 * repositório para qualquer nome; usar um nome sem seed dá ponto de partida vazio e determinístico,
 * sem tocar nos dados de demonstração. As provas que dependem do seed usam uma entidade **semeada**,
 * porque sem isso o desfecho não distinguiria tolerância de ausência (`D-06`, `D-08`).
 *
 * ⚠️ O IDENTIFICADOR NÃO É AFIRMADO POR FORMATO. O adaptador usa o gerador do navegador quando
 * existe e cai para um identificador próprio quando não existe; afirmar o formato tornaria a prova
 * dependente do ambiente, e o que a regra promete é o identificador, não a forma (`D-10`, `R-06`).
 */

const PREFIXO = 'mock_db_';

/** Um nome de entidade que **não** pertence às oito do domínio, e não tem seed. */
const RASCUNHO = 'EntidadeDeRascunho';

/** As chaves hoje presentes no armazenamento, em ordem. */
function chavesDoArmazenamento(): string[] {
  return Array.from({ length: localStorage.length }, (_, indice) => localStorage.key(indice) ?? '')
    .sort();
}

/** O repositório de rascunho, obtido pelo acesso dinâmico do adaptador. */
function rascunho() {
  return createMockClient().entities[RASCUNHO];
}

describe('Modo offline — o adaptador', () => {
  beforeEach(() => {
    localStorage.clear();
    // O estado de partida é parte da medida, e não uma suposição.
    expect(localStorage.length).toBe(0);
    expect(localStorage.getItem(PREFIXO + 'Patient')).toBeNull();
  });

  describe('BR-OFF04 — persistência local com seed na primeira leitura', () => {
    it('semeia a coleção a partir do seed, sob a chave prefixada', async () => {
      const lista = await createMockClient().entities.Patient.list();

      // A ORIGEM é o seed — os identificadores são os dele, e não uma cópia qualquer.
      expect(lista.map((registro) => registro.id)).toEqual(
        mockSeed.Patient.map((paciente) => paciente.id),
      );

      // E a coleção foi gravada sob a chave prefixada, que é a promessa de persistência.
      expect(localStorage.getItem(PREFIXO + 'Patient')).not.toBeNull();
    });

    it('devolve o seed quando a chave contém conteúdo inválido, sem lançar', async () => {
      // Entidade SEMEADA de propósito: com uma sem seed, o desfecho seria vazio e a verificação
      // não distinguiria "caiu para o seed" de "não havia nada para semear".
      localStorage.setItem(PREFIXO + 'Doctor', 'isto não é JSON');

      const lista = await createMockClient().entities.Doctor.list();

      expect(lista.map((registro) => registro.id)).toEqual(
        mockSeed.Doctor.map((medico) => medico.id),
      );
    });
  });

  describe('BR-OFF04 — criar, atualizar e excluir persistem', () => {
    it('reflete as três operações na leitura seguinte', async () => {
      const repositorio = rascunho();

      const criado = await repositorio.create({ nome: 'Primeiro' });
      expect((await repositorio.list()).map((registro) => registro.id)).toContain(criado.id);

      await repositorio.update(criado.id!, { nome: 'Segundo' });
      const depoisDaAtualizacao = await repositorio.list();
      expect(depoisDaAtualizacao.find((registro) => registro.id === criado.id)?.nome).toBe(
        'Segundo',
      );

      await repositorio.delete(criado.id!);
      expect((await repositorio.list()).map((registro) => registro.id)).not.toContain(criado.id);
    });

    it('o conjunto sobrevive a uma nova instância do cliente', async () => {
      const criado = await rascunho().create({ nome: 'Persistente' });

      const outraInstancia = createMockClient();
      const lista = await outraInstancia.entities[RASCUNHO].list();

      expect(lista.map((registro) => registro.id)).toContain(criado.id);
    });
  });

  describe('BR-OFF06 e BR-OFF07 — o ciclo de vida do registro', () => {
    it('a criação preenche identificador, data de criação e a data do registro', async () => {
      const criado = await rascunho().create({ nome: 'Com datas' });

      expect(typeof criado.id).toBe('string');
      expect(criado.id).not.toBe('');
      expect(typeof criado.created_date).toBe('string');
      expect(criado.created_date).not.toBe('');
      // A data do registro é preenchida quando ausente, com o mesmo instante da criação.
      expect(criado.date).toBe(criado.created_date);
    });

    it('a criação respeita a data de registro já informada', async () => {
      const criado = await rascunho().create({
        nome: 'Com data própria',
        date: '2026-01-02T03:04:05.000Z',
      });

      expect(criado.date).toBe('2026-01-02T03:04:05.000Z');
    });

    it('dois registros criados em sequência recebem identificadores distintos', async () => {
      const primeiro = await rascunho().create({ nome: 'Um' });
      const segundo = await rascunho().create({ nome: 'Dois' });

      expect(primeiro.id).not.toBe(segundo.id);
    });

    it('a atualização preserva o identificador e mescla os campos', async () => {
      const repositorio = rascunho();
      const criado = await repositorio.create({ nome: 'Original', valor: 1 });

      const atualizado = await repositorio.update(criado.id!, { valor: 2 });

      expect(atualizado.id).toBe(criado.id);
      expect(atualizado.valor).toBe(2);
      // O campo NÃO informado permanece — é o que separa mesclagem de substituição.
      expect(atualizado.nome).toBe('Original');
    });

    it('atualizar identificador desconhecido rejeita com a mensagem exata', async () => {
      // A forma da mensagem é a promessa: afirmar só "rejeita" cobriria metade da cláusula (`D-09`).
      await expect(rascunho().update('nao-existe', { nome: 'x' })).rejects.toThrow(
        `Not found: ${RASCUNHO} nao-existe`,
      );
    });
  });

  describe('BR-OFF08 e BR-OFF09 — filtro e ordenação do legado', () => {
    it('o filtro casa por igualdade exata, e não por proximidade', async () => {
      const repositorio = rascunho();
      await repositorio.create({ nome: 'Ana', valor: 10 });
      await repositorio.create({ nome: 'Ana Paula', valor: 100 });
      await repositorio.create({ nome: 'ana', valor: 10 });

      // "Ana Paula" NÃO casa com "Ana": a comparação é estrita, e não por conteúdo.
      expect((await repositorio.filter({ nome: 'Ana' })).map((r) => r.valor)).toEqual([10]);
      // E a caixa importa: 'Ana' e 'ana' são valores distintos que compartilham o mesmo número.
      expect(await repositorio.filter({ valor: 10 })).toHaveLength(2);
      expect(await repositorio.filter({ valor: 100 })).toHaveLength(1);
    });

    it('não interpreta operadores de intervalo nem de conteúdo', async () => {
      const repositorio = rascunho();
      await repositorio.create({ nome: 'Ana', valor: 10 });

      // O valor da condição é comparado por identidade: um objeto de operador não casa com nada.
      expect(await repositorio.filter({ valor: { gte: 0 } })).toEqual([]);
      expect(await repositorio.filter({ nome: { contains: 'An' } })).toEqual([]);
    });

    it('ordena por um campo, ascendente e descendente', async () => {
      const repositorio = rascunho();
      await repositorio.create({ nome: 'Carlos' });
      await repositorio.create({ nome: 'Ana' });
      await repositorio.create({ nome: 'Bruno' });

      expect((await repositorio.list('nome')).map((r) => r.nome)).toEqual([
        'Ana',
        'Bruno',
        'Carlos',
      ]);
      expect((await repositorio.list('-nome')).map((r) => r.nome)).toEqual([
        'Carlos',
        'Bruno',
        'Ana',
      ]);
    });

    it('o limite corta DEPOIS de ordenar', async () => {
      const repositorio = rascunho();
      await repositorio.create({ nome: 'Carlos' });
      await repositorio.create({ nome: 'Ana' });
      await repositorio.create({ nome: 'Bruno' });

      // Se o limite viesse antes da ordenação, sairiam 'Carlos' e 'Ana' — os dois primeiros
      // gravados. A ordem é o que separa uma coisa da outra.
      expect((await repositorio.list('nome', 2)).map((r) => r.nome)).toEqual(['Ana', 'Bruno']);
    });
  });

  describe('BR-OFF10 — o adaptador não aplica regra de acesso', () => {
    it('um registro com dono alheio é visível e editável', async () => {
      // A forma FORTE da cláusula: não basta o próprio registro ser visível — o de outra origem
      // também é. Gravar direto no armazenamento evita que o adaptador carimbe o dono (`D-07`).
      localStorage.setItem(
        PREFIXO + RASCUNHO,
        JSON.stringify([{ id: 'alheio-1', nome: 'De outra origem', created_by_id: 'outro-999' }]),
      );

      const repositorio = rascunho();

      expect((await repositorio.list()).map((r) => r.id)).toContain('alheio-1');
      expect(await repositorio.filter({ id: 'alheio-1' })).toHaveLength(1);

      await repositorio.update('alheio-1', { nome: 'Editado por quem não é o dono' });
      expect((await repositorio.list()).find((r) => r.id === 'alheio-1')?.nome).toBe(
        'Editado por quem não é o dono',
      );
    });
  });

  describe('#3.2 — o acesso dinâmico devolve repositório para qualquer nome', () => {
    it('um nome fora do domínio devolve repositório funcional e conjunto vazio', async () => {
      const repositorio = createMockClient().entities['NomeQueNaoExisteEmLugarNenhum'];

      expect(repositorio).toBeDefined();
      expect(await repositorio.list()).toEqual([]);
      expect(await repositorio.filter({ qualquer: 'coisa' })).toEqual([]);
    });
  });

  describe('BR-OFF11 e BR-OFF12 — os no-ops de sessão e telemetria', () => {
    it('encerrar sessão, redirecionar e registrar acesso não mudam o armazenamento', async () => {
      const cliente = createMockClient();
      const antes = chavesDoArmazenamento();

      await cliente.auth.logout('http://exemplo.test/');
      expect(() => cliente.auth.redirectToLogin('http://exemplo.test/')).not.toThrow();
      await cliente.appLogs.logUserInApp('Dashboard');

      expect(chavesDoArmazenamento()).toEqual(antes);
    });
  });

  describe('L3 e #6 — as integrações declaradas', () => {
    it('o envio de arquivo devolve dado embutido e não cria registro persistido', async () => {
      const cliente = createMockClient();
      const arquivo = new File(['conteúdo de prova'], 'exame.txt', { type: 'text/plain' });

      const resultado = await cliente.integrations.Core.UploadFile({ file: arquivo });

      expect(resultado.file_url.startsWith('data:')).toBe(true);
      // O envio não persiste: nenhuma coleção do adaptador foi criada (`L3`).
      expect(chavesDoArmazenamento().filter((chave) => chave.startsWith(PREFIXO))).toEqual([]);
    });

    it('o envio de e-mail é recusado com mensagem própria', async () => {
      const cliente = createMockClient();

      await expect(
        cliente.integrations.Core.SendEmail({ to: '', subject: '', body: '' }),
      ).rejects.toThrow('SendEmail indisponível no modo offline');
    });
  });

  describe('L6 e BR-OFF06 e BR-OFF07 — as bordas declaradas', () => {
    it('o repositório não expõe leitura direta por identificador', async () => {
      const repositorio = rascunho() as Record<string, unknown>;

      expect(repositorio.get).toBeUndefined();
      // O caminho declarado é filtrar ou percorrer a lista — e o filtro funciona.
      expect(await rascunho().filter({ id: 'qualquer' })).toEqual([]);
    });

    it('um identificador informado pelo chamador sobrepõe o gerado', async () => {
      // Este caso REGISTRA o comportamento real, e não corrige a redação da regra (`D-11`): a
      // promessa diz que a criação "sempre popula o identificador", e o código deixa o dado do
      // chamador vencer. Quem "consertar" a criação verá este caso falhar — e terá de decidir.
      const criado = await rascunho().create({ id: 'id-do-chamador', nome: 'Com id próprio' });

      expect(criado.id).toBe('id-do-chamador');
    });

    it('excluir identificador inexistente resolve com sucesso e não altera o conjunto', async () => {
      const repositorio = rascunho();
      await repositorio.create({ nome: 'Fica' });
      const antes = (await repositorio.list()).map((r) => r.id);

      await expect(repositorio.delete('nao-existe')).resolves.toEqual({ success: true });

      expect((await repositorio.list()).map((r) => r.id)).toEqual(antes);
    });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Prova do achado **F-02** — a metade corrigível no cliente.
 *
 * O QUE SE MEDE AQUI: a credencial de sessão não é **adotada** nem **persistida**. Com
 * `?access_token=` na URL, o valor não entra no estado da aplicação e nada é gravado no
 * armazenamento do navegador; o parâmetro, ainda assim, continua sendo retirado da URL.
 *
 * POR QUE ELA EXISTE: o pacote instalado da plataforma colhe e persiste esse mesmo token
 * por conta própria (`dist/client.js:123`), e não expõe opção para desligar isso. A única
 * razão pela qual cessar a gravação **basta** é a ordem de avaliação dos módulos: este
 * módulo é avaliado antes de o cliente ser construído, de modo que, quando o coletor do
 * SDK procura, a URL já está limpa e o armazenamento também. Se essa ordem mudar, a prova
 * de ordem abaixo acusa.
 *
 * COMO: `app-params` monta o valor no corpo do módulo, então cada caso redefine o registro
 * de módulos e reimporta o arquivo com a URL já no lugar. Nada aqui dubla o módulo sob
 * prova — é ele mesmo que roda.
 */

/** As duas chaves em que uma credencial de sessão pode ser gravada. */
const CREDENCIAIS = ['base44_access_token', 'token'] as const;

/** Reimporta o módulo sob prova, para que o corpo seja reavaliado com a URL do caso. */
async function carregar(): Promise<{ token: string | null }> {
  vi.resetModules();
  const modulo = await import('../app-params');
  return modulo.appParams;
}

function abrirUrl(search: string): void {
  window.history.replaceState({}, '', `/${search}`);
}

describe('app-params — a credencial de sessão', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
  });

  describe('não é adotada nem persistida', () => {
    it('descarta a credencial que chega pela URL e não grava nada', async () => {
      abrirUrl('?access_token=segredo-de-sessao');

      const appParams = await carregar();

      // Não adotada: o estado da aplicação não recebe o valor.
      expect(appParams.token).toBeNull();
      // Não persistida: nenhuma das duas chaves recebe o valor.
      for (const chave of CREDENCIAIS) {
        expect(window.localStorage.getItem(chave)).toBeNull();
      }
    });

    it('retira o parâmetro da barra de endereço, preservando os demais', async () => {
      abrirUrl('?access_token=segredo-de-sessao&app_id=app-de-teste');

      await carregar();

      // A limpeza da URL é preservada (RF-03): a mudança é adotar menos, não limpar menos.
      expect(window.location.search).not.toContain('access_token');
      expect(window.location.search).not.toContain('segredo-de-sessao');
      expect(window.location.search).toContain('app_id=app-de-teste');
    });

    it('não chega a GRAVAR a credencial — nem para apagá-la logo em seguida', async () => {
      abrirUrl('?access_token=segredo-de-sessao');

      // NÃO se espiona o `localStorage`: em jsdom, nem `vi.spyOn(window.localStorage,
      // 'setItem')` nem `vi.spyOn(Storage.prototype, 'setItem')` interceptam coisa alguma —
      // os dois foram medidos, e ambos devolveram zero chamadas. Com o espião inerte, esta
      // prova ficava verde mesmo com a gravação reintroduzida. O que funciona é substituir
      // o armazenamento inteiro ANTES da avaliação do módulo, que é de onde ele o lê.
      const gravadas: string[] = [];
      const real = window.localStorage;
      const instrumentado = {
        getItem: (chave: string) => real.getItem(chave),
        setItem: (chave: string, valor: string) => { gravadas.push(chave); real.setItem(chave, valor); },
        removeItem: (chave: string) => real.removeItem(chave),
        clear: () => real.clear(),
        key: (indice: number) => real.key(indice),
        get length() { return real.length; },
      };
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        writable: true,
        value: instrumentado,
      });

      try {
        await carregar();
      } finally {
        Object.defineProperty(window, 'localStorage', {
          configurable: true,
          writable: true,
          value: real,
        });
      }

      // Este caso existe por causa de uma falsificação que NÃO falhou: reintroduzida a
      // gravação, os casos acima seguiam verdes, porque a limpeza de resíduo apagava o
      // valor no mesmo bloco. Eles medem o estado FINAL; este mede o ATO de gravar, que é
      // o que o RN-02 afirma. Sem ele, "nunca grava" e "grava e apaga" são indistinguíveis.
      const chavesDeCredencial = gravadas.filter((chave) =>
        (CREDENCIAIS as readonly string[]).includes(chave),
      );
      expect(chavesDeCredencial).toEqual([]);
    });
  });

  describe('a ordem de avaliação é o que mantém a URL limpa', () => {
    it('nunca grava um endereço que carregue a credencial', async () => {
      abrirUrl('?access_token=segredo-de-sessao');

      // Mede TODA gravação do endereço, e não só o valor final. A primeira versão deste
      // caso olhava apenas o que sobrou no armazenamento — e passava mesmo com a ordem
      // invertida, porque a gravação suja era sobrescrita pela limpa logo depois. Uma
      // prova que olha o fim não vê o que aconteceu no meio.
      const gravacoes: Array<[string, string]> = [];
      const real = window.localStorage;
      const instrumentado = {
        getItem: (chave: string) => real.getItem(chave),
        setItem: (chave: string, valor: string) => { gravacoes.push([chave, valor]); real.setItem(chave, valor); },
        removeItem: (chave: string) => real.removeItem(chave),
        clear: () => real.clear(),
        key: (indice: number) => real.key(indice),
        get length() { return real.length; },
      };
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        writable: true,
        value: instrumentado,
      });

      try {
        await carregar();
      } finally {
        Object.defineProperty(window, 'localStorage', {
          configurable: true,
          writable: true,
          value: real,
        });
      }

      // `from_url` grava `window.location.href`. Invertida a ordem entre a limpeza do
      // parâmetro e esta captura, o endereço gravado passaria a conter a credencial — e a
      // exposição voltaria por outra chave. É a regressão que este caso existe para pegar.
      const enderecos = gravacoes.filter(([chave]) => chave === 'base44_from_url').map(([, valor]) => valor);
      expect(enderecos.length).toBeGreaterThan(0);
      for (const endereco of enderecos) {
        expect(endereco).not.toContain('access_token');
        expect(endereco).not.toContain('segredo-de-sessao');
      }
    });
  });

  describe('o resíduo de versões anteriores é removido', () => {
    it('apaga a credencial que já estava gravada', async () => {
      abrirUrl('');
      for (const chave of CREDENCIAIS) {
        window.localStorage.setItem(chave, 'credencial-antiga');
      }

      await carregar();

      for (const chave of CREDENCIAIS) {
        expect(window.localStorage.getItem(chave)).toBeNull();
      }
    });

    it('não alcança os dados do modo offline, que vivem no mesmo armazenamento', async () => {
      abrirUrl('');
      window.localStorage.setItem('mock_db_Patient', '[]');
      window.localStorage.setItem('base44_access_token', 'credencial-antiga');

      await carregar();

      // A limpeza é restrita às chaves de credencial (D-06). Ampliá-la apagaria os dados
      // de demonstração do modo offline, que usam as MESMAS `localStorage`.
      expect(window.localStorage.getItem('mock_db_Patient')).toBe('[]');
      expect(window.localStorage.getItem('base44_access_token')).toBeNull();
    });

    it('não alcança os parâmetros de inicialização que continuam válidos', async () => {
      abrirUrl('?app_id=app-de-teste');

      await carregar();

      expect(window.localStorage.getItem('base44_app_id')).toBe('app-de-teste');
    });
  });
});

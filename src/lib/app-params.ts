/**
 * Parâmetros de inicialização da aplicação, lidos de query string, armazenamento
 * local ou variáveis de ambiente.
 *
 * PARIDADE — COM UMA DIVERGÊNCIA DELIBERADA (2026-09-24, feature `015`). A ordem de
 * precedência (URL → padrão → armazenado), a geração das chaves, a limpeza de token via
 * parâmetro e a remoção de parâmetro da URL continuam exatamente como no legado. O que
 * **deixou de valer** é o nível "armazenado" para a **credencial de sessão**: o
 * `access_token` não é mais adotado nem gravado, e o resíduo de versões anteriores é
 * removido a cada carga.
 *
 * POR QUE A PARIDADE FOI ROMPIDA AQUI: receber a credencial pela URL e guardá-la no
 * armazenamento do navegador a deixa legível para qualquer script da página, e é o que o
 * achado **F-02** das duas auditorias de segurança registra (`docs/security-audit/`). A
 * metade que **não** é corrigível neste repositório — o trânsito da credencial na própria
 * URL — vem do login hospedado da plataforma e fica declarada como fora de alcance.
 * Registro completo em `_reversa_forward/015-sessao-sem-token-na-url/legacy-impact.md`.
 */

/** Forma mínima de armazenamento usada — cobre `localStorage` e o `Map` do ambiente Node. */
interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const isNode = typeof window === 'undefined';
// No ambiente Node não há window; o Map mantém o comportamento do legado, que
// declarava `{ localStorage: new Map() }` sem usá-lo no caminho de browser.
const storage: StorageLike = isNode
  ? (new Map<string, string>() as unknown as StorageLike)
  : window.localStorage;

/**
 * Chaves em que uma credencial de sessão pode ter sido gravada.
 *
 * São as duas do SDK instalado: `base44_access_token` é a que o próprio coletor usa, e
 * `token` é o espelho que ele grava para a plataforma (`dist/utils/auth-utils.js:106-121`).
 * A limpeza é restrita a elas de propósito: o modo offline guarda os dados de demonstração
 * no MESMO armazenamento, sob chaves `mock_db_<Entidade>`.
 */
const CREDENCIAIS_DE_SESSAO = ['base44_access_token', 'token'] as const;

/** Remove credencial de sessão gravada por versão anterior. Idempotente. */
const removerCredencialGravada = (): void => {
  for (const chave of CREDENCIAIS_DE_SESSAO) {
    storage.removeItem(chave);
  }
}

/**
 * Converte strings em camelCase para formato snake_case.
 * Usado na geração de chaves de armazenamento para manter consistência.
 */
const toSnakeCase = (str: string): string => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

interface GetAppParamOptions {
  /** Valor padrão se o parâmetro não for encontrado. */
  defaultValue?: string;
  /** Se deve remover o parâmetro da URL após leitura. */
  removeFromUrl?: boolean;
  /**
   * Lê o parâmetro apenas para descartá-lo: não adota o valor e não o persiste.
   *
   * Existe para a credencial de sessão. O parâmetro ainda é retirado da URL — o que muda
   * é que o valor não entra no estado da aplicação nem no armazenamento.
   */
  descartar?: boolean;
}

/**
 * Recupera valor de parâmetro da aplicação a partir de query string, localStorage ou padrão.
 * Prioriza parâmetros de URL, armazena-os em localStorage e volta a padrões se necessário.
 * Pode opcionalmente remover o parâmetro da URL.
 */
const getAppParamValue = (
  paramName: string,
  { defaultValue = undefined, removeFromUrl = false, descartar = false }: GetAppParamOptions = {},
): string | null => {
	if (isNode) {
		return defaultValue ?? null;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	// Descartado: sai daqui sem adotar e sem gravar. A remoção da URL acima já aconteceu.
	if (descartar) {
		return null;
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

/** Configuração da aplicação, montada a partir das fontes acima. */
export interface AppParams {
  appId: string | null;
  token: string | null;
  fromUrl: string | null;
  functionsVersion: string | null;
  appBaseUrl: string | null;
}

/**
 * Recupera todos os parâmetros da aplicação necessários para inicialização.
 * Monta ID da aplicação, token de autenticação e configuração do servidor.
 * Trata limpeza de token se solicitado via parâmetro de URL.
 */
const getAppParams = (): AppParams => {
	if (getAppParamValue("clear_access_token") === 'true') {
		removerCredencialGravada();
	}
	// A credencial de sessão é RETIRADA da URL e DESCARTADA: não entra no estado da
	// aplicação. Esta chamada precisa vir ANTES de `from_url`, que captura
	// `window.location.href` como valor padrão e o grava — invertida a ordem, o endereço
	// gravado passaria a carregar a credencial, e a exposição voltaria por outra chave.
	getAppParamValue("access_token", { removeFromUrl: true, descartar: true });
	// Resíduo de versões anteriores, que gravavam a credencial em duas chaves.
	removerCredencialGravada();
	return {
		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
		// A credencial nunca é adotada: o valor é sempre nulo. A sessão passa a depender da
		// credencial que este cliente NÃO consegue ler — o cookie de sessão do servidor.
		token: null,
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL }),
	}
}

export const appParams = {
	...getAppParams()
}

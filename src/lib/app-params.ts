/**
 * Parâmetros de inicialização da aplicação, lidos de query string, armazenamento
 * local ou variáveis de ambiente.
 *
 * PARIDADE: conversão de linguagem; a ordem de precedência (URL → padrão →
 * armazenado), a geração das chaves, a limpeza de token via parâmetro e a remoção
 * de parâmetro da URL continuam exatamente como no legado.
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
}

/**
 * Recupera valor de parâmetro da aplicação a partir de query string, localStorage ou padrão.
 * Prioriza parâmetros de URL, armazena-os em localStorage e volta a padrões se necessário.
 * Pode opcionalmente remover o parâmetro da URL.
 */
const getAppParamValue = (
  paramName: string,
  { defaultValue = undefined, removeFromUrl = false }: GetAppParamOptions = {},
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
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	return {
		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL }),
	}
}

export const appParams = {
	...getAppParams()
}

const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

/**
 * Converte strings em camelCase para formato snake_case.
 * Usado na geração de chaves de armazenamento para manter consistência.
 *
 * @param {string} str - String a converter.
 * @returns {string} - String em formato snake_case.
 *
 * @example
 * toSnakeCase('appId') // Retorna 'app_id'
 */
const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * Recupera valor de parâmetro da aplicação a partir de query string, localStorage ou padrão.
 * Prioriza parâmetros de URL, armazena-os em localStorage e volta a padrões se necessário.
 * Pode opcionalmente remover o parâmetro da URL.
 *
 * @param {string} paramName - Nome do parâmetro a recuperar.
 * @param {Object} [options] - Objeto com opções.
 * @param {*} [options.defaultValue] - Valor padrão se parâmetro não for encontrado.
 * @param {boolean} [options.removeFromUrl=false] - Se deve remover parâmetro da URL após leitura.
 * @returns {string|null} - Valor do parâmetro ou null se não encontrado.
 *
 * @example
 * const appId = getAppParamValue('app_id', { defaultValue: 'default-app' });
 */
const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
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

/**
 * Recupera todos os parâmetros da aplicação necessários para inicialização.
 * Monta ID da aplicação, token de autenticação e configuração do servidor.
 * Trata limpeza de token se solicitado via parâmetro de URL.
 *
 * @returns {Object} - Objeto com configuração da aplicação.
 * @returns {string} returns.appId - ID da aplicação a partir de ambiente ou URL.
 * @returns {string} returns.token - Token de autenticação do localStorage ou URL.
 * @returns {string} returns.fromUrl - URL original para redirects.
 * @returns {string} returns.functionsVersion - Versão das funções da API.
 * @returns {string} returns.appBaseUrl - URL base do servidor backend.
 *
 * @example
 * const config = getAppParams();
 * // { appId: '...', token: '...', functionsVersion: '1.0', ... }
 */
const getAppParams = () => {\n\tif (getAppParamValue("clear_access_token") === 'true') {\n\t\tstorage.removeItem('base44_access_token');\n\t\tstorage.removeItem('token');\n\t}\n\treturn {
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

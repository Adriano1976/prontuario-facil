import { QueryClient } from '@tanstack/react-query';

/**
 * Instância do QueryClient configurada para React Query.
 * Manipula cache, sincronização e refetch de operações assíncronas.
 * Configurado para desabilitar refetch ao focar na janela e repetir queries falhadas uma vez.
 *
 * PARIDADE: conversão de linguagem; configuração idêntica à anterior.
 */
export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});

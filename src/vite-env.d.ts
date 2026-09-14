/// <reference types="vite/client" />

/**
 * Tipos das variáveis de ambiente do empacotador.
 *
 * POR QUE ESTE ARQUIVO EXISTE: sem ele, `import.meta.env` não existe para o
 * verificador de tipos e a leitura do modo offline não compila. O empacotador já
 * resolvia isso em runtime; o que faltava era a declaração para a verificação.
 *
 * As variáveis listadas são exatamente as usadas pelo código. Acrescentar uma nova
 * variável de ambiente ao projeto exige acrescentá-la aqui também — é o preço de ter
 * a verificação; o ganho é que um nome de variável errado passa a não compilar.
 */
interface ImportMetaEnv {
  /** Ativa o modo offline (armazenamento local em vez do servidor). */
  readonly VITE_OFFLINE?: string;
  /** Identificador da aplicação no BaaS. */
  readonly VITE_BASE44_APP_ID?: string;
  /** Versão das funções do BaaS. */
  readonly VITE_BASE44_FUNCTIONS_VERSION?: string;
  /** Endereço base da aplicação no BaaS. */
  readonly VITE_BASE44_APP_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

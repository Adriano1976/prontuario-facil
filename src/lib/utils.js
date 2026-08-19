import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina múltiplos nomes de classe CSS usando clsx e tailwind-merge.
 * Mescla classes de Tailwind CSS de forma inteligente, tratando conflitos
 * e garantindo que apenas a classe final tenha precedência.
 *
 * @param {...*} inputs - Quantidade variável de nomes de classe, objetos ou arrays.
 * @returns {string} - String de classe mesclada.
 *
 * @example
 * cn('px-2', 'px-4') // Retorna 'px-4' (último valor vence)
 * cn('text-white', { 'text-red-500': isErro }) // Aplica classes condicionalmente
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if the application is running inside an iframe.
 * Useful for detecting if the app is embedded in another website.
 * Returns false if the app is at the top level, true if nested in an iframe.
 *
 * @type {boolean}
 *
 * @example
 * if (isIframe) {
 *   // App is embedded, adjust UI accordingly
 * }
 */
export const isIframe = window.self !== window.top;

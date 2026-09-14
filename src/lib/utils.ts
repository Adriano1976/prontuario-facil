import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina múltiplos nomes de classe CSS usando clsx e tailwind-merge.
 * Mescla classes de Tailwind CSS de forma inteligente, tratando conflitos
 * e garantindo que apenas a classe final tenha precedência.
 *
 * PARIDADE: conversão de linguagem; comportamento idêntico ao anterior.
 *
 * @param inputs - Quantidade variável de nomes de classe, objetos ou arrays.
 * @returns String de classe mesclada.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if the application is running inside an iframe.
 * Useful for detecting if the app is embedded in another website.
 * Returns false if the app is at the top level, true if nested in an iframe.
 */
export const isIframe = window.self !== window.top;

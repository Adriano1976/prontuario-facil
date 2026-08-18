import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Hook que detecta se a largura do viewport é de tamanho móvel.
 * Usa listener de media query para rastrear responsivamente mudanças de tamanho da tela.
 * O breakpoint de celular está definido em 768px (limite típico tablet/desktop).
 *
 * @returns {boolean} - True se largura do viewport é menor que 768px, false caso contrário.
 *
 * @example
 * const isMobile = useIsMobile();
 * if (isMobile) {
 *   return <LayoutMobile />;
 * }
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange);
  }, [])

  return !!isMobile
}

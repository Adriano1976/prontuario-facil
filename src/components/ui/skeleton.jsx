import { cn } from "@/lib/utils"

/**
 * Componente skeleton para exibir placeholders de carregamento.
 * Mostra efeito de pulso animado enquanto o conteúdo está carregando.
 * Use para melhorar o desempenho percebido e experiência do usuário.
 *
 * @component
 * @param {string} [props.className] - Classes CSS adicionais para tamanho/posicionamento.
 * @returns {JSX.Element} - Elemento skeleton animado com placeholder.
 *
 * @example
 * <div className="grid gap-4">
 *   <Skeleton className="h-12 w-12 rounded-full" />
 *   <Skeleton className="h-4 w-full" />
 * </div>
 */
function Skeleton({
  className,
  ...props
}) {
  return (
    (<div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props} />)
  );
}

export { Skeleton }

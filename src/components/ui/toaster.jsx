import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

/**
 * Componente Toaster que renderiza todas as notificações toast ativas.
 * Deve ser colocado na raiz da app para exibir toasts globalmente.
 * Gerencia automaticamente o ciclo de vida e renderização de toasts.
 *
 * @component
 * @returns {JSX.Element} - Provedor de toast com viewport e toasts ativos.
 *
 * @example
 * // Em App.jsx raiz
 * return (
 *   <div>
 *     <SuaApp />
 *     <Toaster />
 *   </div>
 * );
 */
export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
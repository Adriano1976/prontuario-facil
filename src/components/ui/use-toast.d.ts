/**
 * Tipos do sistema de notificações.
 *
 * Sombreia `use-toast.jsx` para o verificador: o JavaScript continua sendo o que
 * executa, e este arquivo descreve as props e o retorno. Mesmo mecanismo dos demais
 * componentes de interface.
 *
 * Aqui a tipagem é real, não permissiva: um título com nome errado não compila.
 */

/** Propriedades aceitas por uma notificação. */
export interface ToastProps {
  title?: string;
  description?: string;
  /** Estilo visual: o padrão ou a variante destrutiva. */
  variant?: 'default' | 'destructive';
  /** Duração em milissegundos. */
  duration?: number;
}

/** Controle de uma notificação já criada. */
export interface ToastHandle {
  id: string;
  dismiss: () => void;
  update: (props: ToastProps) => void;
}

/** Notificação ativa, como aparece na lista do estado. */
export interface ActiveToast extends ToastProps {
  id: string;
  open?: boolean;
}

/** Cria e exibe uma notificação. */
export declare function toast(props: ToastProps): ToastHandle;

/** Acesso às notificações ativas e às operações sobre elas. */
export declare function useToast(): {
  toasts: ActiveToast[];
  toast: (props: ToastProps) => ToastHandle;
  dismiss: (toastId?: string) => void;
};

export declare const reducer: (state: unknown, action: unknown) => unknown;
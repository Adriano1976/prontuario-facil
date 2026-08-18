// Inspired by react-hot-toast library
import { useState, useEffect } from "react";

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000000;

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;

/**
 * Gera IDs numéricos únicos para notificações de toast.
 * Usa um contador incremental com módulo para evitar overflow.
 *
 * @returns {string} - Um ID numérico único como string.
 *
 * @example
 * const id = genId(); // Retorna '1', depois '2', etc.
 */
function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

const toastTimeouts = new Map();

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

const _clearFromRemoveQueue = (toastId) => {
  const timeout = toastTimeouts.get(toastId);
  if (timeout) {
    clearTimeout(timeout);
    toastTimeouts.delete(toastId);
  }
};

/**
 * Função redutora para gerenciar estado de notificação de toast.
 * Manipula adicionar, atualizar, descartar e remover notificações de toast.
 *
 * @param {Object} state - Estado atual de toast contendo array de toasts.
 * @param {Object} action - Objeto de ação com tipo e payload.
 * @param {string} action.type - Tipo de ação (ADD_TOAST, UPDATE_TOAST, DISMISS_TOAST, REMOVE_TOAST).
 * @param {Object} [action.toast] - Objeto de dados de toast (para ADD_TOAST, UPDATE_TOAST).
 * @param {string} [action.toastId] - ID do toast a modificar (para DISMISS_TOAST, REMOVE_TOAST).
 * @returns {Object} - Estado atualizado com array de toasts modificado.
 *
 * @example
 * const newState = reducer(state, {
 *   type: 'ADD_TOAST',
 *   toast: { id: '1', message: 'Sucesso!', open: true }
 * });
 */
export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners = [];

let memoryState = { toasts: [] };

/**
 * Despacha ações para atualizar estado de toast e notificar todos os ouvintes.
 * Usado internamente pelo sistema de gerenciamento de toast para coordenar mudanças de estado.
 *
 * @param {Object} action - Objeto de ação a despachar.
 * @param {string} action.type - Tipo de ação (ADD_TOAST, UPDATE_TOAST, DISMISS_TOAST, REMOVE_TOAST).
 * @returns {void}
 *
 * @example
 * dispatch({
 *   type: 'ADD_TOAST',
 *   toast: { id: '1', message: 'Olá!' }
 * });
 */
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

/**
 * Cria e exibe uma nova notificação de toast.
 * Retorna um objeto com métodos para atualizar ou descartar o toast.
 *
 * @param {Object} props - Propriedades de configuração de toast.
 * @param {string} [props.title] - O título do toast.
 * @param {string} [props.description] - A descrição/mensagem do toast.
 * @param {string} [props.variant] - O estilo de variação (ex: 'padrao', 'destrutivo').
 * @param {number} [props.duration] - Quanto tempo exibir o toast em milissegundos.
 * @returns {Object} - Objeto de controle de toast com id, dismiss e métodos de atualização.
 * @returns {string} returns.id - Identificador único para o toast.
 * @returns {Function} returns.dismiss - Função para descartar o toast.
 * @returns {Function} returns.update - Função para atualizar as propriedades de toast.
 *
 * @example
 * const { id, dismiss, update } = toast({
 *   title: 'Sucesso',
 *   description: 'Operação concluída!',
 *   duration: 3000
 * });
 */
function toast({ ...props }) {
  const id = genId();

  const update = (props) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    });

  const dismiss = () =>
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

/**
 * Hook para acessar e gerenciar notificações de toast.
 * Retorna o estado atual de toast e pode ser usado múltiplas vezes em componentes.
 * Inscreve/desinscreve automaticamente de mudanças de estado de toast.
 *
 * @returns {Object} - O estado atual de toast com array de toasts ativos.
 * @returns {Array} returns.toasts - Array de objetos de notificação de toast ativos.
 *
 * @example
 * const { toasts } = useToast();
 * return (
 *   <div>
 *     {toasts.map((t) => (
 *       <Toast key={t.id} {...t} />
 *     ))}
 *   </div>
 * );
 */
function useToast() {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
}

export { useToast, toast }; 

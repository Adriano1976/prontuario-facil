/**
 * Massa de prova compartilhada do módulo de Logs de acesso.
 *
 * SOBRE O DIA DE PROVA — `DIA_DE_PROVA` é o dia congelado das verificações de recorte de
 * data, e os derivadores abaixo partem dele. O congelamento acontece dentro de cada
 * verificação (decisão D-08 do roadmap), e não neste arquivo.
 *
 * ⚠️ ARMADILHA EVITADA — `new Date('2026-09-22')` é interpretado em **UTC**, enquanto
 * `getDate()` e `toDateString()` são **locais**. Num fuso a oeste de Greenwich a string
 * devolve o dia anterior, e a prova mediria outro dia sem avisar. Por isso as datas aqui são
 * construídas com o construtor local, e nunca a partir de string de data. As features 003,
 * 004 e 005 registraram a mesma armadilha nas massas respectivas.
 *
 * SOBRE O CONJUNTO DOS INDICADORES — ele tem **uma** ação de cada uma das doze do enum, e
 * foi desenhado para separar as categorias da heurística da tela. Um conjunto com apenas
 * registros de um tipo deixaria o indicador passar por acerto.
 */

import type { AccessLog, AccessLogAction } from '@/types';

/** O e-mail do usuário de sessão, igual ao que os demais dublês do projeto devolvem. */
export const EMAIL_DA_SESSAO = 'demo@medrecord.local';

/** Dia de prova — 22 de setembro de 2026. */
export const DIA_DE_PROVA = new Date(2026, 8, 22);

/** As **doze** ações auditáveis, na ordem do enum de `AccessLog.jsonc`. */
export const ACOES: readonly AccessLogAction[] = [
  'login',
  'logout',
  'view_patient',
  'edit_patient',
  'create_patient',
  'view_consultation',
  'create_consultation',
  'edit_consultation',
  'create_prescription',
  'upload_exam',
  'delete_record',
  'export_data',
];

/** Cópia do dia com a hora local informada. */
export function horaLocal(dia: Date, hora: number, minuto = 0): Date {
  const copia = new Date(dia);
  copia.setHours(hora, minuto, 0, 0);
  return copia;
}

/** Meia-noite local do dia de hoje. */
export function hoje(): Date {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

/** Meia-noite local de N dias atrás. Aceita valor negativo para o futuro. */
export function diasAtras(dias: number): Date {
  const alvo = hoje();
  alvo.setDate(alvo.getDate() - dias);
  return alvo;
}

/** Meia-noite local de N dias à frente. */
export function diasAFrente(dias: number): Date {
  return diasAtras(-dias);
}

/**
 * Usuário de sessão **sem** papel de administrador.
 *
 * A ausência de `role` é deliberada e é o ponto da prova de `RF-10`: a tela de auditoria tem
 * leitura admin-only na RLS, e a navegação não verifica papel nenhum. O par com
 * `USUARIO_ADMIN` existe para que o contraste seja explícito.
 */
export interface UsuarioDeProva {
  id: string;
  email: string;
  full_name: string;
  role?: string;
}

export const USUARIO_DA_SESSAO: UsuarioDeProva = {
  id: 'demo-user-001',
  email: EMAIL_DA_SESSAO,
  full_name: 'Dra. Ana Souza',
};

/** O mesmo usuário, agora com papel de administrador. */
export const USUARIO_ADMIN: UsuarioDeProva = {
  ...USUARIO_DA_SESSAO,
  role: 'admin',
};

/**
 * Registro de auditoria com data coerente e os campos que o logger preenche.
 *
 * A data padrão é às 10:00 do dia de prova. Quem precisa de outro dia usa `registroEm` com
 * `horaLocal`, e não uma string de data.
 */
export function registro(alteracoes: Partial<AccessLog> = {}): AccessLog {
  return {
    id: 'log-1',
    created_date: horaLocal(DIA_DE_PROVA, 10, 0).toISOString(),
    user_email: EMAIL_DA_SESSAO,
    action: 'view_patient',
    entity_type: 'Patient',
    entity_id: 'paciente-1',
    patient_name: 'Ana Souza',
    ip_address: 'client-side',
    user_agent: 'agente-de-prova',
    details: 'Acesso de prova',
    ...alteracoes,
  };
}

/**
 * Registro com a data **exatamente** como recebida, e a ação indicada.
 *
 * A hora não é ajustada aqui de propósito: os recortes de data da tela comparam o registro
 * contra o dia congelado, e forçar um horário dentro do auxiliar esconderia a diferença que
 * a prova precisa medir. Quem quer 10:00 passa `horaLocal(dia, 10, 0)`.
 */
export function registroEm(
  dia: Date,
  acao: AccessLogAction,
  alteracoes: Partial<AccessLog> = {},
): AccessLog {
  return registro({ created_date: dia.toISOString(), action: acao, ...alteracoes });
}

/**
 * Registro com data à frente do dia congelado.
 *
 * Existe para provar que os recortes de "última semana" e "último mês" comparam apenas o
 * **piso**, sem teto superior (`RF-19`, `RN-10`).
 */
export function registroFuturo(alteracoes: Partial<AccessLog> = {}): AccessLog {
  return registroEm(horaLocal(diasAFrente(3), 10, 0), 'login', {
    id: 'log-futuro',
    details: 'Evento com data à frente',
    ...alteracoes,
  });
}

/**
 * Registro cujo campo de detalhes é **nulo**.
 *
 * É a forma que o seed offline produz (`AccessLog.ts:39` registra que ele grava `null` ali).
 * A tabela não pode quebrar com isso.
 */
export function semDetalhes(alteracoes: Partial<AccessLog> = {}): AccessLog {
  return registro({ id: 'log-sem-detalhes', details: null, ...alteracoes });
}

/**
 * Um registro por ação do enum — doze no total.
 *
 * O desenho separa as categorias da heurística da tela:
 * - "Visualizações" conta ação que contém `view` → **2** (`view_patient`, `view_consultation`);
 * - "Edições" conta `edit` **ou** `create` → **5**, e `create_prescription` entra aqui;
 * - "Exclusões" conta `delete` → **1**;
 * - `login`, `logout`, `upload_exam` e `export_data` não entram em categoria nenhuma → **4**.
 *
 * A soma dos três indicadores é **8**, e o total é **12**: a diferença de quatro é o que a
 * prova de `RF-16` afirma.
 */
export const CONJUNTO_DE_INDICADORES: readonly AccessLog[] = ACOES.map((acao, indice) =>
  registro({
    id: `log-${String(indice + 1).padStart(2, '0')}`,
    action: acao,
    details: `Evento ${acao}`,
  }),
);

/** Os números que a heurística da tela produz para o conjunto acima. */
export const INDICADORES_ESPERADOS = {
  total: 12,
  visualizacoes: 2,
  edicoes: 5,
  exclusoes: 1,
  somaDosIndicadores: 8,
} as const;

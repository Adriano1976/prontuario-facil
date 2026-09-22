/**
 * Massa de prova dos KPIs do Dashboard.
 *
 * SOBRE AS DATAS — a prova NÃO congela o relógio. As datas são **derivadas** do dia em que a
 * suíte roda, com deslocamento explícito em dias, e construídas com o construtor local.
 *
 * ⚠️ ARMADILHA EVITADA — `new Date('2026-09-22')` é interpretado em **UTC**, enquanto os
 * leitores de data do Dashboard (`toDateString()`, comparação de instante) são **locais**. Num
 * fuso a oeste de Greenwich isso devolve o dia anterior, e a verificação passaria a medir outro
 * dia sem avisar. Foi medido na feature 003 e vale igual aqui.
 *
 * ⚠️ ARMADILHA EVITADA — folga em DIAS, nunca em minutos. Um agendamento "futuro" a poucos
 * minutos do presente vira passado no meio da execução, e a verificação fica instável.
 *
 * SOBRE AS CONTAGENS — cada entidade tem um marcador que **não colide** com o das outras:
 * pacientes ativos valem 3, agendamentos de hoje valem 2, prescrições valem 4 e consultas de
 * hoje valem 7. A razão é o risco `R-04`: se o dublê de consulta entregasse a massa de uma
 * chave a outro cartão, uma coincidência numérica faria a verificação passar por acidente.
 * Com marcadores distintos, a troca de chave produz um número errado **visível**.
 */

import type { Appointment, Consultation, Patient, Prescription } from '@/types';

/** Marcadores das massas. Distintos entre si de propósito — ver o cabeçalho. */
export const PACIENTES_ATIVOS = 3;
export const PACIENTES_INATIVOS = 2;
export const AGENDAMENTOS_HOJE = 2;
export const AGENDAMENTOS_FUTUROS = 6;
export const PRESCRICOES = 4;
export const CONSULTAS_HOJE = 7;

/** Carimbo de criação das entidades de massa. Fixo: não participa de nenhum critério. */
const CRIADO_EM = '2026-01-01T00:00:00.000Z';

/** Cópia do dia com a hora local informada. */
export function horaLocal(dia: Date, hora: number, minuto = 0): Date {
  const copia = new Date(dia);
  copia.setHours(hora, minuto, 0, 0);
  return copia;
}

/** Meia-noite local de hoje — a mesma base que o Dashboard usa para "hoje". */
export function hoje(): Date {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

/** Meia-noite local de hoje mais `dias`. */
export function diasAFrente(dias: number): Date {
  const dia = hoje();
  dia.setDate(dia.getDate() + dias);
  return dia;
}

/** Meia-noite local de hoje menos `dias`. */
export function diasAtras(dias: number): Date {
  const dia = hoje();
  dia.setDate(dia.getDate() - dias);
  return dia;
}

/** Paciente ativo, salvo indicação contrária. */
export function paciente(alteracoes: Partial<Patient> = {}): Patient {
  const base: Patient = {
    id: 'paciente-1',
    created_date: CRIADO_EM,
    full_name: 'Ana Souza',
    cpf: '111.111.111-11',
    birth_date: '1990-01-01',
    phone: '(11) 99999-1111',
    email: 'ana@exemplo.test',
    status: 'ativo',
    lgpd_consent: false,
  };
  // A união do consentimento LGPD alarga `lgpd_consent` para boolean quando o tipo de origem é
  // `Partial<Patient>`, e o discriminante se perde no espalhamento. O retorno explícito devolve o
  // tipo declarado — o objeto é montado a partir de um `Patient` válido, então a asserção não
  // esconde divergência nenhuma.
  return { ...base, ...alteracoes } as Patient;
}

/** Agendamento de hoje às 10:00, salvo indicação contrária. */
export function agendamento(alteracoes: Partial<Appointment> = {}): Appointment {
  return {
    id: 'agendamento-1',
    created_date: CRIADO_EM,
    patient_id: 'paciente-1',
    doctor_id: 'medico-1',
    date: horaLocal(hoje(), 10, 0).toISOString(),
    duration: 30,
    type: 'primeira_consulta',
    status: 'agendado',
    ...alteracoes,
  };
}

/** Consulta de hoje às 09:00, salvo indicação contrária. */
export function consulta(alteracoes: Partial<Consultation> = {}): Consultation {
  return {
    id: 'consulta-1',
    created_date: CRIADO_EM,
    patient_id: 'paciente-1',
    date: horaLocal(hoje(), 9, 0).toISOString(),
    status: 'concluida',
    ...alteracoes,
  };
}

/** Prescrição emitida, salvo indicação contrária. */
export function prescricao(alteracoes: Partial<Prescription> = {}): Prescription {
  return {
    id: 'prescricao-1',
    created_date: CRIADO_EM,
    patient_id: 'paciente-1',
    type: 'receita_simples',
    content: 'Conteúdo de prova.',
    ...alteracoes,
  };
}

// --- Massas ------------------------------------------------------------------------------

/**
 * Pacientes mistos: 3 ativos e 2 inativos.
 *
 * O KPI "Pacientes Ativos" tem de valer exatamente `PACIENTES_ATIVOS`. Uma massa só de ativos
 * não distinguiria "conta os ativos" de "conta todo mundo".
 */
export function pacientesMistos(): Patient[] {
  const ativos = Array.from({ length: PACIENTES_ATIVOS }, (_, indice) =>
    paciente({ id: `paciente-ativo-${indice + 1}`, full_name: `Ativo ${indice + 1}` }),
  );
  const inativos = Array.from({ length: PACIENTES_INATIVOS }, (_, indice) =>
    paciente({
      id: `paciente-inativo-${indice + 1}`,
      full_name: `Inativo ${indice + 1}`,
      status: 'inativo',
    }),
  );
  return [...ativos, ...inativos];
}

/**
 * Agendamentos de hoje, com as bordas do critério.
 *
 * Dois válidos (`agendado`), e três que **não** podem contar: um `cancelado` de hoje, um de
 * ontem e um de amanhã — todos não cancelados. O esperado é `AGENDAMENTOS_HOJE`.
 */
export function agendamentosDeHoje(): Appointment[] {
  return [
    agendamento({ id: 'hoje-1', patient_id: 'paciente-1' }),
    agendamento({ id: 'hoje-2', patient_id: 'paciente-1', type: 'retorno' }),
    agendamento({ id: 'hoje-cancelado', patient_id: 'paciente-1', status: 'cancelado' }),
    agendamento({ id: 'ontem', patient_id: 'paciente-1', date: horaLocal(diasAtras(1), 10, 0).toISOString() }),
    agendamento({ id: 'amanha', patient_id: 'paciente-1', date: horaLocal(diasAFrente(1), 10, 0).toISOString() }),
  ];
}

/**
 * Cenário completo de "Próximos Agendamentos".
 *
 * Os agendamentos e os pacientes andam **juntos** porque a lista exibe o NOME do paciente:
 * provar que um agendamento não aparece exige que ele teria um nome reconhecível se aparecesse.
 *
 * Composição: `AGENDAMENTOS_FUTUROS` válidos, um futuro **cancelado** e um **passado** — os dois
 * últimos com nome próprio, para que a ausência deles seja observável.
 */
export function cenarioDeProximos(): { agendamentos: Appointment[]; pacientes: Patient[] } {
  const futuros = Array.from({ length: AGENDAMENTOS_FUTUROS }, (_, indice) => ({
    sufixo: `futuro-${indice + 1}`,
    nome: `Futuro ${indice + 1}`,
    dia: diasAFrente(indice + 1),
  }));

  const agendamentos = futuros.map(({ sufixo, nome, dia }) =>
    agendamento({
      id: `agendamento-${sufixo}`,
      patient_id: `paciente-${sufixo}`,
      date: horaLocal(dia, 10, 0).toISOString(),
    }),
  );

  agendamentos.push(
    agendamento({
      id: 'agendamento-cancelado-futuro',
      patient_id: 'paciente-cancelado-futuro',
      date: horaLocal(diasAFrente(AGENDAMENTOS_FUTUROS + 1), 10, 0).toISOString(),
      status: 'cancelado',
    }),
    agendamento({
      id: 'agendamento-passado',
      patient_id: 'paciente-passado',
      date: horaLocal(diasAtras(2), 10, 0).toISOString(),
      status: 'concluido',
    }),
  );

  const pacientes = [
    ...futuros.map(({ sufixo, nome }) =>
      paciente({ id: `paciente-${sufixo}`, full_name: nome }),
    ),
    paciente({ id: 'paciente-cancelado-futuro', full_name: 'Cancelado Futuro' }),
    paciente({ id: 'paciente-passado', full_name: 'Passado' }),
  ];

  return { agendamentos, pacientes };
}

/**
 * Consultas de hoje, uma delas cancelada.
 *
 * Esta massa existe para sustentar o achado de `PT-008.3`, e não uma verificação de valor: o
 * Dashboard lê as consultas e **descarta** os dois agregados que calcula com elas. A massa com
 * `CONSULTAS_HOJE` registros torna o descarte observável — nenhum cartão pode exibir esse número.
 */
export function consultasDeHoje(): Consultation[] {
  return Array.from({ length: CONSULTAS_HOJE }, (_, indice) =>
    consulta({
      id: `consulta-${indice + 1}`,
      status: indice === 0 ? 'cancelada' : 'concluida',
      date: horaLocal(hoje(), 9 + indice, 0).toISOString(),
    }),
  );
}

/** Prescrições emitidas: o KPI "Documentos Emitidos" tem de valer `PRESCRICOES`. */
export function prescricoesEmitidas(): Prescription[] {
  return Array.from({ length: PRESCRICOES }, (_, indice) =>
    prescricao({ id: `prescricao-${indice + 1}` }),
  );
}

/**
 * Massa de prova compartilhada do módulo de Agendamentos.
 *
 * SOBRE AS DATAS — a prova NÃO congela o relógio. As datas são **derivadas** do dia em
 * que a suíte roda: a próxima segunda-feira e o próximo sábado. Isso mantém a verificação
 * estável em qualquer data de execução sem recorrer a temporizadores falsos, que
 * conflitam com as esperas assíncronas das interações de interface.
 *
 * ⚠️ ARMADILHA EVITADA — `new Date('2026-10-05')` é interpretado em **UTC**, e o
 * componente lê o dia da semana com `getDay()`, que é **local**. Num fuso a oeste de
 * Greenwich isso devolve o dia anterior, e a prova passaria a medir outro dia sem avisar.
 * Por isso as datas aqui são construídas com o construtor local (`new Date(ano, mês, dia)`)
 * e nunca a partir de string de data.
 */

import type { Appointment, Doctor, Patient } from '@/types';

/** Duração padrão do módulo, em minutos. */
export const DURACAO_PADRAO = 30;

/**
 * A próxima ocorrência de um dia da semana, sempre no futuro.
 *
 * `|| 7` garante que o resultado nunca seja hoje: um agendamento datado de hoje cairia
 * fora do filtro de próximos agendamentos, que compara o instante completo.
 */
export function proximoDiaDaSemana(diaSemana: number): Date {
  const hoje = new Date();
  const alvo = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  alvo.setDate(alvo.getDate() + ((diaSemana - alvo.getDay() + 7) % 7 || 7));
  return alvo;
}

/** Próxima segunda-feira (`getDay() === 1`) — dia de trabalho nas jornadas padrão. */
export const PROXIMA_SEGUNDA = proximoDiaDaSemana(1);

/** Próximo sábado (`getDay() === 6`) — fora das jornadas de segunda a sexta. */
export const PROXIMO_SABADO = proximoDiaDaSemana(6);

/** Cópia do dia com a hora local informada. */
export function horaLocal(dia: Date, hora: number, minuto = 0): Date {
  const copia = new Date(dia);
  copia.setHours(hora, minuto, 0, 0);
  return copia;
}

/** Médico com jornada de segunda a sexta, das 08:00 às 18:00, e duração de 30 minutos. */
export function medico(alteracoes: Partial<Doctor> = {}): Doctor {
  return {
    id: 'medico-1',
    created_date: '2026-01-01T00:00:00.000Z',
    full_name: 'Dra. Helena Prado',
    specialty: 'Clínica Geral',
    crm: 'CRM-000000',
    working_days: [1, 2, 3, 4, 5],
    working_hours: { start: '08:00', end: '18:00' },
    appointment_duration: DURACAO_PADRAO,
    is_active: true,
    ...alteracoes,
  };
}

/** Agendamento existente na próxima segunda-feira às 10:00, salvo indicação contrária. */
export function agendamento(alteracoes: Partial<Appointment> = {}): Appointment {
  return {
    id: 'agendamento-1',
    created_date: '2026-01-01T00:00:00.000Z',
    patient_id: 'paciente-1',
    doctor_id: 'medico-1',
    date: horaLocal(PROXIMA_SEGUNDA, 10, 0).toISOString(),
    duration: DURACAO_PADRAO,
    type: 'primeira_consulta',
    status: 'agendado',
    ...alteracoes,
  };
}

/** Paciente ativo e com e-mail, salvo indicação contrária. */
export function paciente(alteracoes: Partial<Patient> = {}): Patient {
  const base: Patient = {
    id: 'paciente-1',
    created_date: '2026-01-01T00:00:00.000Z',
    full_name: 'Ana Souza',
    cpf: '111.111.111-11',
    birth_date: '1990-01-01',
    phone: '(11) 99999-1111',
    email: 'ana@exemplo.test',
    status: 'ativo',
    lgpd_consent: false,
  };
  // A união do consentimento LGPD alarga `lgpd_consent` para boolean quando o tipo de
  // origem é `Partial<Patient>`, e o discriminante se perde no espalhamento. O retorno
  // explícito devolve o tipo declarado — o objeto é montado a partir de um `Patient`
  // válido, então a asserção não esconde divergência nenhuma.
  return { ...base, ...alteracoes } as Patient;
}

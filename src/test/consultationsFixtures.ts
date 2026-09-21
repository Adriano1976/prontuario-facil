/**
 * Massa de prova compartilhada do módulo de Consultas.
 *
 * SOBRE AS DATAS — a prova NÃO congela o relógio aqui. As datas são **derivadas** do dia
 * em que a suíte roda, a partir dos auxiliares abaixo. O congelamento acontece dentro de
 * cada verificação que decide pelo **valor** de hoje (decisão D-04 do roadmap), e não
 * neste arquivo: assim a massa serve tanto às verificações de recorte de data quanto às
 * que só precisam de uma consulta com data coerente.
 *
 * ⚠️ ARMADILHA EVITADA — `new Date('2026-10-05')` é interpretado em **UTC**, enquanto
 * `toDateString()`, `getMonth()` e `getDate()` são **locais**. Num fuso a oeste de
 * Greenwich a string devolve o dia anterior, e a prova passaria a medir outro dia sem
 * avisar. Por isso as datas aqui são construídas com o construtor local
 * (`new Date(ano, mês, dia)`) e nunca a partir de string de data. A feature 003 registrou
 * a mesma armadilha em `src/test/appointmentsFixtures.ts`.
 *
 * SOBRE A SITUAÇÃO — `consulta()` nasce `agendada`, que é o **default documentado do
 * schema**, e cada verificação sobrescreve o que precisa. A escolha é deliberada: o
 * default do formulário é `em_andamento`, e usar o valor do formulário como base
 * esconderia justamente a divergência que a feature precisa provar.
 */

import type { Consultation, ConsultationStatus, Patient } from '@/types';

/** As quatro situações do enum, na ordem do schema. */
export const SITUACOES: readonly ConsultationStatus[] = [
  'agendada',
  'em_andamento',
  'concluida',
  'cancelada',
];

/** O enum e o rótulo de cada situação, como a tela os apresenta. */
export const ROTULO_DA_SITUACAO: Record<ConsultationStatus, string> = {
  agendada: 'Agendada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

/** Meia-noite local do dia de hoje. */
export function hoje(): Date {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

/** Cópia do dia com a hora local informada. */
export function horaLocal(dia: Date, hora: number, minuto = 0): Date {
  const copia = new Date(dia);
  copia.setHours(hora, minuto, 0, 0);
  return copia;
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

/**
 * Consulta com data coerente e situação `agendada` — o default do **schema**.
 *
 * A data padrão é hoje às 10:00. Quem precisa de outro dia usa `diasAtras`/`diasAFrente`
 * com `horaLocal`, e não uma string de data.
 */
export function consulta(alteracoes: Partial<Consultation> = {}): Consultation {
  return {
    id: 'consulta-1',
    created_date: '2026-01-01T00:00:00.000Z',
    patient_id: 'paciente-1',
    date: horaLocal(hoje(), 10, 0).toISOString(),
    chief_complaint: 'Cefaleia há três dias',
    status: 'agendada',
    ...alteracoes,
  };
}

/**
 * Consulta cujo campo de situação **não existe**.
 *
 * É o caso que a listagem e o detalhe precisam tolerar sem quebrar, e o que faz o
 * formulário de edição cair no fallback do cliente. O campo é removido de fato — e não
 * definido como `undefined` — para que o objeto se pareça com um registro antigo que
 * nunca recebeu situação.
 */
export function consultaSemSituacao(alteracoes: Partial<Consultation> = {}): Consultation {
  const base = { ...consulta() } as Consultation & { status?: ConsultationStatus };
  delete base.status;
  return { ...base, ...alteracoes } as Consultation;
}

/**
 * Consulta com a data **exatamente** como recebida, e a situação indicada.
 *
 * A hora não é ajustada aqui de propósito: os recortes de tempo do módulo se separam por
 * hora do dia (o de "próximas" compara o instante completo), então forçar um horário
 * dentro deste auxiliar esconderia justamente a diferença que a prova precisa medir.
 * Quem quer 10:00 passa `horaLocal(dia, 10, 0)`.
 */
export function consultaEm(
  dia: Date,
  situacao: ConsultationStatus | undefined,
  alteracoes: Partial<Consultation> = {},
): Consultation {
  const base = consulta({
    date: dia.toISOString(),
    ...alteracoes,
  });
  if (situacao === undefined) {
    const semSituacao = { ...base } as Consultation & { status?: ConsultationStatus };
    delete semSituacao.status;
    return semSituacao as Consultation;
  }
  return { ...base, status: situacao };
}

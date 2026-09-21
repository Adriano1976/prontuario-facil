/**
 * Massa de prova compartilhada da emissão de documento com modelo.
 *
 * SOBRE O DIA DE PROVA — `{DATA}` e `{DATA_EXTENSO}` são resolvidas por
 * `new Date().toLocaleDateString('pt-BR')` dentro do editor. As verificações que afirmam
 * essas strings **congelam o `Date`** (decisão D-04 do roadmap) e usam `DIA_DE_PROVA` como
 * dia. As constantes `DATA_CURTA` e `DATA_POR_EXTENSO` são escritas por extenso de
 * propósito: se o ambiente formatar diferente, a verificação falha na hora, com a string
 * errada à vista, em vez de virar intermitente.
 *
 * ⚠️ ARMADILHA EVITADA — `new Date('2026-09-21')` é interpretado em **UTC**, enquanto
 * `getDate()` e `getMonth()` são **locais**. Num fuso a oeste de Greenwich a string devolve
 * o dia anterior, e a prova mediria outro dia sem avisar. Por isso `DIA_DE_PROVA` usa o
 * construtor local. As features 003 e 004 registraram a mesma armadilha em
 * `src/test/appointmentsFixtures.ts` e `src/test/consultationsFixtures.ts`.
 *
 * ⚠️ SOBRE O PACIENTE SEM CPF — o tipo `Patient` declara `cpf` como **obrigatório**, e o
 * schema também. O auxiliar remove o campo de fato para representar um registro legado que
 * nunca recebeu CPF, e devolve o tipo declarado porque o objeto é montado a partir de um
 * `Patient` válido. A asserção não esconde divergência nenhuma: o que se mede é o que o
 * editor faz com a ausência.
 */

import type { PrescriptionType, Patient, Template } from '@/types';

/** Dia de prova — 21 de setembro de 2026, um dia de semana. */
export const DIA_DE_PROVA = new Date(2026, 8, 21);

/** O que `{DATA}` deve virar com o relógio congelado no dia de prova. */
export const DATA_CURTA = '21/09/2026';

/** O que `{DATA_EXTENSO}` deve virar com o relógio congelado no dia de prova. */
export const DATA_POR_EXTENSO = '21 de setembro de 2026';

/** Nome e CPF que as variáveis do modelo devem resolver. */
export const NOME_DO_PACIENTE = 'Ana Souza';
export const CPF_DO_PACIENTE = '111.111.111-11';

/** Cópia do dia com a hora local informada. */
export function horaLocal(dia: Date, hora: number, minuto = 0): Date {
  const copia = new Date(dia);
  copia.setHours(hora, minuto, 0, 0);
  return copia;
}

/**
 * Os **seis** tipos de documento do enum de `Prescription` — sem `anamnese`, que é
 * exclusivo de `Template` e não gera documento.
 *
 * A lista existe para que a verificação do seletor confronte o editor com o conjunto do
 * schema, e não com uma lista escrita à mão que poderia envelhecer em silêncio.
 */
export const TIPOS_DE_DOCUMENTO: readonly PrescriptionType[] = [
  'receita_simples',
  'receita_controlada',
  'atestado',
  'solicitacao_exame',
  'encaminhamento',
  'declaracao',
];

/**
 * Os dois tipos que contêm a palavra "receita" — a condição exata que o editor avalia para
 * exibir a seção de medicamentos.
 */
export const TIPOS_DE_RECEITA: readonly PrescriptionType[] = [
  'receita_simples',
  'receita_controlada',
];

/** Os quatro tipos restantes, que não contêm "receita". */
export const TIPOS_SEM_RECEITA: readonly PrescriptionType[] = [
  'atestado',
  'solicitacao_exame',
  'encaminhamento',
  'declaracao',
];

/** Paciente com nome e CPF, salvo indicação contrária. */
export function paciente(alteracoes: Partial<Patient> = {}): Patient {
  const base: Patient = {
    id: 'paciente-1',
    created_date: '2026-01-01T00:00:00.000Z',
    full_name: NOME_DO_PACIENTE,
    cpf: CPF_DO_PACIENTE,
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
 * Paciente cujo campo `cpf` **não existe**.
 *
 * O campo é removido de fato — e não definido como string vazia — para que o objeto se
 * pareça com um registro que nunca recebeu CPF. É o caso que faz `{PACIENTE_CPF}` resolver
 * para string vazia, em silêncio.
 */
export function pacienteSemCpf(alteracoes: Partial<Patient> = {}): Patient {
  // `Patient.cpf` é obrigatório no tipo, então a interseção com `{ cpf?: string }` não
  // bastaria: `delete` exige que a propriedade seja opcional NO TIPO de origem. O `Omit`
  // devolve a opcionalidade sem afrouxar o restante do registro.
  const base: Omit<Patient, 'cpf'> & { cpf?: string } = { ...paciente() };
  delete base.cpf;
  return { ...base, ...alteracoes } as Patient;
}

/**
 * Modelo de documento ativo e do tipo receita simples, salvo indicação contrária.
 *
 * Os campos `is_default` e `is_active` são preenchidos explicitamente com os defaults do
 * schema (`false` e `true`) para que o objeto não dependa de omissão.
 */
export function modelo(alteracoes: Partial<Template> = {}): Template {
  return {
    id: 'modelo-1',
    created_date: '2026-01-01T00:00:00.000Z',
    name: 'Receita Padrão',
    type: 'receita_simples',
    content: 'Uso contínuo, conforme orientação.',
    is_default: false,
    is_active: true,
    ...alteracoes,
  };
}

/** Modelo de receita, o tipo inicial do editor. */
export const MODELO_RECEITA = modelo({
  id: 'modelo-receita',
  name: 'Receita Padrão',
  type: 'receita_simples',
  content: 'RECEITA: uso contínuo, conforme orientação.',
});

/** Modelo de atestado — tipo que **não** contém "receita". */
export const MODELO_ATESTADO = modelo({
  id: 'modelo-atestado',
  name: 'Atestado Padrão',
  type: 'atestado',
  content: 'ATESTO que o paciente esteve sob meus cuidados.',
});

/** Modelo desativado — o que o filtro de atividade deve manter fora. */
export const MODELO_INATIVO = modelo({
  id: 'modelo-inativo',
  name: 'Receita Antiga',
  type: 'receita_simples',
  content: 'MODELO DESATIVADO.',
  is_active: false,
});

/**
 * Modelo com as quatro variáveis que o editor substitui.
 *
 * As quatro aparecem em linhas separadas justamente para que a resolução de cada uma seja
 * legível no valor do campo. `{DIAS_AFASTAMENTO}` **não** está aqui: ela é o assunto de
 * `MODELO_COM_AFASTAMENTO`, e misturá-las esconderia qual das cinco não é tratada.
 */
export const MODELO_COM_VARIAVEIS = modelo({
  id: 'modelo-variaveis',
  name: 'Receita com Variáveis',
  type: 'receita_simples',
  content: [
    'Paciente: {PACIENTE_NOME}',
    'CPF: {PACIENTE_CPF}',
    'Data: {DATA}',
    'Extenso: {DATA_EXTENSO}',
  ].join('\n'),
});

/**
 * Modelo com `{DIAS_AFASTAMENTO}` — a variável anunciada na administração e **nunca
 * substituída** em nenhum caminho de emissão.
 *
 * O tipo é `atestado` porque é o único em que a UI de administração associa a variável a
 * dias de afastamento, e é o caminho onde a lacuna seria mais visível para o médico.
 */
export const MODELO_COM_AFASTAMENTO = modelo({
  id: 'modelo-afastamento',
  name: 'Atestado com Afastamento',
  type: 'atestado',
  content: 'Afaste-se de suas atividades por {DIAS_AFASTAMENTO} dias.',
});

/** Modelo com marcação HTML — o conteúdo que a substituição **não** escapa (AMB-006). */
export const MODELO_COM_MARCACAO = modelo({
  id: 'modelo-marcacao',
  name: 'Receita Marcada',
  type: 'receita_simples',
  content: '<b>Uso contínuo</b><script>alert(1)</script>',
});

/** A marcação do `MODELO_COM_MARCACAO`, para que a asserção não repita a string solta. */
export const MARCACAO_LITERAL = '<b>Uso contínuo</b><script>alert(1)</script>';

/** A mesma marcação **escapada** — a forma que a verificação precisa provar que NÃO ocorre. */
export const MARCACAO_ESCAPADA = '&lt;b&gt;Uso contínuo&lt;/b&gt;';

/** O marcador da variável que nunca é resolvida, isolado para as asserções. */
export const MARCADOR_DE_AFASTAMENTO = '{DIAS_AFASTAMENTO}';

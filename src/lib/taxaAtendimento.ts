import { isAfter, subMonths } from 'date-fns';
import type { Appointment } from '@/types';

/**
 * Taxa de Atendimento do Dashboard — o indicador que era o literal `"94%"`.
 *
 * O QUE ELE MEDE (`RN-02`): comparecimento sobre **desfecho conhecido**. Numerador são os
 * agendamentos `concluido`; denominador são `concluido + faltou`. `cancelado` fica fora das **duas**
 * contas — quem avisa que não vem não é presença nem falta —, e os estados sem desfecho
 * (`agendado`, `confirmado`, `em_atendimento`) também, senão a taxa cairia enquanto o dia não
 * termina, por razão que não é comportamento de ninguém.
 *
 * DE ONDE LÊ (`RN-04`): `Appointment`, a agenda. `Consultation` não serve — não tem estado de
 * falta. Consequência aceita com os olhos abertos: `Appointment.status` só muda por ação manual
 * (`Appointments.tsx:86`), então o número mede **desfecho registrado**, não comparecimento real.
 *
 * JANELA (`RN-05`): 12 meses, com a borda **estrita** — entra quem é estritamente posterior a
 * `subMonths(agora, 12)`. É a mesma semântica de `ReportsView.tsx:88-91`, que tem de ser aplicada
 * aqui no cliente porque `FilterConditions<T>` (`src/types/common.ts:52`) aceita um valor exato por
 * campo e não expressa intervalo de data.
 *
 * POR QUE ESTE MÓDULO EXISTE (`RN-08`): a decisão humana de 2026-09-09 (`AMB-001`) mandou guardar o
 * valor como símbolo explícito e tipado, e o que ficou no código foi um literal solto na JSX —
 * divergência registrada como `O002`. Função pura exportada é o que torna a fórmula provável sem
 * renderizar a página, e é o que impede o literal de voltar.
 */

/** Meses cobertos pela janela de cálculo (`RN-05`). */
export const JANELA_TAXA_EM_MESES = 12;

/** Rótulo exibido sob o valor quando há base — nomeia a janela (`RN-07`). */
export const ROTULO_JANELA = 'últimos 12 meses';

/**
 * Texto exibido sob o valor quando não há base (`RN-06`).
 *
 * Ele descreve o **denominador**, e não "agendamentos" em geral: uma janela pode ter agendamentos e
 * nenhum desfecho, e nesse caso dizer "sem agendamentos no período" seria falso.
 */
export const TEXTO_SEM_DESFECHO = 'sem agendamentos com desfecho no período';

/** Valor exibido quando a janela não tem nenhum desfecho (`RN-06`). */
export const VALOR_SEM_BASE = '—';

/**
 * Calcula a taxa, em percentual inteiro.
 *
 * Devolve `null` — e não zero — quando não há desfecho na janela. A distinção é o núcleo de
 * `RN-06`: `0%` afirma o fato "ninguém compareceu", que uma base vazia não sustenta.
 *
 * @param agendamentos os agendamentos do escopo da sessão; qualquer status é aceito e filtrado aqui
 * @param agora instante de referência da janela, injetado para que a borda seja provável e exata
 */
export function calcularTaxaAtendimento(
  agendamentos: readonly Appointment[],
  agora: Date,
): number | null {
  const inicioDaJanela = subMonths(agora, JANELA_TAXA_EM_MESES);

  let concluidos = 0;
  let faltas = 0;

  for (const agendamento of agendamentos) {
    const quando = new Date(agendamento.date);
    // Borda estrita: exatamente na marca de 12 meses fica FORA. Data inválida também fica fora,
    // pelo mesmo teste — `isAfter` devolve falso para instante inválido.
    if (!isAfter(quando, inicioDaJanela)) continue;

    if (agendamento.status === 'concluido') concluidos += 1;
    else if (agendamento.status === 'faltou') faltas += 1;
  }

  const desfechos = concluidos + faltas;
  if (desfechos === 0) return null;

  return Math.round((concluidos / desfechos) * 100);
}

/** Valor do cartão: travessão sem base, percentual com base (`RN-03`, `RN-06`). */
export function formatarTaxa(taxa: number | null): string {
  return taxa === null ? VALOR_SEM_BASE : `${taxa}%`;
}

/**
 * Texto sob o valor — a janela quando há base, a explicação quando não há (`RN-06`, `RN-07`).
 *
 * Um único assento para os dois textos: nos dois casos a linha qualifica o número acima dela, e
 * criar um segundo assento só para o estado vazio alargaria a superfície sem ganho.
 */
export function rotuloDoCartao(taxa: number | null): string {
  return taxa === null ? TEXTO_SEM_DESFECHO : ROTULO_JANELA;
}

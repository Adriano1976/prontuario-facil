import { describe, expect, it } from 'vitest';
import { subMonths } from 'date-fns';
import type { Appointment, AppointmentStatus } from '@/types';
import { agendamento } from '@/test/dashboardFixtures';
import {
  JANELA_TAXA_EM_MESES,
  ROTULO_JANELA,
  TEXTO_SEM_DESFECHO,
  VALOR_SEM_BASE,
  calcularTaxaAtendimento,
  formatarTaxa,
  rotuloDoCartao,
} from '../taxaAtendimento';

/**
 * Prova da função pura da Taxa de Atendimento — `RF-01`, `RF-02`, `RF-03`, `RF-07` e as regras
 * `RN-02`, `RN-03`, `RN-05`.
 *
 * O QUE SE MEDE AQUI: a aritmética e as bordas do critério, sem renderizar página. A prova de tela
 * (que o cartão exibe este número, com o subtítulo certo) vive em `DashboardKpis.test.tsx`.
 *
 * ⚠️ O RELÓGIO É INJETADO, e isso é o ponto. `calcularTaxaAtendimento` recebe `agora` como
 * parâmetro (`D-06`), então a borda da janela é **exata** e não depende de quando a suíte roda. Uma
 * função que lesse `new Date()` por dentro obrigaria a massa a ter folga, e a borda de 12 meses
 * deixaria de ser provável.
 *
 * ⚠️ A BORDA É EXCLUSIVA. `RN-05` manda entrar o agendamento com `date` **estritamente posterior** a
 * `subMonths(agora, 12)`, e é o que o precedente do projeto faz (`ReportsView.tsx:88-91`,
 * `isAfter(data, cutoff)`). Um agendamento exatamente na marca de 12 meses fica **fora** — a
 * verificação da borda existe justamente para fixar isso.
 */

/** Instante fixo de referência: 25/09/2026, meio-dia local. */
const AGORA = new Date(2026, 8, 25, 12, 0, 0);

/** Carimbo ISO de um agendamento a `meses` meses atrás de `AGORA`, com deslocamento em dias. */
function emMeses(meses: number, dias = 0): string {
  const instante = subMonths(AGORA, meses);
  instante.setDate(instante.getDate() + dias);
  return instante.toISOString();
}

/** Massa com a contagem pedida por status, toda no mesmo carimbo. */
function massa(contagens: Partial<Record<AppointmentStatus, number>>, date: string): Appointment[] {
  const lista: Appointment[] = [];
  let indice = 0;
  for (const [status, quantos] of Object.entries(contagens)) {
    for (let n = 0; n < (quantos ?? 0); n += 1) {
      indice += 1;
      lista.push(agendamento({ id: `${status}-${indice}`, status: status as AppointmentStatus, date }));
    }
  }
  return lista;
}

describe('calcularTaxaAtendimento — a definição decidida', () => {
  it('mede comparecimento sobre desfecho conhecido: 7 concluídos e 3 faltas valem 70%', () => {
    const agendamentos = massa({ concluido: 7, faltou: 3 }, emMeses(1));
    expect(calcularTaxaAtendimento(agendamentos, AGORA)).toBe(70);
  });

  it('mantém cancelamento fora das duas contas', () => {
    const semCancelados = massa({ concluido: 7, faltou: 3 }, emMeses(1));
    const comCancelados = [...semCancelados, ...massa({ cancelado: 5 }, emMeses(1))].map(
      (item, indice) => ({ ...item, id: `cancelado-${indice}` }),
    );
    expect(calcularTaxaAtendimento(comCancelados, AGORA)).toBe(70);
  });

  it('mantém os estados sem desfecho fora das duas contas', () => {
    // 1 concluído e 1 falta decidem; os oito sem desfecho não podem influenciar nem o numerador
    // nem o denominador — se entrassem no denominador, a taxa seria 10%.
    const agendamentos = massa(
      { concluido: 1, faltou: 1, agendado: 4, confirmado: 3, em_atendimento: 1 },
      emMeses(1),
    );
    expect(calcularTaxaAtendimento(agendamentos, AGORA)).toBe(50);
  });

  it('arredonda para inteiro, como o único outro cálculo percentual do projeto', () => {
    expect(calcularTaxaAtendimento(massa({ concluido: 1, faltou: 2 }, emMeses(1)), AGORA)).toBe(33);
    expect(calcularTaxaAtendimento(massa({ concluido: 2, faltou: 1 }, emMeses(1)), AGORA)).toBe(67);
  });
});

describe('calcularTaxaAtendimento — a janela de 12 meses', () => {
  it('ignora completamente o que está fora da janela, nos dois lados da conta', () => {
    // Só o concluído de dentro conta. Se as faltas antigas entrassem, a taxa seria 25%.
    const agendamentos = [
      ...massa({ concluido: 1 }, emMeses(1)),
      ...massa({ concluido: 5 }, emMeses(13)),
      ...massa({ faltou: 3 }, emMeses(13)),
    ];
    expect(calcularTaxaAtendimento(agendamentos, AGORA)).toBe(100);
  });

  it('exclui o agendamento exatamente na marca de 12 meses (borda estrita)', () => {
    // O `12` é literal de propósito: usar a constante faria a borda andar junto com ela, e a
    // verificação deixaria de provar que a janela é de doze meses.
    const agendamentos = [
      ...massa({ concluido: 1 }, emMeses(1)),
      ...massa({ faltou: 1 }, emMeses(12)),
    ];
    // A falta está exatamente em `subMonths(agora, 12)` e fica fora: sobra 1 ÷ 1.
    expect(calcularTaxaAtendimento(agendamentos, AGORA)).toBe(100);
  });

  it('inclui o agendamento um dia dentro da borda', () => {
    const agendamentos = [
      ...massa({ concluido: 1 }, emMeses(1)),
      ...massa({ faltou: 1 }, emMeses(12, 1)),
    ];
    expect(calcularTaxaAtendimento(agendamentos, AGORA)).toBe(50);
  });
});

describe('calcularTaxaAtendimento — sem base não é zero', () => {
  it('devolve nulo quando não há nenhum desfecho na janela', () => {
    const agendamentos = massa({ agendado: 2, confirmado: 1, cancelado: 1 }, emMeses(1));
    expect(calcularTaxaAtendimento(agendamentos, AGORA)).toBeNull();
  });

  it('devolve nulo para lista vazia', () => {
    expect(calcularTaxaAtendimento([], AGORA)).toBeNull();
  });

  it('devolve nulo quando todos os desfechos estão fora da janela', () => {
    expect(calcularTaxaAtendimento(massa({ concluido: 9, faltou: 1 }, emMeses(13)), AGORA)).toBeNull();
  });

  it('devolve zero — e não nulo — quando há desfecho e nenhum comparecimento', () => {
    expect(calcularTaxaAtendimento(massa({ faltou: 3 }, emMeses(1)), AGORA)).toBe(0);
  });
});

describe('apresentação do cartão', () => {
  it('formata o valor: travessão sem base, percentual com base', () => {
    expect(formatarTaxa(null)).toBe(VALOR_SEM_BASE);
    expect(formatarTaxa(0)).toBe('0%');
    expect(formatarTaxa(70)).toBe('70%');
  });

  it('escolhe o rótulo: o texto sem desfecho quando não há base, a janela quando há', () => {
    expect(rotuloDoCartao(null)).toBe(TEXTO_SEM_DESFECHO);
    expect(rotuloDoCartao(0)).toBe(ROTULO_JANELA);
    expect(rotuloDoCartao(70)).toBe(ROTULO_JANELA);
  });

  it('nomeia a janela como o texto decidido, e não de outro jeito', () => {
    expect(ROTULO_JANELA).toBe('últimos 12 meses');
  });

  it('fixa os literais do estado sem base, e não só os símbolos que os carregam', () => {
    // Sem esta verificação, trocar o VALOR do símbolo não faria nada falhar: as demais provas
    // comparam contra a constante, e uma constante errada passaria em todas elas. Os dois literais
    // abaixo são texto de tela decidido em `RN-06`, não detalhe de implementação.
    expect(VALOR_SEM_BASE).toBe('—');
    expect(TEXTO_SEM_DESFECHO).toBe('sem agendamentos com desfecho no período');
    // E a janela também é decisão (`RN-05`), não parâmetro livre: se ela mudar, isto falha.
    expect(JANELA_TAXA_EM_MESES).toBe(12);
  });
});

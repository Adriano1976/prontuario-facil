import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TimeSlotPicker from '../TimeSlotPicker';
import {
  DURACAO_PADRAO,
  PROXIMA_SEGUNDA,
  PROXIMO_SABADO,
  agendamento,
  horaLocal,
  medico,
} from '@/test/appointmentsFixtures';

/**
 * O componente de seleção de horário é **puro**: recebe médico, data e agendamentos por
 * prop, não consulta dados e não usa roteador. Por isso este arquivo não tem nenhum
 * dublê — o que se observa aqui é a regra do módulo, não uma simulação dela.
 */

function renderizar(propriedades: Omit<Parameters<typeof TimeSlotPicker>[0], 'onSelectTime'>) {
  return render(<TimeSlotPicker onSelectTime={vi.fn()} {...propriedades} />);
}

describe('TimeSlotPicker — disponibilidade', () => {
  it('gera a grade da jornada e para antes do fim do expediente', () => {
    renderizar({ doctor: medico(), selectedDate: PROXIMA_SEGUNDA });

    expect(screen.getByRole('button', { name: '08:00' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '10:00' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '17:30' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '18:00' })).not.toBeInTheDocument();
  });

  it('não gera horário algum em dia fora dos dias de trabalho, e diz por quê', () => {
    renderizar({ doctor: medico(), selectedDate: PROXIMO_SABADO });

    expect(screen.queryByRole('button', { name: '08:00' })).not.toBeInTheDocument();
    expect(screen.getByText('Médico não atende neste dia')).toBeInTheDocument();
  });

  it('passo da grade é a duração, e o último horário pode terminar depois do expediente', () => {
    // O laço só confere se o horário COMEÇA antes do fim: com duração de 45 minutos e
    // expediente até as 18:00, a grade inclui 17:45, que terminaria às 18:30. Não é
    // ajuste a fazer — é o comportamento que a prova precisa registrar como verdadeiro.
    renderizar({
      doctor: medico({ appointment_duration: 45 }),
      selectedDate: PROXIMA_SEGUNDA,
    });

    expect(screen.getByRole('button', { name: '08:00' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '08:45' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '17:45' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '18:30' })).not.toBeInTheDocument();
  });

  it('jornada invertida não gera horário e exibe a mensagem de dia sem atendimento', () => {
    renderizar({
      doctor: medico({ working_hours: { start: '18:00', end: '08:00' } }),
      selectedDate: PROXIMA_SEGUNDA,
    });

    expect(screen.queryByRole('button', { name: '08:00' })).not.toBeInTheDocument();
    expect(screen.getByText('Médico não atende neste dia')).toBeInTheDocument();
  });

  it('médico sem dias de trabalho informados não gera horário', () => {
    renderizar({
      doctor: medico({ working_days: undefined }),
      selectedDate: PROXIMA_SEGUNDA,
    });

    expect(screen.queryByRole('button', { name: '08:00' })).not.toBeInTheDocument();
    expect(screen.getByText('Médico não atende neste dia')).toBeInTheDocument();
  });

  it('médico sem janela de expediente cai na janela padrão de 08:00 às 18:00', () => {
    renderizar({
      doctor: medico({ working_hours: undefined }),
      selectedDate: PROXIMA_SEGUNDA,
    });

    expect(screen.getByRole('button', { name: '08:00' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '17:30' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '18:00' })).not.toBeInTheDocument();
  });

  it('não renderiza nada sem médico ou sem data', () => {
    const { container: semMedico } = renderizar({ selectedDate: PROXIMA_SEGUNDA });
    expect(semMedico).toBeEmptyDOMElement();

    const { container: semData } = renderizar({ doctor: medico(), selectedDate: null });
    expect(semData).toBeEmptyDOMElement();
  });
});

describe('TimeSlotPicker — conflito de horário', () => {
  it('gera o horário ocupado e o deixa indisponível, em vez de escondê-lo', () => {
    renderizar({
      doctor: medico(),
      selectedDate: PROXIMA_SEGUNDA,
      appointments: [agendamento({ date: horaLocal(PROXIMA_SEGUNDA, 10, 0).toISOString() })],
    });

    expect(screen.getByRole('button', { name: '10:00' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '10:30' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '09:30' })).toBeEnabled();
  });

  it('não detecta sobreposição quando o novo atendimento avança sobre o existente', () => {
    // A janela de conflito é PONTUAL: ela só pergunta se o horário do novo atendimento
    // cai DENTRO do intervalo do existente. O existente ocupa 10:30–11:00; o novo, de 60
    // minutos, começaria às 10:00 e avançaria até 11:00 — sobreposição real. Ainda assim
    // o horário das 10:00 é oferecido, porque 10:00 não está dentro de [10:30, 11:00).
    renderizar({
      doctor: medico({ appointment_duration: 60 }),
      selectedDate: PROXIMA_SEGUNDA,
      appointments: [
        agendamento({
          date: horaLocal(PROXIMA_SEGUNDA, 10, 30).toISOString(),
          duration: DURACAO_PADRAO,
        }),
      ],
    });

    expect(screen.getByRole('button', { name: '10:00' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '11:00' })).toBeEnabled();
  });

  it('devolve o horário escolhido em string ISO', async () => {
    const user = userEvent.setup();
    const onSelectTime = vi.fn();
    render(
      <TimeSlotPicker doctor={medico()} selectedDate={PROXIMA_SEGUNDA} onSelectTime={onSelectTime} />,
    );

    await user.click(screen.getByRole('button', { name: '15:00' }));

    expect(onSelectTime).toHaveBeenCalledWith(horaLocal(PROXIMA_SEGUNDA, 15, 0).toISOString());
  });
});

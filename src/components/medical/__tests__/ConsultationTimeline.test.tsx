import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ConsultationTimeline from '../ConsultationTimeline';

const base = {
  created_date: '2026-01-01T00:00:00.000Z',
  patient_id: 'patient-1',
};

describe('ConsultationTimeline', () => {
  it('shows an empty state when there are no clinical events', () => {
    render(<ConsultationTimeline />);

    expect(screen.getByText('Nenhum histórico encontrado')).toBeInTheDocument();
  });

  it('combines all event types and orders them from newest to oldest', () => {
    render(
      <MemoryRouter>
        <ConsultationTimeline
          consultations={[
            {
              ...base,
              id: 'consultation-1',
              date: '2026-01-10T10:00:00.000Z',
              status: 'concluida',
              chief_complaint: 'Dor de cabeça',
            },
          ]}
          prescriptions={[
            {
              ...base,
              id: 'prescription-1',
              created_date: '2026-01-12T00:00:00.000Z',
              type: 'receita_simples',
              content: 'Repouso',
              medications: [{ name: 'Dipirona' }],
            },
          ]}
          exams={[
            {
              ...base,
              id: 'exam-1',
              date: '2026-01-11',
              name: 'Hemograma',
              laboratory: 'Laboratório Central',
            },
          ]}
          appointments={[
            {
              ...base,
              id: 'appointment-1',
              date: '2026-01-13T09:00:00.000Z',
              doctor_id: 'doctor-1',
              status: 'confirmado',
            },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Consulta')).toBeInTheDocument();
    expect(screen.getByText('Receita Simples')).toBeInTheDocument();
    expect(screen.getByText('1 medicamento(s)')).toBeInTheDocument();
    expect(screen.getByText('Hemograma')).toBeInTheDocument();
    expect(screen.getByText(/Laboratório Central/)).toBeInTheDocument();
    expect(screen.getByText('Agendamento')).toBeInTheDocument();

    const cards = screen.getAllByText(/Consulta|Receita Simples|Hemograma|Agendamento/);
    expect(cards.map((element) => element.textContent)).toEqual([
      'Agendamento',
      'Receita Simples',
      'Hemograma',
      'Consulta',
    ]);
    expect(within(screen.getByText('Agendamento').closest('div') as HTMLElement).getByText('confirmado'))
      .toBeInTheDocument();
  });
});

import { format, addMinutes, parseISO, isBefore } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import type { Appointment, Doctor } from '@/types';

/**
 * Seleção de horários disponíveis para um médico e uma data.
 *
 * Gera os horários a partir da janela de atendimento do médico e desmarca os que já
 * estão ocupados por agendamentos existentes.
 *
 * PARIDADE: comportamento idêntico ao componente anterior. A conversão é de linguagem
 * e de tipos; nenhuma regra mudou. Em particular continuam iguais: o retorno nulo
 * quando falta médico ou data, a janela padrão de 8h às 18h quando o médico não a
 * define, a duração padrão de 30 minutos, a verificação de sobreposição por intervalo
 * e o envio do horário escolhido em string ISO.
 */

interface TimeSlotPickerProps {
  /** Médico com janela de atendimento e duração padrão. */
  doctor?: Doctor | null;
  /** Data selecionada, em string ISO. */
  selectedDate?: string | null;
  /** Agendamentos existentes, usados para desmarcar horários ocupados. */
  appointments?: Appointment[];
  /** Chamado com o horário escolhido, em string ISO. */
  onSelectTime: (isoTime: string) => void;
  /** Horário atualmente selecionado. */
  selectedTime?: Date | string | null;
}

export default function TimeSlotPicker({
  doctor,
  selectedDate,
  appointments,
  onSelectTime,
  selectedTime,
}: TimeSlotPickerProps) {
  if (!doctor || !selectedDate) return null;

  const generateTimeSlots = (): Date[] => {
    const slots: Date[] = [];
    const dayOfWeek = new Date(selectedDate).getDay();

    // Só gera horários nos dias em que o médico atende.
    if (!doctor.working_days?.includes(dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6)) {
      return [];
    }

    const [startHour, startMin] = doctor.working_hours?.start?.split(':').map(Number) || [8, 0];
    const [endHour, endMin] = doctor.working_hours?.end?.split(':').map(Number) || [18, 0];

    const duration = doctor.appointment_duration || 30;

    let currentTime = new Date(selectedDate);
    currentTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, endMin, 0, 0);

    while (isBefore(currentTime, endTime)) {
      slots.push(new Date(currentTime));
      currentTime = addMinutes(currentTime, duration);
    }

    return slots;
  };

  const isSlotAvailable = (slot: Date): boolean => {
    const slotTime = slot.getTime();
    return !appointments?.some((apt) => {
      const aptTime = parseISO(apt.date).getTime();
      const aptDuration = apt.duration || 30;
      const aptEnd = aptTime + aptDuration * 60 * 1000;
      return slotTime >= aptTime && slotTime < aptEnd;
    });
  };

  const slots = generateTimeSlots();

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
        <p>Médico não atende neste dia</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Horários Disponíveis</span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
        {slots.map((slot) => {
          const available = isSlotAvailable(slot);
          const isSelected =
            selectedTime && new Date(selectedTime).getTime() === slot.getTime();
          return (
            <Button
              key={slot.toString()}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onSelectTime(slot.toISOString())}
              disabled={!available}
              className={`text-sm ${isSelected ? 'bg-sky-600' : ''} ${!available ? 'opacity-40' : ''}`}
            >
              {format(slot, 'HH:mm')}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

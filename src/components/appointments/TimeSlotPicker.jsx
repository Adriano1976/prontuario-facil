import React from 'react';
import { format, addMinutes, parseISO, isBefore } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Clock } from 'lucide-react';

export default function TimeSlotPicker({ doctor, selectedDate, appointments, onSelectTime, selectedTime }) {
    if (!doctor || !selectedDate) return null;

    const generateTimeSlots = () => {
        const slots = [];
        const dayOfWeek = new Date(selectedDate).getDay();
        
        // Check if doctor works on this day
        if (!doctor.working_days?.includes(dayOfWeek)) {
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

    const isSlotAvailable = (slot) => {
        const slotTime = slot.getTime();
        return !appointments?.some(apt => {
            const aptTime = parseISO(apt.date).getTime();
            const aptDuration = apt.duration || 30;
            const aptEnd = aptTime + (aptDuration * 60 * 1000);
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
                {slots.map(slot => {
                    const available = isSlotAvailable(slot);
                    const isSelected = selectedTime && new Date(selectedTime).getTime() === slot.getTime();
                    return (
                        <Button
                            key={slot.toString()}
                            variant={isSelected ? "default" : "outline"}
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

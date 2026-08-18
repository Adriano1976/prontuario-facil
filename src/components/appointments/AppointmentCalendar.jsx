import React, { useState } from 'react';
import { format, addDays, startOfWeek, addWeeks, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_COLORS = {
    agendado: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmado: 'bg-sky-100 text-sky-700 border-sky-200',
    em_atendimento: 'bg-violet-100 text-violet-700 border-violet-200',
    concluido: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelado: 'bg-slate-100 text-slate-700 border-slate-200',
    faltou: 'bg-rose-100 text-rose-700 border-rose-200',
};

export default function AppointmentCalendar({ appointments, doctors, patients, onAppointmentClick }) {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const weekStart = startOfWeek(currentWeek, { locale: ptBR });

    const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));
    const hours = [...Array(12)].map((_, i) => i + 8); // 8:00 - 19:00

    const getAppointmentsForSlot = (day, hour) => {
        return appointments?.filter(apt => {
            const aptDate = parseISO(apt.date);
            return isSameDay(aptDate, day) && aptDate.getHours() === hour;
        }) || [];
    };

    const getDoctor = (doctorId) => doctors?.find(d => d.id === doctorId);
    const getPatient = (patientId) => patients?.find(p => p.id === patientId);

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-sky-500" />
                    <h2 className="text-lg font-semibold">
                        {format(weekStart, "MMMM 'de' yyyy", { locale: ptBR })}
                    </h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentWeek(new Date())}>
                        Hoje
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                    {/* Header */}
                    <div className="grid grid-cols-8 gap-2 mb-4">
                        <div className="text-sm font-medium text-slate-500">Horário</div>
                        {weekDays.map(day => (
                            <div key={day.toString()} className="text-center">
                                <div className="text-sm font-medium text-slate-900">
                                    {format(day, 'EEE', { locale: ptBR })}
                                </div>
                                <div className={`text-lg font-semibold ${isSameDay(day, new Date()) ? 'text-sky-600' : 'text-slate-600'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time slots */}
                    <div className="space-y-2">
                        {hours.map(hour => (
                            <div key={hour} className="grid grid-cols-8 gap-2">
                                <div className="text-sm text-slate-500 font-medium pt-2">
                                    {hour}:00
                                </div>
                                {weekDays.map(day => {
                                    const slotAppointments = getAppointmentsForSlot(day, hour);
                                    return (
                                        <div key={`${day}-${hour}`} className="min-h-[60px] bg-slate-50 rounded-lg p-1">
                                            {slotAppointments.map(apt => {
                                                const doctor = getDoctor(apt.doctor_id);
                                                const patient = getPatient(apt.patient_id);
                                                return (
                                                    <motion.button
                                                        key={apt.id}
                                                        onClick={() => onAppointmentClick(apt)}
                                                        className={`w-full p-2 rounded border-l-2 text-left text-xs ${STATUS_COLORS[apt.status]} hover:shadow-md transition-all`}
                                                        whileHover={{ scale: 1.02 }}
                                                    >
                                                        <div className="font-medium truncate">{patient?.full_name}</div>
                                                        <div className="text-[10px] opacity-75 truncate">{doctor?.full_name}</div>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Clock className="h-2.5 w-2.5" />
                                                            <span>{apt.duration}min</span>
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${color}`} />
                        <span className="text-xs text-slate-600 capitalize">{status.replace('_', ' ')}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

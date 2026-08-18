import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Plus, 
    Calendar, 
    ArrowLeft,
    List,
    CalendarDays,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG = {
    agendado: { label: 'Agendado', color: 'bg-amber-100 text-amber-700' },
    confirmado: { label: 'Confirmado', color: 'bg-sky-100 text-sky-700' },
    em_atendimento: { label: 'Em Atendimento', color: 'bg-violet-100 text-violet-700' },
    concluido: { label: 'Concluído', color: 'bg-emerald-100 text-emerald-700' },
    cancelado: { label: 'Cancelado', color: 'bg-slate-100 text-slate-700' },
    faltou: { label: 'Faltou', color: 'bg-rose-100 text-rose-700' },
};

export default function Appointments() {
    const queryClient = useQueryClient();
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const { data: appointments } = useQuery({
        queryKey: ['appointments'],
        queryFn: () => base44.entities.Appointment.list('-date'),
    });

    const { data: doctors } = useQuery({
        queryKey: ['doctors'],
        queryFn: () => base44.entities.Doctor.list(),
    });

    const { data: patients } = useQuery({
        queryKey: ['patients'],
        queryFn: () => base44.entities.Patient.list(),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => base44.entities.Appointment.update(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            setShowDetails(false);
        }
    });

    const handleAppointmentClick = (apt) => {
        setSelectedAppointment(apt);
        setShowDetails(true);
    };

    const getDoctor = (doctorId) => doctors?.find(d => d.id === doctorId);
    const getPatient = (patientId) => patients?.find(p => p.id === patientId);

    const upcomingAppointments = appointments?.filter(a => 
        new Date(a.date) > new Date() && a.status !== 'cancelado'
    ) || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
                >
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <Calendar className="h-8 w-8 text-sky-500" />
                                Agendamentos
                            </h1>
                            <p className="text-slate-500 mt-1">{upcomingAppointments.length} agendamentos próximos</p>
                        </div>
                    </div>
                    <Link to={createPageUrl('NewAppointment')}>
                        <Button className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Agendamento
                        </Button>
                    </Link>
                </motion.div>

                <Tabs defaultValue="calendar" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="calendar" className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Calendário
                        </TabsTrigger>
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            Lista
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="calendar">
                        <AppointmentCalendar 
                            appointments={appointments}
                            doctors={doctors}
                            patients={patients}
                            onAppointmentClick={handleAppointmentClick}
                        />
                    </TabsContent>

                    <TabsContent value="list">
                        <Card className="p-6">
                            <div className="space-y-3">
                                {upcomingAppointments.map(apt => {
                                    const doctor = getDoctor(apt.doctor_id);
                                    const patient = getPatient(apt.patient_id);
                                    return (
                                        <motion.button
                                            key={apt.id}
                                            onClick={() => handleAppointmentClick(apt)}
                                            className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-left"
                                            whileHover={{ scale: 1.01 }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                                                        {patient?.full_name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{patient?.full_name}</p>
                                                        <p className="text-sm text-slate-500">{doctor?.full_name} - {doctor?.specialty}</p>
                                                        <p className="text-sm text-slate-500">
                                                            {format(parseISO(apt.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={STATUS_CONFIG[apt.status]?.color}>
                                                    {STATUS_CONFIG[apt.status]?.label}
                                                </Badge>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalhes do Agendamento</DialogTitle>
                    </DialogHeader>
                    {selectedAppointment && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-500">Paciente</p>
                                <p className="font-medium">{getPatient(selectedAppointment.patient_id)?.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Médico</p>
                                <p className="font-medium">{getDoctor(selectedAppointment.doctor_id)?.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Data e Hora</p>
                                <p className="font-medium">
                                    {format(parseISO(selectedAppointment.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-2">Status</p>
                                <Select 
                                    value={selectedAppointment.status} 
                                    onValueChange={(status) => updateStatusMutation.mutate({ id: selectedAppointment.id, status })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => updateStatusMutation.mutate({ id: selectedAppointment.id, status: 'confirmado' })}
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Confirmar
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="flex-1 text-rose-600 hover:bg-rose-50"
                                    onClick={() => updateStatusMutation.mutate({ id: selectedAppointment.id, status: 'cancelado' })}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { 
    ArrowLeft, 
    Save,
    Calendar as CalendarIcon,
    User,
    Stethoscope,
    Clock,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TimeSlotPicker from '@/components/appointments/TimeSlotPicker';

export default function NewAppointment() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedPatientId = urlParams.get('patient_id');

    const [formData, setFormData] = useState({
        patient_id: preselectedPatientId || '',
        doctor_id: '',
        date: '',
        type: 'primeira_consulta',
        notes: '',
        status: 'agendado'
    });

    const [selectedDate, setSelectedDate] = useState(null);

    const { data: patients } = useQuery({
        queryKey: ['patients'],
        queryFn: () => base44.entities.Patient.filter({ status: 'ativo' }),
    });

    const { data: doctors } = useQuery({
        queryKey: ['doctors'],
        queryFn: () => base44.entities.Doctor.filter({ is_active: true }),
    });

    const { data: appointments } = useQuery({
        queryKey: ['appointments', formData.doctor_id, selectedDate],
        queryFn: () => base44.entities.Appointment.filter({ doctor_id: formData.doctor_id }),
        enabled: !!formData.doctor_id && !!selectedDate,
    });

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            const appointment = await base44.entities.Appointment.create(data);
            
            // Send confirmation email
            const patient = patients?.find(p => p.id === data.patient_id);
            const doctor = doctors?.find(d => d.id === data.doctor_id);
            if (patient?.email) {
                await base44.integrations.Core.SendEmail({
                    to: patient.email,
                    subject: 'Confirmação de Agendamento',
                    body: `Olá ${patient.full_name},\n\nSeu agendamento foi confirmado!\n\nMédico: ${doctor?.full_name}\nData: ${format(new Date(data.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n\nAté breve!`
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            navigate(createPageUrl('Appointments'));
        }
    });

    const selectedDoctor = doctors?.find(d => d.id === formData.doctor_id);

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate({
            ...formData,
            duration: selectedDoctor?.appointment_duration || 30
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(-1)}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Button>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <CalendarIcon className="h-8 w-8 text-sky-500" />
                        Novo Agendamento
                    </h1>
                    <p className="text-slate-500 mt-1">Agende uma consulta para o paciente</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Patient & Doctor */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-sky-500" />
                                    Paciente e Médico
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Paciente *</Label>
                                    <Select value={formData.patient_id} onValueChange={(v) => setFormData({ ...formData, patient_id: v })} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o paciente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients?.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Médico *</Label>
                                    <Select value={formData.doctor_id} onValueChange={(v) => setFormData({ ...formData, doctor_id: v })} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o médico" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors?.map(d => (
                                                <SelectItem key={d.id} value={d.id}>
                                                    {d.full_name} - {d.specialty}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Date & Time */}
                    {formData.doctor_id && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5 text-emerald-500" />
                                        Data e Horário
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            className="rounded-xl border"
                                            disabled={(date) => date < new Date()}
                                        />
                                    </div>
                                    <div>
                                        {selectedDate && (
                                            <TimeSlotPicker
                                                doctor={selectedDoctor}
                                                selectedDate={selectedDate}
                                                appointments={appointments}
                                                selectedTime={formData.date}
                                                onSelectTime={(time) => setFormData({ ...formData, date: time })}
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Type & Notes */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-violet-500" />
                                    Detalhes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Tipo de Consulta</Label>
                                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="primeira_consulta">Primeira Consulta</SelectItem>
                                            <SelectItem value="retorno">Retorno</SelectItem>
                                            <SelectItem value="exame">Exame</SelectItem>
                                            <SelectItem value="procedimento">Procedimento</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Observações</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Observações sobre o agendamento..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={!formData.patient_id || !formData.doctor_id || !formData.date || saveMutation.isPending}
                            className="bg-gradient-to-r from-sky-500 to-emerald-500"
                        >
                            {saveMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Agendando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Confirmar Agendamento
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

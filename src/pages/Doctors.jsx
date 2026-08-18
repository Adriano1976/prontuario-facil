import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    Plus, 
    UserCog, 
    Edit, 
    Trash2, 
    ArrowLeft,
    Save,
    Loader2,
    Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const DAYS_OF_WEEK = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda' },
    { value: 2, label: 'Terça' },
    { value: 3, label: 'Quarta' },
    { value: 4, label: 'Quinta' },
    { value: 5, label: 'Sexta' },
    { value: 6, label: 'Sábado' },
];

export default function Doctors() {
    const queryClient = useQueryClient();
    const [showEditor, setShowEditor] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);

    const [formData, setFormData] = useState({
        full_name: '',
        specialty: '',
        crm: '',
        email: '',
        phone: '',
        working_days: [1, 2, 3, 4, 5],
        working_hours: { start: '08:00', end: '18:00' },
        appointment_duration: 30,
        is_active: true
    });

    const { data: doctors, isLoading } = useQuery({
        queryKey: ['doctors'],
        queryFn: () => base44.entities.Doctor.list('-created_date'),
    });

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (editingDoctor) {
                await base44.entities.Doctor.update(editingDoctor.id, data);
            } else {
                await base44.entities.Doctor.create(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            setShowEditor(false);
            setEditingDoctor(null);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Doctor.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctors'] }),
    });

    const resetForm = () => {
        setFormData({
            full_name: '',
            specialty: '',
            crm: '',
            email: '',
            phone: '',
            working_days: [1, 2, 3, 4, 5],
            working_hours: { start: '08:00', end: '18:00' },
            appointment_duration: 30,
            is_active: true
        });
    };

    const handleEdit = (doctor) => {
        setEditingDoctor(doctor);
        setFormData(doctor);
        setShowEditor(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    const toggleWorkingDay = (day) => {
        const days = formData.working_days || [];
        if (days.includes(day)) {
            setFormData({ ...formData, working_days: days.filter(d => d !== day) });
        } else {
            setFormData({ ...formData, working_days: [...days, day].sort() });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                <UserCog className="h-8 w-8 text-violet-500" />
                                Médicos
                            </h1>
                            <p className="text-slate-500 mt-1">Gerencie médicos e agendas</p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => { resetForm(); setEditingDoctor(null); setShowEditor(true); }}
                        className="bg-gradient-to-r from-violet-500 to-purple-500"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Médico
                    </Button>
                </motion.div>

                {/* Doctors List */}
                <div className="grid gap-4 md:grid-cols-2">
                    {doctors?.map(doctor => (
                        <motion.div key={doctor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                                                {doctor.full_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{doctor.full_name}</h3>
                                                <p className="text-sm text-slate-500">{doctor.specialty}</p>
                                                <p className="text-xs text-slate-400">CRM: {doctor.crm}</p>
                                            </div>
                                        </div>
                                        <Badge className={doctor.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                                            {doctor.is_active ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>{doctor.working_hours?.start} - {doctor.working_hours?.end}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {doctor.working_days?.map(day => (
                                                <Badge key={day} variant="outline" className="text-xs">
                                                    {DAYS_OF_WEEK.find(d => d.value === day)?.label}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(doctor)}>
                                            <Edit className="h-4 w-4 mr-1" />
                                            Editar
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="text-rose-600"
                                            onClick={() => deleteMutation.mutate(doctor.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Editor Dialog */}
            <Dialog open={showEditor} onOpenChange={setShowEditor}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingDoctor ? 'Editar Médico' : 'Novo Médico'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label>Nome Completo *</Label>
                                <Input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Especialidade *</Label>
                                <Input
                                    value={formData.specialty}
                                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>CRM *</Label>
                                <Input
                                    value={formData.crm}
                                    onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Telefone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Dias de Atendimento</Label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS_OF_WEEK.map(day => (
                                    <div key={day.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`day-${day.value}`}
                                            checked={formData.working_days?.includes(day.value)}
                                            onCheckedChange={() => toggleWorkingDay(day.value)}
                                        />
                                        <label htmlFor={`day-${day.value}`} className="text-sm">
                                            {day.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Horário Início</Label>
                                <Input
                                    type="time"
                                    value={formData.working_hours?.start}
                                    onChange={(e) => setFormData({ ...formData, working_hours: { ...formData.working_hours, start: e.target.value } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Horário Fim</Label>
                                <Input
                                    type="time"
                                    value={formData.working_hours?.end}
                                    onChange={(e) => setFormData({ ...formData, working_hours: { ...formData.working_hours, end: e.target.value } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Duração (min)</Label>
                                <Input
                                    type="number"
                                    value={formData.appointment_duration}
                                    onChange={(e) => setFormData({ ...formData, appointment_duration: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch 
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                            <Label htmlFor="is_active">Médico ativo</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowEditor(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={saveMutation.isPending} className="bg-violet-600">
                                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Salvar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

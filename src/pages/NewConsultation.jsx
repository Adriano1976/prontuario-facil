import React, { useState, useEffect } from 'react';
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
import { 
    ArrowLeft, 
    Save, 
    Search,
    Stethoscope,
    Calendar,
    Loader2,
    User
} from 'lucide-react';
import { motion } from 'framer-motion';
import VitalSignsForm from '@/components/medical/VitalSignsForm';
import { logAccess, ACCESS_ACTIONS } from '@/components/medical/AccessLogger';

export default function NewConsultation() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedPatientId = urlParams.get('patient_id');
    const consultationId = urlParams.get('id');

    const [searchPatient, setSearchPatient] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [formData, setFormData] = useState({
        patient_id: '',
        date: new Date().toISOString().slice(0, 16),
        chief_complaint: '',
        history_present_illness: '',
        vital_signs: {},
        physical_exam: '',
        diagnosis: '',
        icd_code: '',
        treatment_plan: '',
        notes: '',
        follow_up_date: '',
        status: 'em_andamento'
    });

    const { data: patients } = useQuery({
        queryKey: ['patients'],
        queryFn: () => base44.entities.Patient.filter({ status: 'ativo' }, '-full_name'),
    });

    const { data: existingConsultation } = useQuery({
        queryKey: ['consultation', consultationId],
        queryFn: () => base44.entities.Consultation.filter({ id: consultationId }),
        enabled: !!consultationId,
    });

    useEffect(() => {
        if (existingConsultation?.[0]) {
            const c = existingConsultation[0];
            setFormData({
                patient_id: c.patient_id,
                date: c.date?.slice(0, 16),
                chief_complaint: c.chief_complaint || '',
                history_present_illness: c.history_present_illness || '',
                vital_signs: c.vital_signs || {},
                physical_exam: c.physical_exam || '',
                diagnosis: c.diagnosis || '',
                icd_code: c.icd_code || '',
                treatment_plan: c.treatment_plan || '',
                notes: c.notes || '',
                follow_up_date: c.follow_up_date || '',
                status: c.status || 'em_andamento'
            });
            const patient = patients?.find(p => p.id === c.patient_id);
            if (patient) setSelectedPatient(patient);
        }
    }, [existingConsultation, patients]);

    useEffect(() => {
        if (preselectedPatientId && patients) {
            const patient = patients.find(p => p.id === preselectedPatientId);
            if (patient) {
                setSelectedPatient(patient);
                setFormData(prev => ({ ...prev, patient_id: preselectedPatientId }));
            }
        }
    }, [preselectedPatientId, patients]);

    const filteredPatients = patients?.filter(p => 
        p.full_name?.toLowerCase().includes(searchPatient.toLowerCase()) ||
        p.cpf?.includes(searchPatient)
    ).slice(0, 5) || [];

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (consultationId) {
                await base44.entities.Consultation.update(consultationId, data);
                await logAccess(ACCESS_ACTIONS.EDIT_CONSULTATION, 'Consultation', consultationId, selectedPatient?.full_name);
            } else {
                await base44.entities.Consultation.create(data);
                await logAccess(ACCESS_ACTIONS.CREATE_CONSULTATION, 'Consultation', null, selectedPatient?.full_name);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consultations'] });
            if (selectedPatient) {
                navigate(createPageUrl(`PatientDetail?id=${selectedPatient.id}`));
            } else {
                navigate(createPageUrl('Consultations'));
            }
        }
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setFormData(prev => ({ ...prev, patient_id: patient.id }));
        setSearchPatient('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate(formData);
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
                        <Stethoscope className="h-8 w-8 text-sky-500" />
                        {consultationId ? 'Editar Consulta' : 'Nova Consulta'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Preencha a anamnese e dados do atendimento
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Patient Selection */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-sky-500" />
                                    Paciente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedPatient ? (
                                    <div className="flex items-center gap-4 p-4 bg-sky-50 rounded-xl border border-sky-200">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                                            {selectedPatient.full_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900">{selectedPatient.full_name}</p>
                                            <p className="text-sm text-slate-500">{selectedPatient.phone}</p>
                                        </div>
                                        {!preselectedPatientId && (
                                            <Button 
                                                type="button"
                                                variant="ghost" 
                                                onClick={() => {
                                                    setSelectedPatient(null);
                                                    setFormData(prev => ({ ...prev, patient_id: '' }));
                                                }}
                                            >
                                                Trocar
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Buscar paciente por nome ou CPF..."
                                            value={searchPatient}
                                            onChange={(e) => setSearchPatient(e.target.value)}
                                            className="pl-10"
                                        />
                                        {searchPatient && filteredPatients.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border shadow-lg z-10 overflow-hidden">
                                                {filteredPatients.map(patient => (
                                                    <button
                                                        key={patient.id}
                                                        type="button"
                                                        onClick={() => handleSelectPatient(patient)}
                                                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                                                    >
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white font-medium">
                                                            {patient.full_name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{patient.full_name}</p>
                                                            <p className="text-sm text-slate-500">{patient.phone}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Date & Status */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-emerald-500" />
                                    Data e Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Data e Hora *</Label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.date}
                                            onChange={(e) => handleChange('date', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="agendada">Agendada</SelectItem>
                                                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                                                <SelectItem value="concluida">Concluída</SelectItem>
                                                <SelectItem value="cancelada">Cancelada</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Data de Retorno</Label>
                                        <Input
                                            type="date"
                                            value={formData.follow_up_date}
                                            onChange={(e) => handleChange('follow_up_date', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Vital Signs */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Sinais Vitais</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <VitalSignsForm 
                                    vitalSigns={formData.vital_signs}
                                    onChange={(vs) => handleChange('vital_signs', vs)}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Anamnesis */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Anamnese</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Queixa Principal</Label>
                                    <Textarea
                                        value={formData.chief_complaint}
                                        onChange={(e) => handleChange('chief_complaint', e.target.value)}
                                        placeholder="Descreva a queixa principal do paciente..."
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>História da Doença Atual</Label>
                                    <Textarea
                                        value={formData.history_present_illness}
                                        onChange={(e) => handleChange('history_present_illness', e.target.value)}
                                        placeholder="Descreva a história da doença atual..."
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Exame Físico</Label>
                                    <Textarea
                                        value={formData.physical_exam}
                                        onChange={(e) => handleChange('physical_exam', e.target.value)}
                                        placeholder="Achados do exame físico..."
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Diagnosis & Treatment */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Diagnóstico e Conduta</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-3 space-y-2">
                                        <Label>Diagnóstico</Label>
                                        <Input
                                            value={formData.diagnosis}
                                            onChange={(e) => handleChange('diagnosis', e.target.value)}
                                            placeholder="Diagnóstico principal"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>CID-10</Label>
                                        <Input
                                            value={formData.icd_code}
                                            onChange={(e) => handleChange('icd_code', e.target.value)}
                                            placeholder="Ex: J00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Plano de Tratamento</Label>
                                    <Textarea
                                        value={formData.treatment_plan}
                                        onChange={(e) => handleChange('treatment_plan', e.target.value)}
                                        placeholder="Descreva o plano de tratamento..."
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Observações</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => handleChange('notes', e.target.value)}
                                        placeholder="Observações adicionais..."
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Submit */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.35 }}
                        className="flex justify-end gap-4"
                    >
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={!selectedPatient || saveMutation.isPending}
                            className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600"
                        >
                            {saveMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Salvar Consulta
                                </>
                            )}
                        </Button>
                    </motion.div>
                </form>
            </div>
        </div>
    );
}

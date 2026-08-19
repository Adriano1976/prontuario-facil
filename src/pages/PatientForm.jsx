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
    User, 
    Phone, 
    Mail, 
    MapPin, 
    Heart, 
    AlertTriangle,
    Shield,
    Loader2,
    Camera
} from 'lucide-react';
import { motion } from 'framer-motion';
import LGPDConsent from '@/components/medical/LGPDConsent';
import { logAccess, ACCESS_ACTIONS } from '@/components/medical/AccessLogger';
import { useToast } from '@/components/ui/use-toast';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'desconhecido'];
const GENDERS = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'feminino', label: 'Feminino' },
    { value: 'outro', label: 'Outro' },
    { value: 'prefiro_nao_informar', label: 'Prefiro não informar' }
];

/**
 * Página de formulário para criar ou editar informações de paciente.
 * Manipula dados pessoais, informações de contato, histórico de saúde e consentimento LGPD.
 * Suporta upload de foto do paciente e inclui validação.
 * Pode ser usado para criar novos pacientes ou editar os existentes.
 *
 * @component
 * @returns {JSX.Element} - Formulário com campos de detalhes de paciente, manipulação de envio e diálogo de consentimento.
 *
 * @example
 * <PatientForm /> // Para novo paciente
 * <PatientForm /> // Para edição (passe ?id=paciente-123 em URL)
 */
export default function PatientForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('id');

    const [showLGPDConsent, setShowLGPDConsent] = useState(false);
    const [lgpdAccepted, setLgpdAccepted] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const [formData, setFormData] = useState({
        full_name: '',
        cpf: '',
        birth_date: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        emergency_contact: '',
        emergency_phone: '',
        health_insurance: '',
        insurance_number: '',
        blood_type: 'desconhecido',
        allergies: '',
        chronic_conditions: '',
        medications_in_use: '',
        notes: '',
        status: 'ativo',
        lgpd_consent: false,
        lgpd_consent_date: null,
        photo_url: ''
    });

    const { data: patient, isLoading: loadingPatient } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: () => base44.entities.Patient.filter({ id: patientId }),
        enabled: !!patientId,
    });

    useEffect(() => {
        if (patient?.[0]) {
            setFormData(patient[0]);
            setLgpdAccepted(patient[0].lgpd_consent);
            if (patient[0].photo_url) {
                setPhotoPreview(patient[0].photo_url);
            }
        }
    }, [patient]);

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            let photoUrl = formData.photo_url;
            if (photoFile) {
                const { file_url } = await base44.integrations.Core.UploadFile({ file: photoFile });
                photoUrl = file_url;
            }

            const saveData = { ...data, photo_url: photoUrl };

            if (patientId) {
                await base44.entities.Patient.update(patientId, saveData);
                await logAccess(ACCESS_ACTIONS.EDIT_PATIENT, 'Patient', patientId, data.full_name);
            } else {
                await base44.entities.Patient.create(saveData);
                await logAccess(ACCESS_ACTIONS.CREATE_PATIENT, 'Patient', null, data.full_name);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            navigate(createPageUrl('Patients'));
        },
        onError: (error) => {
            toast({
                variant: 'destructive',
                title: 'Não foi possível salvar o paciente',
                description: error?.message || 'Verifique a conexão com o servidor e tente novamente.',
            });
        }
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setPhotoPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleLGPDAccept = () => {
        setLgpdAccepted(true);
        setFormData(prev => ({
            ...prev,
            lgpd_consent: true,
            lgpd_consent_date: new Date().toISOString(),
            lgpd_consent_ip: 'client-side'
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!lgpdAccepted && !patientId) {
            setShowLGPDConsent(true);
            return;
        }
        saveMutation.mutate(formData);
    };

    const formatCPF = (value) => {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const formatPhone = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    if (loadingPatient && patientId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

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
                    <h1 className="text-3xl font-bold text-slate-900">
                        {patientId ? 'Editar Paciente' : 'Novo Paciente'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {patientId ? 'Atualize os dados do paciente' : 'Preencha a ficha completa do paciente'}
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Photo & Basic Info */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-sky-500" />
                                    Dados Pessoais
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex flex-col items-center">
                                        <div 
                                            className="relative h-32 w-32 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-sky-400 transition-colors"
                                            onClick={() => document.getElementById('photo-input')?.click()}
                                        >
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Foto" className="h-full w-full object-cover" />
                                            ) : (
                                                <Camera className="h-8 w-8 text-slate-400" />
                                            )}
                                        </div>
                                        <input
                                            id="photo-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                        <p className="text-xs text-slate-500 mt-2">Clique para adicionar foto</p>
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label>Nome Completo *</Label>
                                            <Input
                                                value={formData.full_name}
                                                onChange={(e) => handleChange('full_name', e.target.value)}
                                                placeholder="Nome completo do paciente"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>CPF *</Label>
                                            <Input
                                                value={formData.cpf}
                                                onChange={(e) => handleChange('cpf', formatCPF(e.target.value))}
                                                placeholder="000.000.000-00"
                                                maxLength={14}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Data de Nascimento *</Label>
                                            <Input
                                                type="date"
                                                value={formData.birth_date}
                                                onChange={(e) => handleChange('birth_date', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Gênero</Label>
                                            <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {GENDERS.map(g => (
                                                        <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tipo Sanguíneo</Label>
                                            <Select value={formData.blood_type} onValueChange={(v) => handleChange('blood_type', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {BLOOD_TYPES.map(bt => (
                                                        <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-emerald-500" />
                                    Contato
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Telefone *</Label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
                                            placeholder="(00) 00000-0000"
                                            maxLength={15}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            placeholder="email@exemplo.com"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label>Endereço</Label>
                                        <Input
                                            value={formData.address}
                                            onChange={(e) => handleChange('address', e.target.value)}
                                            placeholder="Rua, número, bairro, cidade - UF"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Contato de Emergência</Label>
                                        <Input
                                            value={formData.emergency_contact}
                                            onChange={(e) => handleChange('emergency_contact', e.target.value)}
                                            placeholder="Nome do contato"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Telefone de Emergência</Label>
                                        <Input
                                            value={formData.emergency_phone}
                                            onChange={(e) => handleChange('emergency_phone', formatPhone(e.target.value))}
                                            placeholder="(00) 00000-0000"
                                            maxLength={15}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Health Insurance */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-violet-500" />
                                    Convênio
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Convênio Médico</Label>
                                        <Input
                                            value={formData.health_insurance}
                                            onChange={(e) => handleChange('health_insurance', e.target.value)}
                                            placeholder="Nome do convênio"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Número da Carteirinha</Label>
                                        <Input
                                            value={formData.insurance_number}
                                            onChange={(e) => handleChange('insurance_number', e.target.value)}
                                            placeholder="Número do plano"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Medical Info */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-rose-500" />
                                    Informações Médicas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        Alergias
                                    </Label>
                                    <Textarea
                                        value={formData.allergies}
                                        onChange={(e) => handleChange('allergies', e.target.value)}
                                        placeholder="Liste todas as alergias conhecidas..."
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Condições Crônicas</Label>
                                    <Textarea
                                        value={formData.chronic_conditions}
                                        onChange={(e) => handleChange('chronic_conditions', e.target.value)}
                                        placeholder="Diabetes, hipertensão, etc..."
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Medicamentos em Uso Contínuo</Label>
                                    <Textarea
                                        value={formData.medications_in_use}
                                        onChange={(e) => handleChange('medications_in_use', e.target.value)}
                                        placeholder="Liste os medicamentos de uso contínuo..."
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Observações Gerais</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => handleChange('notes', e.target.value)}
                                        placeholder="Outras informações relevantes..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* LGPD Notice */}
                    {!patientId && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <Card className={`border-2 ${lgpdAccepted ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className={`h-6 w-6 ${lgpdAccepted ? 'text-emerald-500' : 'text-amber-500'}`} />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">
                                                {lgpdAccepted ? 'Consentimento LGPD aceito' : 'Consentimento LGPD pendente'}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                {lgpdAccepted 
                                                    ? 'O paciente autorizou o tratamento de dados pessoais.' 
                                                    : 'O termo de consentimento será exibido ao salvar.'}
                                            </p>
                                        </div>
                                        {!lgpdAccepted && (
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setShowLGPDConsent(true)}
                                            >
                                                Ver Termo
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Submit */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.6 }}
                        className="flex justify-end gap-4"
                    >
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={saveMutation.isPending}
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
                                    Salvar Paciente
                                </>
                            )}
                        </Button>
                    </motion.div>
                </form>
            </div>

            <LGPDConsent 
                open={showLGPDConsent} 
                onOpenChange={setShowLGPDConsent}
                onAccept={handleLGPDAccept}
            />
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    ArrowLeft, 
    Edit, 
    Stethoscope, 
    Calendar,
    User,
    Heart,
    FileText,
    Pill,
    Upload,
    Printer,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import PrescriptionEditor from '@/components/medical/PrescriptionEditor';
import ExamUploader from '@/components/medical/ExamUploader';
import { logAccess, ACCESS_ACTIONS } from '@/components/medical/AccessLogger';

const STATUS_CONFIG = {
    agendada: { label: 'Agendada', color: 'bg-amber-100 text-amber-700' },
    em_andamento: { label: 'Em Andamento', color: 'bg-sky-100 text-sky-700' },
    concluida: { label: 'Concluída', color: 'bg-emerald-100 text-emerald-700' },
    cancelada: { label: 'Cancelada', color: 'bg-rose-100 text-rose-700' },
};

/**
 * Página de detalhe de uma única consulta.
 * Mostra informações abrangentes de consulta incluindo sinais vitais, diagnóstico e anotacões.
 * Exibe prescrições e exames associados.
 * Permite editar status de consulta e adicionar novos exames/prescrições.
 *
 * @component
 * @returns {JSX.Element} - Página com detalhes de consulta, registros médicos e botões de ação.
 *
 * @example
 * <Consultation /> // URL deve conter ?id=consulta-123
 */
export default function Consultation() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const urlParams = new URLSearchParams(window.location.search);
    const consultationId = urlParams.get('id');

    const [showPrescription, setShowPrescription] = useState(false);
    const [showExamUploader, setShowExamUploader] = useState(false);

    const { data: consultationData, isLoading } = useQuery({
        queryKey: ['consultation', consultationId],
        queryFn: () => base44.entities.Consultation.filter({ id: consultationId }),
        enabled: !!consultationId,
    });

    const consultation = consultationData?.[0];

    const { data: patientData } = useQuery({
        queryKey: ['patient', consultation?.patient_id],
        queryFn: () => base44.entities.Patient.filter({ id: consultation?.patient_id }),
        enabled: !!consultation?.patient_id,
    });

    const patient = patientData?.[0];

    const { data: prescriptions } = useQuery({
        queryKey: ['prescriptions', consultationId],
        queryFn: () => base44.entities.Prescription.filter({ consultation_id: consultationId }, '-created_date'),
        enabled: !!consultationId,
    });

    const { data: exams } = useQuery({
        queryKey: ['exams', consultationId],
        queryFn: () => base44.entities.Exam.filter({ consultation_id: consultationId }, '-date'),
        enabled: !!consultationId,
    });

    useEffect(() => {
        if (consultation && patient) {
            logAccess(ACCESS_ACTIONS.VIEW_CONSULTATION, 'Consultation', consultationId, patient.full_name);
        }
    }, [consultation, patient, consultationId]);

    const createPrescriptionMutation = useMutation({
        mutationFn: (data) => base44.entities.Prescription.create(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prescriptions', consultationId] }),
    });

    const createExamMutation = useMutation({
        mutationFn: (data) => base44.entities.Exam.create(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams', consultationId] }),
    });

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!consultation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center">
                <Card className="p-8 text-center">
                    <Stethoscope className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Consulta não encontrada</h2>
                    <Link to={createPageUrl('Dashboard')}>
                        <Button>Voltar ao início</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <Stethoscope className="h-8 w-8 text-sky-500" />
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">Consulta</h1>
                                    <p className="text-slate-500">
                                        {format(new Date(consultation.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                </div>
                                <Badge className={STATUS_CONFIG[consultation.status]?.color}>
                                    {STATUS_CONFIG[consultation.status]?.label}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handlePrint}>
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir
                            </Button>
                            <Link to={createPageUrl(`NewConsultation?id=${consultationId}`)}>
                                <Button variant="outline">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Patient Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5 text-sky-500" />
                                    Paciente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {patient && (
                                    <Link to={createPageUrl(`PatientDetail?id=${patient.id}`)}>
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                                                {patient.full_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{patient.full_name}</p>
                                                <p className="text-sm text-slate-500">{patient.phone}</p>
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                {patient?.allergies && (
                                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                                        <div className="flex items-center gap-2 text-amber-700">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span className="font-medium text-sm">Alergias</span>
                                        </div>
                                        <p className="text-sm text-amber-600 mt-1">{patient.allergies}</p>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="mt-6 space-y-2">
                                    <Button 
                                        className="w-full bg-gradient-to-r from-sky-500 to-emerald-500"
                                        onClick={() => setShowPrescription(true)}
                                    >
                                        <Pill className="h-4 w-4 mr-2" />
                                        Nova Receita
                                    </Button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" onClick={() => setShowPrescription(true)}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Atestado
                                        </Button>
                                        <Button variant="outline" onClick={() => setShowExamUploader(true)}>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Exame
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Consultation Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Vital Signs */}
                        {consultation.vital_signs && Object.keys(consultation.vital_signs).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-rose-500" />
                                        Sinais Vitais
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {consultation.vital_signs.blood_pressure && (
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-500">Pressão Arterial</p>
                                                <p className="font-semibold">{consultation.vital_signs.blood_pressure}</p>
                                            </div>
                                        )}
                                        {consultation.vital_signs.heart_rate && (
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-500">Freq. Cardíaca</p>
                                                <p className="font-semibold">{consultation.vital_signs.heart_rate}</p>
                                            </div>
                                        )}
                                        {consultation.vital_signs.temperature && (
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-500">Temperatura</p>
                                                <p className="font-semibold">{consultation.vital_signs.temperature}</p>
                                            </div>
                                        )}
                                        {consultation.vital_signs.oxygen_saturation && (
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-500">SpO₂</p>
                                                <p className="font-semibold">{consultation.vital_signs.oxygen_saturation}</p>
                                            </div>
                                        )}
                                        {consultation.vital_signs.weight && (
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-500">Peso</p>
                                                <p className="font-semibold">{consultation.vital_signs.weight}</p>
                                            </div>
                                        )}
                                        {consultation.vital_signs.height && (
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-500">Altura</p>
                                                <p className="font-semibold">{consultation.vital_signs.height}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Anamnesis */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Anamnese</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {consultation.chief_complaint && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 mb-1">Queixa Principal</p>
                                        <p className="text-slate-900">{consultation.chief_complaint}</p>
                                    </div>
                                )}
                                {consultation.history_present_illness && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 mb-1">História da Doença Atual</p>
                                        <p className="text-slate-900 whitespace-pre-wrap">{consultation.history_present_illness}</p>
                                    </div>
                                )}
                                {consultation.physical_exam && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 mb-1">Exame Físico</p>
                                        <p className="text-slate-900 whitespace-pre-wrap">{consultation.physical_exam}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Diagnosis & Treatment */}
                        {(consultation.diagnosis || consultation.treatment_plan) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Diagnóstico e Conduta</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {consultation.diagnosis && (
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-500 mb-1">Diagnóstico</p>
                                                <p className="text-slate-900">{consultation.diagnosis}</p>
                                            </div>
                                            {consultation.icd_code && (
                                                <Badge variant="outline">{consultation.icd_code}</Badge>
                                            )}
                                        </div>
                                    )}
                                    {consultation.treatment_plan && (
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">Plano de Tratamento</p>
                                            <p className="text-slate-900 whitespace-pre-wrap">{consultation.treatment_plan}</p>
                                        </div>
                                    )}
                                    {consultation.follow_up_date && (
                                        <div className="flex items-center gap-2 p-3 bg-sky-50 rounded-lg">
                                            <Clock className="h-4 w-4 text-sky-500" />
                                            <span className="text-sm text-sky-700">
                                                Retorno agendado para {format(new Date(consultation.follow_up_date), "dd/MM/yyyy")}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Prescriptions */}
                        {prescriptions && prescriptions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-violet-500" />
                                        Documentos Emitidos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {prescriptions.map(prescription => (
                                            <div key={prescription.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    {prescription.type?.includes('receita') ? (
                                                        <Pill className="h-5 w-5 text-violet-500" />
                                                    ) : (
                                                        <FileText className="h-5 w-5 text-violet-500" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">
                                                            {prescription.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            {format(new Date(prescription.created_date), 'dd/MM/yyyy HH:mm')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Exams */}
                        {exams && exams.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-amber-500" />
                                        Exames
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {exams.map(exam => (
                                            <div key={exam.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div>
                                                    <p className="font-medium">{exam.name}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {format(new Date(exam.date), 'dd/MM/yyyy')}
                                                        {exam.laboratory && ` • ${exam.laboratory}`}
                                                    </p>
                                                </div>
                                                {exam.file_url && (
                                                    <a 
                                                        href={exam.file_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                                                    >
                                                        Visualizar
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </div>
            </div>

            <PrescriptionEditor
                open={showPrescription}
                onOpenChange={setShowPrescription}
                patient={patient}
                consultationId={consultationId}
                onSave={createPrescriptionMutation.mutate}
            />

            <ExamUploader
                open={showExamUploader}
                onOpenChange={setShowExamUploader}
                patient={patient}
                consultationId={consultationId}
                onSave={createExamMutation.mutate}
            />
        </div>
    );
}

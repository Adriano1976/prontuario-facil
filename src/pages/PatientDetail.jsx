import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    ArrowLeft, 
    Edit, 
    Phone, 
    Mail, 
    MapPin, 
    Calendar, 
    Heart, 
    AlertTriangle,
    Shield,
    Stethoscope,
    FileText,
    Upload,
    Plus,
    Trash2,
    Clock,
    User
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import ConsultationTimeline from '@/components/medical/ConsultationTimeline';
import ExamUploader from '@/components/medical/ExamUploader';
import PrescriptionEditor from '@/components/medical/PrescriptionEditor';
import { logAccess, ACCESS_ACTIONS } from '@/components/medical/AccessLogger';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Página de detalhe do paciente mostrando perfil completo e histórico médico.
 * Exibe informações do paciente, linha do tempo de consulta, exames e prescrições.
 * Fornece opções para editar dados do paciente e gerenciar registros médicos.
 * Suporta adicionando novos exames e prescrições.
 *
 * @component
 * @returns {JSX.Element} - Página com perfil de paciente, abas para diferentes dados médicos e botões de ação.
 *
 * @example
 * <PatientDetail /> // URL deve conter ?id=paciente-123
 */
export default function PatientDetail() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('id');

    const [showExamUploader, setShowExamUploader] = useState(false);
    const [showPrescription, setShowPrescription] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { data: patientData, isLoading } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: () => base44.entities.Patient.filter({ id: patientId }),
        enabled: !!patientId,
    });

    const patient = patientData?.[0];

    const { data: consultations } = useQuery({
        queryKey: ['consultations', patientId],
        queryFn: () => base44.entities.Consultation.filter({ patient_id: patientId }, '-date'),
        enabled: !!patientId,
    });

    const { data: prescriptions } = useQuery({
        queryKey: ['prescriptions', patientId],
        queryFn: () => base44.entities.Prescription.filter({ patient_id: patientId }, '-created_date'),
        enabled: !!patientId,
    });

    const { data: exams } = useQuery({
        queryKey: ['exams', patientId],
        queryFn: () => base44.entities.Exam.filter({ patient_id: patientId }, '-date'),
        enabled: !!patientId,
    });

    const { data: appointments } = useQuery({
        queryKey: ['appointments', patientId],
        queryFn: () => base44.entities.Appointment.filter({ patient_id: patientId }, '-date'),
        enabled: !!patientId,
    });

    useEffect(() => {
        if (patient) {
            logAccess(ACCESS_ACTIONS.VIEW_PATIENT, 'Patient', patientId, patient.full_name);
        }
    }, [patient, patientId]);

    const createExamMutation = useMutation({
        mutationFn: (data) => base44.entities.Exam.create(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams', patientId] }),
    });

    const createPrescriptionMutation = useMutation({
        mutationFn: (data) => base44.entities.Prescription.create(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prescriptions', patientId] }),
    });

    const deleteMutation = useMutation({
        mutationFn: () => base44.entities.Patient.delete(patientId),
        onSuccess: () => {
            logAccess(ACCESS_ACTIONS.DELETE_RECORD, 'Patient', patientId, patient?.full_name);
            navigate(createPageUrl('Patients'));
        },
    });

    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center">
                <Card className="p-8 text-center">
                    <User className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Paciente não encontrado</h2>
                    <Link to={createPageUrl('Patients')}>
                        <Button>Voltar para lista</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <Link to={createPageUrl('Patients')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                                    {patient.photo_url ? (
                                        <img src={patient.photo_url} alt={patient.full_name} className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        patient.full_name?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">{patient.full_name}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className={patient.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                                            {patient.status}
                                        </Badge>
                                        {patient.blood_type && patient.blood_type !== 'desconhecido' && (
                                            <Badge variant="outline" className="text-rose-600 border-rose-200">
                                                {patient.blood_type}
                                            </Badge>
                                        )}
                                        {patient.lgpd_consent && (
                                            <Badge className="bg-sky-100 text-sky-700">
                                                <Shield className="h-3 w-3 mr-1" />
                                                LGPD
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link to={createPageUrl(`PatientForm?id=${patientId}`)}>
                                <Button variant="outline">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                className="text-rose-600 hover:bg-rose-50"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
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
                                <CardTitle className="text-lg">Informações do Paciente</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {patient.birth_date && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-slate-500">Idade</p>
                                                <p className="font-medium">{calculateAge(patient.birth_date)} anos ({format(new Date(patient.birth_date), 'dd/MM/yyyy')})</p>
                                            </div>
                                        </div>
                                    )}
                                    {patient.phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone className="h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-slate-500">Telefone</p>
                                                <p className="font-medium">{patient.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {patient.email && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-slate-500">Email</p>
                                                <p className="font-medium">{patient.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {patient.address && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-slate-500">Endereço</p>
                                                <p className="font-medium">{patient.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {patient.health_insurance && (
                                    <div className="pt-3 border-t">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Shield className="h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-slate-500">Convênio</p>
                                                <p className="font-medium">{patient.health_insurance}</p>
                                                {patient.insurance_number && (
                                                    <p className="text-xs text-slate-400">Carteirinha: {patient.insurance_number}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(patient.allergies || patient.chronic_conditions || patient.medications_in_use) && (
                                    <div className="pt-3 border-t space-y-3">
                                        {patient.allergies && (
                                            <div className="flex items-start gap-3 text-sm">
                                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                                                <div>
                                                    <p className="text-amber-600 font-medium">Alergias</p>
                                                    <p className="text-slate-600">{patient.allergies}</p>
                                                </div>
                                            </div>
                                        )}
                                        {patient.chronic_conditions && (
                                            <div className="flex items-start gap-3 text-sm">
                                                <Heart className="h-4 w-4 text-rose-500 mt-0.5" />
                                                <div>
                                                    <p className="text-rose-600 font-medium">Condições Crônicas</p>
                                                    <p className="text-slate-600">{patient.chronic_conditions}</p>
                                                </div>
                                            </div>
                                        )}
                                        {patient.medications_in_use && (
                                            <div className="flex items-start gap-3 text-sm">
                                                <FileText className="h-4 w-4 text-violet-500 mt-0.5" />
                                                <div>
                                                    <p className="text-violet-600 font-medium">Medicamentos em Uso</p>
                                                    <p className="text-slate-600">{patient.medications_in_use}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="pt-4 border-t space-y-2">
                                    <Link to={createPageUrl(`NewAppointment?patient_id=${patientId}`)}>
                                        <Button className="w-full bg-gradient-to-r from-sky-500 to-emerald-500">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Agendar Consulta
                                        </Button>
                                    </Link>
                                    <Link to={createPageUrl(`NewConsultation?patient_id=${patientId}`)}>
                                        <Button className="w-full" variant="outline">
                                            <Stethoscope className="h-4 w-4 mr-2" />
                                            Nova Consulta
                                        </Button>
                                    </Link>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" onClick={() => setShowPrescription(true)}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Receita
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

                    {/* Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-sky-500" />
                                    Histórico
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="all">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="all">Todos</TabsTrigger>
                                        <TabsTrigger value="appointments">Agendamentos ({appointments?.length || 0})</TabsTrigger>
                                        <TabsTrigger value="consultations">Consultas ({consultations?.length || 0})</TabsTrigger>
                                        <TabsTrigger value="prescriptions">Documentos ({prescriptions?.length || 0})</TabsTrigger>
                                        <TabsTrigger value="exams">Exames ({exams?.length || 0})</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="all">
                                        <ConsultationTimeline 
                                            consultations={consultations}
                                            prescriptions={prescriptions}
                                            exams={exams}
                                            appointments={appointments}
                                            patientId={patientId}
                                        />
                                    </TabsContent>

                                    <TabsContent value="appointments">
                                        <ConsultationTimeline 
                                            consultations={[]}
                                            prescriptions={[]}
                                            exams={[]}
                                            appointments={appointments}
                                            patientId={patientId}
                                        />
                                    </TabsContent>

                                    <TabsContent value="consultations">
                                        <ConsultationTimeline 
                                            consultations={consultations}
                                            prescriptions={[]}
                                            exams={[]}
                                            patientId={patientId}
                                        />
                                    </TabsContent>

                                    <TabsContent value="prescriptions">
                                        <ConsultationTimeline 
                                            consultations={[]}
                                            prescriptions={prescriptions}
                                            exams={[]}
                                            patientId={patientId}
                                        />
                                    </TabsContent>

                                    <TabsContent value="exams">
                                        <ConsultationTimeline 
                                            consultations={[]}
                                            prescriptions={[]}
                                            exams={exams}
                                            patientId={patientId}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            <ExamUploader
                open={showExamUploader}
                onOpenChange={setShowExamUploader}
                patient={patient}
                onSave={createExamMutation.mutate}
            />

            <PrescriptionEditor
                open={showPrescription}
                onOpenChange={setShowPrescription}
                patient={patient}
                onSave={createPrescriptionMutation.mutate}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir paciente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Todos os dados do paciente serão permanentemente excluídos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => deleteMutation.mutate()}
                            className="bg-rose-600 hover:bg-rose-700"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

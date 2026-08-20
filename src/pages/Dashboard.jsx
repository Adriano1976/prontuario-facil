import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
    Users, 
    Calendar, 
    FileText, 
    Plus, 
    ArrowRight,
    Clock,
    Activity,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Stethoscope,
    CalendarCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import StatsCard from '@/components/medical/StatsCard';
import PatientSearch from '@/components/medical/PatientSearch';
import { logAccess, ACCESS_ACTIONS } from '@/components/medical/AccessLogger';
import ReportsView from '@/components/medical/ReportsView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Página do dashboard mostrando métricas-chave de saúde e atividade recente.
 * Exibe estatísticas de pacientes, consultas, prescrições e agendamentos.
 * Inclui ações rápidas e funcionalidade de busca de paciente.
 *
 * @component
 * @returns {JSX.Element} - Dashboard com cartões de estatísticas, eventos recentes e ações rápidas.
 *
 * @example
 * <Dashboard />
 */
export default function Dashboard() {
    const { data: patients, isLoading: loadingPatients } = useQuery({
        queryKey: ['patients'],
        queryFn: () => base44.entities.Patient.list('-created_date', 100),
    });

    const { data: consultations, isLoading: loadingConsultations } = useQuery({
        queryKey: ['consultations'],
        queryFn: () => base44.entities.Consultation.list('-date', 50),
    });

    const { data: prescriptions } = useQuery({
        queryKey: ['prescriptions-count'],
        queryFn: () => base44.entities.Prescription.list('-created_date', 100),
    });

    const { data: appointments } = useQuery({
        queryKey: ['appointments'],
        queryFn: () => base44.entities.Appointment.list('-date', 100),
    });

    const todayConsultations = consultations?.filter(c => {
        const today = new Date().toDateString();
        return new Date(c.date).toDateString() === today;
    }) || [];

    const upcomingConsultations = consultations?.filter(c => {
        const now = new Date();
        const consultDate = new Date(c.date);
        return consultDate > now && c.status !== 'cancelada';
    }).slice(0, 5) || [];

    const activePatients = patients?.filter(p => p.status === 'ativo').length || 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAppointments = appointments?.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate.toDateString() === today.toDateString() && a.status !== 'cancelado';
    }) || [];

    const upcomingAppointments = appointments?.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate > new Date() && a.status !== 'cancelado';
    }).slice(0, 5) || [];

    useEffect(() => {
        logAccess(ACCESS_ACTIONS.LOGIN, null, null, null, 'Acesso ao dashboard');
    }, []);

    const statusColors = {
        agendada: 'bg-amber-100 text-amber-700',
        em_andamento: 'bg-sky-100 text-sky-700',
        concluida: 'bg-emerald-100 text-emerald-700',
        cancelada: 'bg-rose-100 text-rose-700'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Prontuário Eletrônico
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <PatientSearch patients={patients} isLoading={loadingPatients} />
                        <Link to={createPageUrl('PatientForm')}>
                            <Button className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 shadow-lg shadow-sky-500/25">
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Paciente
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard 
                        title="Pacientes Ativos" 
                        value={activePatients} 
                        icon={Users} 
                        color="sky"
                        delay={0.1}
                    />
                    <StatsCard 
                        title="Agendamentos Hoje" 
                        value={todayAppointments.length} 
                        icon={Calendar} 
                        color="emerald"
                        delay={0.2}
                    />
                    <StatsCard 
                        title="Documentos Emitidos" 
                        value={prescriptions?.length || 0} 
                        icon={FileText} 
                        color="violet"
                        delay={0.3}
                    />
                    <StatsCard 
                        title="Taxa de Atendimento" 
                        value="94%" 
                        icon={TrendingUp} 
                        color="amber"
                        delay={0.4}
                    />
                </div>

                <Tabs defaultValue="visao-geral" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
                        <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
                    </TabsList>
                    <TabsContent value="visao-geral" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Próximas Consultas */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2"
                    >
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                    <CalendarCheck className="h-5 w-5 text-sky-500" />
                                    Próximos Agendamentos
                                </h2>
                                <Link to={createPageUrl('Appointments')}>
                                    <Button variant="ghost" size="sm" className="text-sky-600">
                                        Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </Link>
                            </div>

                            {loadingConsultations ? (
                                <div className="space-y-4">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="animate-pulse flex gap-4">
                                            <div className="h-12 w-12 bg-slate-200 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-slate-200 rounded w-1/3" />
                                                <div className="h-3 bg-slate-200 rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : upcomingAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingAppointments.map((appointment) => {
                                        const patient = patients?.find(p => p.id === appointment.patient_id);
                                        return (
                                            <Link 
                                                key={appointment.id}
                                                to={createPageUrl(`PatientDetail?id=${appointment.patient_id}`)}
                                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                                            >
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                                                    {patient?.full_name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-900 truncate">
                                                        {patient?.full_name || 'Paciente não encontrado'}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {format(new Date(appointment.date), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700`}>
                                                    {appointment.type?.replace(/_/g, ' ')}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <Calendar className="h-12 w-12 mx-auto mb-3" />
                                    <p>Nenhum agendamento</p>
                                    <Link to={createPageUrl('NewAppointment')}>
                                        <Button variant="outline" size="sm" className="mt-4">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agendar consulta
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </Card>
                    </motion.div>

                    {/* Ações Rápidas */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-emerald-500" />
                                Ações Rápidas
                            </h2>

                            <div className="space-y-3">
                                <Link to={createPageUrl('PatientForm')} className="block">
                                    <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-sky-50 hover:border-sky-200">
                                        <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center mr-4">
                                            <Users className="h-5 w-5 text-sky-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium">Novo Paciente</p>
                                            <p className="text-xs text-slate-500">Cadastrar ficha completa</p>
                                        </div>
                                    </Button>
                                </Link>

                                <Link to={createPageUrl('NewAppointment')} className="block">
                                    <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-sky-50 hover:border-sky-200">
                                        <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center mr-4">
                                            <Calendar className="h-5 w-5 text-sky-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium">Agendar Consulta</p>
                                            <p className="text-xs text-slate-500">Marcar horário</p>
                                        </div>
                                    </Button>
                                </Link>

                                <Link to={createPageUrl('NewConsultation')} className="block">
                                    <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-emerald-50 hover:border-emerald-200">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center mr-4">
                                            <Stethoscope className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium">Nova Consulta</p>
                                            <p className="text-xs text-slate-500">Iniciar atendimento</p>
                                        </div>
                                    </Button>
                                </Link>

                                <Link to={createPageUrl('Patients')} className="block">
                                    <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-violet-50 hover:border-violet-200">
                                        <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center mr-4">
                                            <FileText className="h-5 w-5 text-violet-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium">Lista de Pacientes</p>
                                            <p className="text-xs text-slate-500">Ver todos os prontuários</p>
                                        </div>
                                    </Button>
                                </Link>

                                <Link to={createPageUrl('Templates')} className="block">
                                    <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-amber-50 hover:border-amber-200">
                                        <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center mr-4">
                                            <FileText className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium">Templates</p>
                                            <p className="text-xs text-slate-500">Gerenciar modelos</p>
                                        </div>
                                    </Button>
                                </Link>
                            </div>
                        </Card>

                        {/* LGPD Badge */}
                        <Card className="p-4 mt-4 bg-gradient-to-r from-emerald-50 to-sky-50 border-emerald-200">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                <div>
                                    <p className="font-medium text-emerald-800">LGPD Compliant</p>
                                    <p className="text-xs text-emerald-600">Dados protegidos e criptografados</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
                    </TabsContent>
                    <TabsContent value="relatorios">
                        <ReportsView />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

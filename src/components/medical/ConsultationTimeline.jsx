import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Calendar, 
    Clock, 
    Stethoscope, 
    FileText, 
    Pill, 
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
    agendada: { label: 'Agendada', color: 'bg-amber-100 text-amber-700', icon: Clock },
    em_andamento: { label: 'Em Andamento', color: 'bg-sky-100 text-sky-700', icon: Stethoscope },
    concluida: { label: 'Concluída', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    cancelada: { label: 'Cancelada', color: 'bg-rose-100 text-rose-700', icon: XCircle },
};

/**
 * Componente de linha do tempo exibindo histórico de consultas do paciente com eventos associados.
 * Mostra consultas, prescrições, exames e agendamentos em ordem cronológica.
 * Cada tipo de evento tem estilos distintos e ícones para rápida identificação visual.
 *
 * @component
 * @param {Object} props - Props do componente.
 * @param {Array<Object>} props.consultations - Array de objetos de consulta com datas e status.
 * @param {Array<Object>} props.prescriptions - Array de objetos de prescrição.
 * @param {Array<Object>} props.exams - Array de objetos de exame.
 * @param {Array<Object>} props.appointments - Array de objetos de agendamento.
 * @param {string} props.patientId - ID do paciente cuja linha do tempo é exibida.
 * @returns {JSX.Element} - Linha do tempo vertical com cartões de eventos.
 *
 * @example
 * <ConsultationTimeline
 *   consultations={consultations}
 *   prescriptions={prescriptions}
 *   exams={exams}
 *   appointments={appointments}
 *   patientId="paciente-123"
 * />
 */
export default function ConsultationTimeline({ consultations, prescriptions, exams, appointments, patientId }) {
    // Combine and sort by date
    const events = [
        ...(consultations?.map(c => ({ ...c, eventType: 'consultation' })) || []),
        ...(prescriptions?.map(p => ({ ...p, eventType: 'prescription', date: p.created_date })) || []),
        ...(exams?.map(e => ({ ...e, eventType: 'exam' })) || []),
        ...(appointments?.map(a => ({ ...a, eventType: 'appointment' })) || []),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (events.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <Calendar className="h-12 w-12 mx-auto mb-3" />
                <p>Nenhum histórico encontrado</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
            
            <div className="space-y-4">
                {events.map((event, index) => (
                    <motion.div
                        key={`${event.eventType}-${event.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pl-14"
                    >
                        <div className={`
                            absolute left-4 w-5 h-5 rounded-full border-2 border-white shadow
                            ${event.eventType === 'consultation' ? 'bg-sky-500' : 
                              event.eventType === 'prescription' ? 'bg-violet-500' :
                              event.eventType === 'appointment' ? 'bg-emerald-500' : 'bg-amber-500'}
                        `} />

                        {event.eventType === 'consultation' && (
                            <Card className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Stethoscope className="h-4 w-4 text-sky-500" />
                                            <span className="font-medium text-slate-900">Consulta</span>
                                            <Badge className={STATUS_CONFIG[event.status]?.color}>
                                                {STATUS_CONFIG[event.status]?.label}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                                        </p>
                                        {event.chief_complaint && (
                                            <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                                                <strong>Queixa:</strong> {event.chief_complaint}
                                            </p>
                                        )}
                                        {event.diagnosis && (
                                            <p className="text-sm text-slate-600 mt-1">
                                                <strong>Diagnóstico:</strong> {event.diagnosis}
                                            </p>
                                        )}
                                    </div>
                                    <Link to={createPageUrl(`Consultation?id=${event.id}`)}>
                                        <Button variant="ghost" size="icon">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        )}

                        {event.eventType === 'prescription' && (
                            <Card className="p-4 hover:shadow-md transition-shadow bg-violet-50/50">
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                        {event.type?.includes('receita') ? (
                                            <Pill className="h-4 w-4 text-violet-600" />
                                        ) : (
                                            <FileText className="h-4 w-4 text-violet-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">
                                            {event.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {format(new Date(event.date), "dd/MM/yyyy", { locale: ptBR })}
                                        </p>
                                        {event.medications?.length > 0 && (
                                            <p className="text-sm text-slate-600 mt-1">
                                                {event.medications.length} medicamento(s)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )}

                        {event.eventType === 'exam' && (
                            <Card className="p-4 hover:shadow-md transition-shadow bg-amber-50/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{event.name}</p>
                                            <p className="text-sm text-slate-500">
                                                {format(new Date(event.date), "dd/MM/yyyy", { locale: ptBR })}
                                                {event.laboratory && ` • ${event.laboratory}`}
                                            </p>
                                        </div>
                                    </div>
                                    {event.file_url && (
                                        <a 
                                            href={event.file_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                                        >
                                            Visualizar
                                        </a>
                                    )}
                                </div>
                            </Card>
                        )}

                        {event.eventType === 'appointment' && (
                            <Card className="p-4 hover:shadow-md transition-shadow bg-emerald-50/50">
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <Calendar className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">Agendamento</p>
                                        <p className="text-sm text-slate-500">
                                            {format(new Date(event.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </p>
                                        <Badge className={`mt-2 ${
                                            event.status === 'confirmado' ? 'bg-sky-100 text-sky-700' :
                                            event.status === 'concluido' ? 'bg-emerald-100 text-emerald-700' :
                                            event.status === 'cancelado' ? 'bg-slate-100 text-slate-600' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {event.status?.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

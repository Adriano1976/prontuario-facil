import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Plus, 
    Search, 
    Calendar,
    Stethoscope,
    ChevronRight,
    Filter,
    ArrowLeft,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
    agendada: { label: 'Agendada', color: 'bg-amber-100 text-amber-700' },
    em_andamento: { label: 'Em Andamento', color: 'bg-sky-100 text-sky-700' },
    concluida: { label: 'Concluída', color: 'bg-emerald-100 text-emerald-700' },
    cancelada: { label: 'Cancelada', color: 'bg-rose-100 text-rose-700' },
};

export default function Consultations() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    const { data: consultations, isLoading: loadingConsultations } = useQuery({
        queryKey: ['consultations'],
        queryFn: () => base44.entities.Consultation.list('-date'),
    });

    const { data: patients } = useQuery({
        queryKey: ['patients'],
        queryFn: () => base44.entities.Patient.list(),
    });

    const getPatient = (patientId) => patients?.find(p => p.id === patientId);

    const filteredConsultations = consultations?.filter(c => {
        const patient = getPatient(c.patient_id);
        const matchesSearch = !search || 
            patient?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            c.chief_complaint?.toLowerCase().includes(search.toLowerCase()) ||
            c.diagnosis?.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

        let matchesDate = true;
        if (dateFilter !== 'all') {
            const consultDate = new Date(c.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dateFilter === 'today') {
                matchesDate = consultDate.toDateString() === today.toDateString();
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                matchesDate = consultDate >= weekAgo;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                matchesDate = consultDate >= monthAgo;
            } else if (dateFilter === 'upcoming') {
                matchesDate = consultDate > new Date();
            }
        }
        
        return matchesSearch && matchesStatus && matchesDate;
    }) || [];

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
                                <Stethoscope className="h-8 w-8 text-sky-500" />
                                Consultas
                            </h1>
                            <p className="text-slate-500 mt-1">{filteredConsultations.length} consultas encontradas</p>
                        </div>
                    </div>
                    <Link to={createPageUrl('NewConsultation')}>
                        <Button className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Consulta
                        </Button>
                    </Link>
                </motion.div>

                {/* Filters */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 mb-6"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por paciente, queixa ou diagnóstico..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos Status</SelectItem>
                            <SelectItem value="agendada">Agendada</SelectItem>
                            <SelectItem value="em_andamento">Em Andamento</SelectItem>
                            <SelectItem value="concluida">Concluída</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as datas</SelectItem>
                            <SelectItem value="today">Hoje</SelectItem>
                            <SelectItem value="week">Última semana</SelectItem>
                            <SelectItem value="month">Último mês</SelectItem>
                            <SelectItem value="upcoming">Próximas</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>

                {/* Consultation List */}
                {loadingConsultations ? (
                    <div className="grid gap-4">
                        {[1,2,3,4].map(i => (
                            <Card key={i} className="p-6 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="h-14 w-14 bg-slate-200 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-slate-200 rounded w-1/3" />
                                        <div className="h-4 bg-slate-200 rounded w-1/4" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : filteredConsultations.length > 0 ? (
                    <div className="grid gap-4">
                        {filteredConsultations.map((consultation, index) => {
                            const patient = getPatient(consultation.patient_id);
                            return (
                                <motion.div
                                    key={consultation.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link to={createPageUrl(`Consultation?id=${consultation.id}`)}>
                                        <Card className="p-6 hover:shadow-lg transition-all hover:border-sky-200 cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white text-xl font-semibold shrink-0">
                                                    {patient?.full_name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-slate-900 truncate">
                                                            {patient?.full_name || 'Paciente não encontrado'}
                                                        </h3>
                                                        <Badge className={STATUS_CONFIG[consultation.status]?.color}>
                                                            {STATUS_CONFIG[consultation.status]?.label}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {format(new Date(consultation.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                        </span>
                                                        {consultation.chief_complaint && (
                                                            <span className="truncate max-w-[200px]">
                                                                {consultation.chief_complaint}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="hidden md:flex items-center gap-4 text-sm text-slate-500">
                                                    {consultation.diagnosis && (
                                                        <Badge variant="outline">{consultation.diagnosis}</Badge>
                                                    )}
                                                    {consultation.follow_up_date && (
                                                        <span className="flex items-center gap-1 text-sky-600">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            Retorno: {format(new Date(consultation.follow_up_date), 'dd/MM')}
                                                        </span>
                                                    )}
                                                </div>

                                                <ChevronRight className="h-5 w-5 text-slate-400" />
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <Stethoscope className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma consulta encontrada</h3>
                        <p className="text-slate-500 mb-6">
                            {search || statusFilter !== 'all' || dateFilter !== 'all'
                                ? 'Tente ajustar os filtros de busca' 
                                : 'Comece agendando a primeira consulta'}
                        </p>
                        <Link to={createPageUrl('NewConsultation')}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Consulta
                            </Button>
                        </Link>
                    </Card>
                )}
            </div>
        </div>
    );
}

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
    Search, 
    Shield,
    ArrowLeft,
    Filter,
    Calendar,
    User,
    Eye,
    Edit,
    Plus,
    Trash2,
    Download,
    LogIn
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

const ACTION_CONFIG = {
    login: { label: 'Login', color: 'bg-sky-100 text-sky-700', icon: LogIn },
    logout: { label: 'Logout', color: 'bg-slate-100 text-slate-700', icon: LogIn },
    view_patient: { label: 'Visualizar Paciente', color: 'bg-emerald-100 text-emerald-700', icon: Eye },
    edit_patient: { label: 'Editar Paciente', color: 'bg-amber-100 text-amber-700', icon: Edit },
    create_patient: { label: 'Criar Paciente', color: 'bg-violet-100 text-violet-700', icon: Plus },
    view_consultation: { label: 'Visualizar Consulta', color: 'bg-emerald-100 text-emerald-700', icon: Eye },
    create_consultation: { label: 'Criar Consulta', color: 'bg-violet-100 text-violet-700', icon: Plus },
    edit_consultation: { label: 'Editar Consulta', color: 'bg-amber-100 text-amber-700', icon: Edit },
    create_prescription: { label: 'Criar Receita', color: 'bg-violet-100 text-violet-700', icon: Plus },
    upload_exam: { label: 'Upload Exame', color: 'bg-sky-100 text-sky-700', icon: Download },
    delete_record: { label: 'Excluir Registro', color: 'bg-rose-100 text-rose-700', icon: Trash2 },
    export_data: { label: 'Exportar Dados', color: 'bg-amber-100 text-amber-700', icon: Download },
};

/**
 * Página de logs de acesso para auditoria e conformidade.
 * Exibe todas as ações de usuário no sistema para conformidade LGPD e segurança.
 * Suporta filtro por tipo de ação, intervalo de data e usuário.
 * Mostra paciente, usuário, timestamp e informações detalhadas de ação.
 *
 * @component
 * @returns {JSX.Element} - Página com tabela de logs de acesso, barra de busca e opções de filtro.
 *
 * @example
 * <AccessLogs />
 */
export default function AccessLogs() {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    const { data: logs, isLoading } = useQuery({
        queryKey: ['access-logs'],
        queryFn: () => base44.entities.AccessLog.list('-created_date', 500),
    });

    const filteredLogs = logs?.filter(log => {
        const matchesSearch = !search || 
            log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
            log.patient_name?.toLowerCase().includes(search.toLowerCase());
        
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;

        let matchesDate = true;
        if (dateFilter !== 'all') {
            const logDate = new Date(log.created_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dateFilter === 'today') {
                matchesDate = logDate.toDateString() === today.toDateString();
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                matchesDate = logDate >= weekAgo;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                matchesDate = logDate >= monthAgo;
            }
        }
        
        return matchesSearch && matchesAction && matchesDate;
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
                                <Shield className="h-8 w-8 text-emerald-500" />
                                Logs de Acesso
                            </h1>
                            <p className="text-slate-500 mt-1">Auditoria e rastreamento de ações - LGPD</p>
                        </div>
                    </div>
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
                            placeholder="Buscar por usuário ou paciente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as ações</SelectItem>
                            {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                            ))}
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
                        </SelectContent>
                    </Select>
                </motion.div>

                {/* Stats */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                >
                    <Card className="p-4">
                        <p className="text-sm text-slate-500">Total de Logs</p>
                        <p className="text-2xl font-bold text-slate-900">{logs?.length || 0}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-slate-500">Visualizações</p>
                        <p className="text-2xl font-bold text-emerald-600">
                            {logs?.filter(l => l.action?.includes('view')).length || 0}
                        </p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-slate-500">Edições</p>
                        <p className="text-2xl font-bold text-amber-600">
                            {logs?.filter(l => l.action?.includes('edit') || l.action?.includes('create')).length || 0}
                        </p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-slate-500">Exclusões</p>
                        <p className="text-2xl font-bold text-rose-600">
                            {logs?.filter(l => l.action?.includes('delete')).length || 0}
                        </p>
                    </Card>
                </motion.div>

                {/* Logs Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data/Hora</TableHead>
                                        <TableHead>Usuário</TableHead>
                                        <TableHead>Ação</TableHead>
                                        <TableHead>Paciente</TableHead>
                                        <TableHead>Detalhes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={5}>
                                                    <div className="h-12 animate-pulse bg-slate-100 rounded" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredLogs.length > 0 ? (
                                        filteredLogs.map((log, index) => {
                                            const config = ACTION_CONFIG[log.action] || { label: log.action, color: 'bg-slate-100 text-slate-700', icon: Eye };
                                            const Icon = config.icon;
                                            
                                            return (
                                                <TableRow key={log.id}>
                                                    <TableCell className="whitespace-nowrap">
                                                        <div className="text-sm">
                                                            <p className="font-medium">{format(new Date(log.created_date), 'dd/MM/yyyy')}</p>
                                                            <p className="text-slate-500">{format(new Date(log.created_date), 'HH:mm:ss')}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                                <User className="h-4 w-4 text-slate-500" />
                                                            </div>
                                                            <span className="text-sm truncate max-w-[150px]">{log.user_email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={`${config.color} flex items-center gap-1 w-fit`}>
                                                            <Icon className="h-3 w-3" />
                                                            {config.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {log.patient_name ? (
                                                            <span className="text-sm">{log.patient_name}</span>
                                                        ) : (
                                                            <span className="text-sm text-slate-400">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-slate-500 truncate max-w-[200px] block">
                                                            {log.details || '-'}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                                <Shield className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                                Nenhum log encontrado
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

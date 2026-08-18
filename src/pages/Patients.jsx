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
    Users, 
    Phone, 
    Mail, 
    Calendar,
    ChevronRight,
    Filter,
    ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

/**
 * Página de lista de pacientes com capacidades de busca e filtro.
 * Mostra todos os pacientes registrados com suas informações-chave.
 * Suporta filtragem por status e busca por nome, CPF, telefone ou email.
 * Fornece navegação para detalhes de paciente e criação de novo paciente.
 *
 * @component
 * @returns {JSX.Element} - Página com tabela de pacientes, barra de busca e opções de filtro.
 *
 * @example
 * <Patients />
 */
export default function Patients() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data: patients, isLoading } = useQuery({
        queryKey: ['patients'],
        queryFn: () => base44.entities.Patient.list('-created_date'),
    });

    const filteredPatients = patients?.filter(p => {
        const matchesSearch = 
            p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            p.cpf?.includes(search) ||
            p.phone?.includes(search) ||
            p.email?.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    }) || [];

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
                            <h1 className="text-3xl font-bold text-slate-900">Pacientes</h1>
                            <p className="text-slate-500 mt-1">{filteredPatients.length} pacientes cadastrados</p>
                        </div>
                    </div>
                    <Link to={createPageUrl('PatientForm')}>
                        <Button className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Paciente
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
                            placeholder="Buscar por nome, CPF, telefone ou email..."
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
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="ativo">Ativos</SelectItem>
                            <SelectItem value="inativo">Inativos</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>

                {/* Patient List */}
                {isLoading ? (
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
                ) : filteredPatients.length > 0 ? (
                    <div className="grid gap-4">
                        {filteredPatients.map((patient, index) => (
                            <motion.div
                                key={patient.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link to={createPageUrl(`PatientDetail?id=${patient.id}`)}>
                                    <Card className="p-6 hover:shadow-lg transition-all hover:border-sky-200 cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white text-xl font-semibold shrink-0">
                                                {patient.photo_url ? (
                                                    <img src={patient.photo_url} alt={patient.full_name} className="h-full w-full rounded-full object-cover" />
                                                ) : (
                                                    patient.full_name?.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-slate-900 truncate">{patient.full_name}</h3>
                                                    <Badge className={patient.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                                                        {patient.status}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                                                    {patient.birth_date && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {calculateAge(patient.birth_date)} anos
                                                        </span>
                                                    )}
                                                    {patient.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3.5 w-3.5" />
                                                            {patient.phone}
                                                        </span>
                                                    )}
                                                    {patient.email && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="h-3.5 w-3.5" />
                                                            {patient.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="hidden md:flex items-center gap-4 text-sm text-slate-500">
                                                {patient.health_insurance && (
                                                    <Badge variant="outline">{patient.health_insurance}</Badge>
                                                )}
                                                {patient.blood_type && patient.blood_type !== 'desconhecido' && (
                                                    <Badge variant="outline" className="text-rose-600 border-rose-200">
                                                        {patient.blood_type}
                                                    </Badge>
                                                )}
                                            </div>

                                            <ChevronRight className="h-5 w-5 text-slate-400" />
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <Users className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum paciente encontrado</h3>
                        <p className="text-slate-500 mb-6">
                            {search || statusFilter !== 'all' 
                                ? 'Tente ajustar os filtros de busca' 
                                : 'Comece cadastrando o primeiro paciente'}
                        </p>
                        <Link to={createPageUrl('PatientForm')}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Cadastrar Paciente
                            </Button>
                        </Link>
                    </Card>
                )}
            </div>
        </div>
    );
}

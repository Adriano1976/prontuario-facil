import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * Componente de busca para encontrar pacientes por nome, CPF ou telefone.
 * Exibe resultados filtrados em dropdown com links de navegação.
 *
 * @component
 * @param {Object} props - Props do componente.
 * @param {Array<Object>} props.patients - Array de objetos de paciente a pesquisar.
 * @param {string} props.patients[].id - Identificador único do paciente.
 * @param {string} props.patients[].full_name - Nome completo do paciente.
 * @param {string} [props.patients[].cpf] - Número do CPF do paciente.
 * @param {string} [props.patients[].phone] - Telefone do paciente.
 * @param {boolean} props.isLoading - Se a lista de pacientes está carregando.
 * @returns {JSX.Element} - Input de busca com dropdown de resultados animado.
 *
 * @example
 * <PatientSearch patients={listaPacientes} isLoading={carregandoPacientes} />
 */
export default function PatientSearch({ patients, isLoading }) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const filteredPatients = patients?.filter(p => 
        p.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        p.cpf?.includes(query) ||
        p.phone?.includes(query)
    ).slice(0, 5) || [];

    const showResults = isFocused && query.length >= 2;

    return (
        <div className="relative w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Buscar paciente (nome, CPF ou telefone)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    className="pl-10 pr-10 h-11 bg-white border-slate-200 focus:border-sky-500 focus:ring-sky-500/20"
                />
                {query && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setQuery('')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {showResults && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden"
                    >
                        {isLoading ? (
                            <div className="p-4 text-center text-slate-500">Buscando...</div>
                        ) : filteredPatients.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {filteredPatients.map(patient => (
                                    <Link
                                        key={patient.id}
                                        to={createPageUrl(`PatientDetail?id=${patient.id}`)}
                                        className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white font-medium">
                                            {patient.full_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate">{patient.full_name}</p>
                                            <p className="text-sm text-slate-500">{patient.phone}</p>
                                        </div>
                                        {patient.status === 'ativo' ? (
                                            <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Ativo</span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">Inativo</span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-slate-500">
                                <User className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                <p>Nenhum paciente encontrado</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

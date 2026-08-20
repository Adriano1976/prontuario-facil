import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subMonths, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { BarChart3, Trophy, CalendarDays, Activity } from 'lucide-react';

export default function ReportsView() {
    const { data: appointments, isLoading } = useQuery({
        queryKey: ['appointments-completed'],
        queryFn: () => base44.entities.Appointment.filter({ status: 'concluido' }, '-date', 500),
    });

    const { data: doctors, isLoading: loadingDoctors } = useQuery({
        queryKey: ['doctors-reports'],
        queryFn: () => base44.entities.Doctor.list('-created_date', 200),
    });

    const monthlyData = useMemo(() => {
        const now = new Date();
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const monthDate = subMonths(now, i);
            months.push({
                month: format(monthDate, 'MMM/yy', { locale: ptBR }),
                key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
                consultas: 0,
            });
        }
        if (!appointments) return months;
        const cutoff = subMonths(now, 12);
        appointments.forEach(a => {
            const d = new Date(a.date);
            if (isAfter(d, cutoff)) {
                const idx = months.findIndex(m => m.key === `${d.getFullYear()}-${d.getMonth()}`);
                if (idx >= 0) months[idx].consultas++;
            }
        });
        return months;
    }, [appointments]);

    const specialtyData = useMemo(() => {
        if (!appointments || !doctors) return [];
        const counts = {};
        appointments.forEach(a => {
            const doctor = doctors.find(d => d.id === a.doctor_id);
            const specialty = doctor?.specialty || 'Não especificada';
            counts[specialty] = (counts[specialty] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [appointments, doctors]);

    const totalConsultations = monthlyData.reduce((sum, m) => sum + m.consultas, 0);
    const maxSpecialty = specialtyData[0]?.count || 0;
    const isDataLoading = isLoading || loadingDoctors;

    if (isDataLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center">
                            <CalendarDays className="h-5 w-5 text-sky-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Consultas no período</p>
                            <p className="text-2xl font-bold text-slate-900">{totalConsultations}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm text-slate-500">Especialidade campeã</p>
                            <p className="text-2xl font-bold text-slate-900 truncate">{specialtyData[0]?.name || '—'}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
                            <Activity className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Média mensal</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {totalConsultations > 0 ? Math.round(totalConsultations / 12) : 0}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Monthly volume chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-sky-500" />
                        Volume de Consultas por Mês
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">Últimos 12 meses</p>
                    {totalConsultations === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <BarChart3 className="h-12 w-12 mx-auto mb-3" />
                            <p>Nenhuma consulta concluída no período</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(14,165,233,0.08)' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                    formatter={(value) => [`${value} consultas`, 'Consultas']}
                                />
                                <Bar dataKey="consultas" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </motion.div>

            {/* Specialty ranking */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-emerald-500" />
                        Especialidades Mais Atendidas
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">Ranking por volume de consultas</p>
                    {specialtyData.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Trophy className="h-12 w-12 mx-auto mb-3" />
                            <p>Nenhuma especialidade registrada</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {specialtyData.map((item, index) => {
                                const pct = maxSpecialty > 0 ? (item.count / maxSpecialty) * 100 : 0;
                                const overallPct = totalConsultations > 0 ? Math.round((item.count / totalConsultations) * 100) : 0;
                                const isChampion = index === 0;
                                return (
                                    <div key={item.name} className="flex items-center gap-4">
                                        <div className={`flex items-center justify-center h-8 w-8 rounded-lg text-sm font-bold flex-shrink-0 ${
                                            isChampion ? 'bg-gradient-to-br from-emerald-500 to-sky-500 text-white' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="font-medium text-slate-900 truncate">{item.name}</span>
                                                    {isChampion && (
                                                        <Badge className="bg-emerald-100 text-emerald-700 border-0 flex-shrink-0">
                                                            <Trophy className="h-3 w-3 mr-1" /> Campeã
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-sm text-slate-500 flex-shrink-0 ml-2">
                                                    {item.count} <span className="text-slate-400">({overallPct}%)</span>
                                                </span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
                                                    className={`h-full rounded-full ${
                                                        isChampion ? 'bg-gradient-to-r from-emerald-500 to-sky-500' : 'bg-sky-400'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}

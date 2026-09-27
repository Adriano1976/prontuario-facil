import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toSessionUser } from '@/lib/session';
import { isAdminScope, resolveScope } from '@/api/sessionScope';
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
import type { LucideIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import type { AccessLogAction } from '@/types';

const ACTION_CONFIG: Record<
  AccessLogAction,
  { label: string; color: string; icon: LucideIcon }
> = {
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

/** Ação selecionável no filtro. */
type ActionFilter = 'all' | AccessLogAction;
/** Intervalo selecionável no filtro de data. */
type DateFilter = 'all' | 'today' | 'week' | 'month';

/**
 * Página de logs de acesso para auditoria e conformidade.
 * Exibe todas as ações de usuário no sistema para conformidade LGPD e segurança.
 * Suporta filtro por tipo de ação, intervalo de data e usuário.
 * Mostra paciente, usuário, timestamp e informações detalhadas de ação.
 *
 * PARIDADE: comportamento e aparência idênticos ao anterior **dentro do recorte**. Continuam
 * iguais: o tamanho do recorte (500), a ordenação por criação decrescente, a busca por
 * usuário/paciente, os filtros de ação e de intervalo, os indicadores e a tabela.
 *
 * ⚠️ PARIDADE ROMPIDA DE PROPÓSITO — paginação. A tela lia 500 registros e **não tinha como passar
 * deles**: acima de 500, o registro mais antigo era inalcançável e nada dizia que a lista era
 * parcial. A feature `017` fechou `G-02`: a leitura passou a ter deslocamento e a tela navega entre
 * recortes. `BR-L04` deixou de ser teto absoluto e passou a ser o tamanho do recorte. O rótulo
 * "Total de Logs" virou "Logs neste recorte", porque ele sempre mediu o conjunto carregado.
 *
 * ⚠️ A BUSCA CONTINUA SENDO DO CLIENTE, e por isso alcança apenas o recorte exibido. A tela DECLARA
 * isso em vez de deixar o usuário concluir que o registro não existe — numa tela de auditoria, uma
 * busca que não encontra sem dizer por quê é pior que uma busca lenta.
 *
 * PARIDADE DE LEITURA, **com uma exceção declarada**: a leitura deixou de ser feita
 * pelo repositório cru. A trilha é admin-only (BR-MIGRAR-024) e o escopo administrativo
 * passou a ser DECLARADO (correção do achado F-04, 2026-09-24) — a omissão anterior está
 * registrada no watch `W006` da feature 006 e no adendo da correção. O limite e a
 * ordenação do pedido continuam exatamente os mesmos.
 *
 * A inserção na trilha sempre declarou o seu escopo (`AccessLogger`), e a leitura era a
 * única operação desta entidade feita sem escopo nenhum.
 */

/**
 * Declara a leitura da trilha com escopo administrativo.
 *
 * A restrição é do servidor, e continua sendo; o que a camada entrega é a
 * OBRIGATORIEDADE DE CONTRATO: `asAdmin` aceita apenas escopo administrativo, então o
 * caminho de quem não é admin precisa ser dito em vez de ficar implícito. Para um
 * escopo de dono, a resposta é o conjunto vazio — a leitura não vaza dado e não chega a
 * perguntar ao servidor.
 */
/** Quantos registros por recorte (`RN-08`) — o mesmo valor que o legado usava como teto. */
export const RECORTE_POR_PAGINA = 500;

/**
 * Lê UM recorte da trilha.
 *
 * Pede **um registro a mais** do que exibe: o excedente é o que diz que há recorte seguinte. O
 * contrato não tem operação de contagem, e esta feature não a criou (`RN-07`) — sem o excedente,
 * um recorte cheio seria indistinguível do último.
 */
const leituraDaTrilha = async (pagina: number) => {
  const scope = resolveScope(toSessionUser(await base44.auth.me()));
  if (!isAdminScope(scope)) return [];
  const inicio = (pagina - 1) * RECORTE_POR_PAGINA;
  return base44.entities.AccessLog.asAdmin(scope).list(
    '-created_date',
    RECORTE_POR_PAGINA + 1,
    inicio,
  );
};
export default function AccessLogs() {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [pagina, setPagina] = useState(1);

    // A página entra na chave de cache: sem ela, trocar de recorte devolveria o anterior.
    const { data, isLoading } = useQuery({
        queryKey: ['access-logs', pagina],
        queryFn: () => leituraDaTrilha(pagina),
    });

    // O excedente é lido e DESCARTADO. `undefined` (ainda carregando) e lista vazia caem no mesmo
    // lugar, e o avanço fica indisponível nos dois.
    const carregados = data ?? [];
    const temProxima = carregados.length > RECORTE_POR_PAGINA;
    const logs = carregados.slice(0, RECORTE_POR_PAGINA);

    const filteredLogs = logs.filter(log => {
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
    });

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
                    <Select value={actionFilter} onValueChange={(v) => setActionFilter(v as ActionFilter)}>
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
                    <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
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

                {/* Alcance da busca — declarado, e não deixado para o usuário concluir */}
                <p className="text-xs text-slate-500 mb-6">
                    A busca alcança apenas os {RECORTE_POR_PAGINA} registros deste recorte. Para
                    procurar em outro trecho da trilha, navegue entre os recortes.
                </p>

                {/* Stats */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                >
                    <Card className="p-4">
                        <p className="text-sm text-slate-500">Logs neste recorte</p>
                        <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-slate-500">Visualizações</p>
                        <p className="text-2xl font-bold text-emerald-600">
                            {logs.filter(l => l.action?.includes('view')).length}
                        </p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-slate-500">Edições</p>
                        <p className="text-2xl font-bold text-amber-600">
                            {logs.filter(l => l.action?.includes('edit') || l.action?.includes('create')).length}
                        </p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-slate-500">Exclusões</p>
                        <p className="text-2xl font-bold text-rose-600">
                            {logs.filter(l => l.action?.includes('delete')).length}
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

                {/* Navegação entre recortes — a posição é o número da página, nunca "de N":
                    sem operação de contagem não existe total de páginas para exibir. */}
                <div className="flex items-center justify-between mt-4">
                    <Button
                        variant="outline"
                        disabled={pagina === 1}
                        onClick={() => setPagina((atual) => Math.max(1, atual - 1))}
                    >
                        Anterior
                    </Button>
                    <span className="text-sm text-slate-500">Recorte {pagina}</span>
                    <Button
                        variant="outline"
                        disabled={!temProxima}
                        onClick={() => setPagina((atual) => atual + 1)}
                    >
                        Próxima
                    </Button>
                </div>
            </div>
        </div>
    );
}

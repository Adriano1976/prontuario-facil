import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { 
    LayoutDashboard, 
    Users, 
    Stethoscope, 
    FileText, 
    Shield,
    Menu,
    X,
    LogOut,
    ChevronDown,
    Settings,
    Calendar,
    UserCog
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
    { name: 'Pacientes', icon: Users, page: 'Patients' },
    { name: 'Agendamentos', icon: Calendar, page: 'Appointments' },
    { name: 'Consultas', icon: Stethoscope, page: 'Consultations' },
    { name: 'Médicos', icon: UserCog, page: 'Doctors' },
    { name: 'Templates', icon: FileText, page: 'Templates' },
    { name: 'Logs de Acesso', icon: Shield, page: 'AccessLogs' },
];

/**
 * Componente de wrapper de layout principal para páginas autenticadas.
 * Exibe barra lateral de navegação, header com menu de usuário e área de conteúdo principal.
 * Design responsível com suporte a menu móvel.
 *
 * @component
 * @param {Object} props - Props do componente.
 * @param {React.ReactNode} props.children - Conteúdo da página a renderizar na área principal.
 * @param {string} [props.currentPageName] - Nome da página atual para destacar na navegação.
 * @returns {JSX.Element} - Layout com navegação e conteúdo principal.
 *
 * @example
 * <Layout currentPageName="Pacientes">
 *   <PaginaPacientes />
 * </Layout>
 */
export default function Layout({ children, currentPageName }) {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me(),
    });

    const handleLogout = async () => {
        await base44.auth.logout();
    };

    // Pages that should not show navigation
    const fullScreenPages = ['PatientForm', 'NewConsultation', 'Consultation', 'PatientDetail', 'NewAppointment'];
    const isFullScreen = fullScreenPages.includes(currentPageName);

    if (isFullScreen) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
                                <Stethoscope className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-slate-900 hidden sm:block">MedRecord</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {NAV_ITEMS.map(item => {
                                const Icon = item.icon;
                                const isActive = currentPageName === item.page;
                                return (
                                    <Link key={item.page} to={createPageUrl(item.page)}>
                                        <Button 
                                            variant={isActive ? "secondary" : "ghost"}
                                            className={`flex items-center gap-2 ${isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-600'}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span>{item.name}</span>
                                        </Button>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white font-medium text-sm">
                                            {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
                                            {user?.full_name || user?.email}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="px-3 py-2">
                                        <p className="text-sm font-medium">{user?.full_name}</p>
                                        <p className="text-xs text-slate-500">{user?.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sair
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile Menu Button */}
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className="md:hidden"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 bg-white">
                        <div className="px-4 py-3 space-y-1">
                            {NAV_ITEMS.map(item => {
                                const Icon = item.icon;
                                const isActive = currentPageName === item.page;
                                return (
                                    <Link 
                                        key={item.page} 
                                        to={createPageUrl(item.page)}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Button 
                                            variant={isActive ? "secondary" : "ghost"}
                                            className={`w-full justify-start ${isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-600'}`}
                                        >
                                            <Icon className="h-4 w-4 mr-3" />
                                            {item.name}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </nav>

            {/* LGPD Compliance Badge */}
            <div className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white text-xs py-1.5 text-center">
                <div className="flex items-center justify-center gap-2">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Sistema em conformidade com a LGPD - Lei Geral de Proteção de Dados</span>
                </div>
            </div>

            {/* Main Content */}
            <main>
                {children}
            </main>
        </div>
    );
}

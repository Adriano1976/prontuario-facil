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
import { useToast } from "@/components/ui/use-toast";

const NAV_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
    { name: 'Pacientes', icon: Users, page: 'Patients' },
    { name: 'Agendamentos', icon: Calendar, page: 'Appointments' },
    { name: 'Consultas', icon: Stethoscope, page: 'Consultations' },
    { name: 'Médicos', icon: UserCog, page: 'Doctors' },
    { name: 'Templates', icon: FileText, page: 'Templates' },
    { name: 'Logs de Acesso', icon: Shield, page: 'AccessLogs' },
];

const BOTTOM_NAV_ITEMS = NAV_ITEMS.slice(0, 4);

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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me(),
    });

    const handleLogout = async () => {
        await base44.auth.logout();
    };

    const handleDeleteAccount = async () => {
        if (!user?.id) return;
        setIsDeleting(true);
        try {
            await base44.entities.User.delete(user.id);
            await base44.auth.logout();
        } catch (error) {
            setIsDeleting(false);
            toast({
                variant: "destructive",
                title: "Erro ao excluir conta",
                description: error?.message || "Não foi possível excluir a conta. Tente novamente.",
            });
        }
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
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 safe-area-top">
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

            {/* Bottom Navigation (mobile only) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-bottom">
                <div className="flex items-center justify-around">
                    {BOTTOM_NAV_ITEMS.map(item => {
                        const Icon = item.icon;
                        const isActive = currentPageName === item.page;
                        return (
                            <Link
                                key={item.page}
                                to={createPageUrl(item.page)}
                                className={`flex flex-col items-center justify-center gap-1 py-2 px-3 min-h-[44px] flex-1 transition-colors ${
                                    isActive ? 'text-sky-700' : 'text-slate-500'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Account Deletion Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-rose-600">Excluir Conta</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação é <strong>irreversível</strong>. Sua conta será permanentemente excluída e você perderá o acesso ao sistema. Dados associados podem ser afetados. Tem certeza que deseja continuar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            {isDeleting ? "Excluindo..." : "Excluir definitivamente"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

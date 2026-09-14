import type { ComponentType, ReactNode } from 'react';
import AccessLogs from './pages/AccessLogs';
import Consultation from './pages/Consultation';
import Consultations from './pages/Consultations';
import Dashboard from './pages/Dashboard';
import NewConsultation from './pages/NewConsultation';
import PatientDetail from './pages/PatientDetail';
import PatientForm from './pages/PatientForm';
import Patients from './pages/Patients';
import Templates from './pages/Templates';
import Appointments from './pages/Appointments';
import NewAppointment from './pages/NewAppointment';
import Doctors from './pages/Doctors';
import __Layout from './Layout';

/**
 * Mapeamento de páginas da aplicação.
 * Mapeia nomes de páginas para seus componentes importados correspondentes.
 * Usado pelo roteador para navegar entre diferentes seções da app.
 *
 * PARIDADE: conversão de linguagem; o mapeamento e a página inicial continuam os
 * mesmos do anterior.
 */
export const PAGES: Record<string, ComponentType> = {
    "AccessLogs": AccessLogs,
    "Consultation": Consultation,
    "Consultations": Consultations,
    "Dashboard": Dashboard,
    "NewConsultation": NewConsultation,
    "PatientDetail": PatientDetail,
    "PatientForm": PatientForm,
    "Patients": Patients,
    "Templates": Templates,
    "Appointments": Appointments,
    "NewAppointment": NewAppointment,
    "Doctors": Doctors,
}

/**
 * Objeto de configuração principal da aplicação.
 * Contém mapeamento de páginas, componente de layout e página inicial a carregar.
 */
export const pagesConfig: {
  mainPage: string;
  Pages: Record<string, ComponentType>;
  Layout: ComponentType<{ currentPageName?: string; children: ReactNode }>;
} = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};

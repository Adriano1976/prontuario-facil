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
import __Layout from './Layout.jsx';


/**
 * Mapeamento de páginas da aplicação.
 * Mapeia nomes de páginas para seus componentes importados correspondentes.
 * Usado pelo roteador para navegar entre diferentes seções da app.
 */
export const PAGES = {
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
 *
 * @typedef {Object} PagesConfig
 * @property {string} mainPage - A página inicial a carregar quando app inicia.
 * @property {Object} Pages - Mapeamento de nomes de páginas para componentes.
 * @property {React.ComponentType} Layout - Componente wrapper de layout principal.
 */
export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};

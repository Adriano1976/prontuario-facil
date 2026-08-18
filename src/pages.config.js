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

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};

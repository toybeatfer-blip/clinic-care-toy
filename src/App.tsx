import React, { useState, useEffect } from 'react';
import { ClinicalRecord, DoctorSettings, SessionUser, ClinicAccount } from './types';
import {
  getCurrentSession,
  clearSession,
  getClinicRecords,
  saveClinicRecord,
  getClinicSettings,
  saveClinicSettings,
  getActiveClinicRecord,
  getBlankClinicalRecord,
  getAllClinics,
  saveSession,
  CLINICS_UPDATED_EVENT
} from './utils/authStorage';
import { pullClinicsFromCloud } from './utils/cloudStorage';
import { AuthScreen } from './components/AuthScreen';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { Header } from './components/Header';
import { AuditAlertsBanner } from './components/AuditAlertsBanner';
import { Module1Identification } from './components/Module1Identification';
import { Module2HistoryCheckup } from './components/Module2HistoryCheckup';
import { Module3EvolutionNote } from './components/Module3EvolutionNote';
import { Module4Procedures } from './components/Module4Procedures';
import { OperationalGuideModal } from './components/OperationalGuideModal';
import { RawDataParserModal } from './components/RawDataParserModal';
import { SavedRecordsDrawer } from './components/SavedRecordsDrawer';
import { PrintableNoteModal } from './components/PrintableNoteModal';
import { PrintablePrescriptionModal } from './components/PrintablePrescriptionModal';
import { SettingsModal } from './components/SettingsModal';
import { SpecialistToolsModal } from './components/SpecialistToolsModal';
import { PatientTimelineModal } from './components/PatientTimelineModal';
import {
  UserCheck,
  FileHeart,
  ClipboardList,
  Syringe,
  Moon,
  Sun,
  BookOpen,
  Sparkles,
  Settings,
  LogOut,
  Calculator,
  History,
  FileText,
  Pill
} from 'lucide-react';
import { CopyButton } from './components/CopyButton';
import { generateModule1Text, generateModule2Text, generateModule3Text, generateModule4Text } from './utils/nom004Validator';

export const App: React.FC = () => {
  const [session, setSession] = useState<SessionUser | null>(getCurrentSession());
  
  // Per-clinic isolated state
  const clinicId = session?.clinicId || '';
  const [record, setRecord] = useState<ClinicalRecord>(clinicId ? getActiveClinicRecord(clinicId) : getBlankClinicalRecord());
  const [savedRecords, setSavedRecords] = useState<ClinicalRecord[]>(clinicId ? getClinicRecords(clinicId) : []);
  const [doctorSettings, setDoctorSettings] = useState<DoctorSettings>(clinicId ? getClinicSettings(clinicId) : {
    doctorName: '',
    prefix: 'Dr.',
    cedulaGeneral: '',
    cedulaEspecialidad: '',
    especialidad: 'Medicina General',
    universidad: '',
    telefonoContacto: '',
    correoContacto: '',
    nombreClinica: '',
    sucursal: '',
    direccionClinica: '',
    telefonoClinica: '',
    logoUrl: '',
    primaryColor: 'sky'
  });

  const [activeTab, setActiveTab] = useState<'modulo1' | 'modulo2' | 'modulo3' | 'modulo4'>('modulo1');

  // Modals & Drawers
  const [isOpGuideOpen, setIsOpGuideOpen] = useState(false);
  const [isRawParserOpen, setIsRawParserOpen] = useState(false);
  const [isSpecialistToolsOpen, setIsSpecialistToolsOpen] = useState(false);
  const [isPatientTimelineOpen, setIsPatientTimelineOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Guardado automáticamente');

  // When session changes (login)
  const handleLoginSuccess = (newSession: SessionUser) => {
    setSession(newSession);
    if (newSession.type === 'clinic' && newSession.clinicId) {
      const cId = newSession.clinicId;
      setSavedRecords(getClinicRecords(cId));
      setDoctorSettings(getClinicSettings(cId));
      setRecord(getActiveClinicRecord(cId));
      setActiveTab('modulo1');
    }
  };

  // Logout handler
  const handleLogout = () => {
    if (session?.type === 'clinic' && session.clinicId) {
      // Guardar el registro activo actual antes de salir
      saveClinicRecord(session.clinicId, record);
      saveClinicSettings(session.clinicId, doctorSettings);
    }
    clearSession();
    setSession(null);
    setRecord(getBlankClinicalRecord());
    setSavedRecords([]);
  };

  // Sync clinic record to isolated localStorage
  useEffect(() => {
    if (session?.type === 'clinic' && session.clinicId) {
      const updatedList = saveClinicRecord(session.clinicId, record);
      setSavedRecords(updatedList);
      setLastSavedTime('Guardado a las ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  }, [record, session]);

  // Actualización automática en vivo de la cuenta si el Super Admin la renueva o modifica
  useEffect(() => {
    if (session?.type === 'clinic' && session.clinicId) {
      const handleClinicsUpdated = () => {
        const all = getAllClinics();
        const fresh = all.find(c => c.id === session.clinicId);
        if (fresh) {
          const updatedSession = { ...session, clinicAccount: fresh };
          setSession(updatedSession);
          saveSession(updatedSession);
        }
      };

      window.addEventListener(CLINICS_UPDATED_EVENT, handleClinicsUpdated);
      return () => {
        window.removeEventListener(CLINICS_UPDATED_EVENT, handleClinicsUpdated);
      };
    }
  }, [session?.clinicId]);

  // Dark Mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleNewPatient = () => {
    if (window.confirm('¿Deseas registrar un nuevo paciente en blanco? El expediente actual se mantendrá guardado en tu historial.')) {
      const blank = getBlankClinicalRecord();
      setRecord(blank);
      setActiveTab('modulo1');
    }
  };

  const handleSaveSettings = (updated: DoctorSettings) => {
    setDoctorSettings(updated);
    if (session?.type === 'clinic' && session.clinicId) {
      saveClinicSettings(session.clinicId, updated);
    }
  };

  const getCurrentModuleCopyText = () => {
    switch (activeTab) {
      case 'modulo1': return generateModule1Text(record.identification);
      case 'modulo2': return generateModule2Text(record.historyCheckup);
      case 'modulo3': return generateModule3Text(record.evolutionNote);
      case 'modulo4': return generateModule4Text(record.procedure);
    }
  };

  const handleImpersonateClinic = (clinic: ClinicAccount) => {
    const tempSession: SessionUser = {
      type: 'clinic',
      clinicId: clinic.id,
      username: clinic.username,
      clinicAccount: clinic,
      isSuperAdminViewing: true
    };
    handleLoginSuccess(tempSession);
  };

  const handleReturnToSuperAdmin = () => {
    const adminSession: SessionUser = {
      type: 'superadmin',
      username: 'Fernando01'
    };
    saveSession(adminSession);
    setSession(adminSession);
  };

  // 1. Si no hay sesión -> Pantalla de Inicio de Sesión / Registro
  if (!session) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Si es Super Administrador (Fernando01) -> Panel de Control Maestro
  if (session.type === 'superadmin') {
    return <SuperAdminDashboard onLogout={handleLogout} onImpersonateClinic={handleImpersonateClinic} />;
  }

  // 3. Si es un Consultorio Médico -> Espacio de Trabajo Clínico Aislado
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-sky-500 selection:text-white transition-colors duration-150">
      
      {/* Super Admin Impersonation Bar */}
      {session?.isSuperAdminViewing && (
        <div className="bg-gradient-to-r from-sky-700 via-indigo-700 to-purple-800 text-white px-4 py-2 flex items-center justify-between shadow-lg sticky top-0 z-50 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-white/20 font-black text-xs uppercase tracking-wide">🛡️ Modo Super Admin</span>
            <span className="hidden sm:inline">Visualizando consultorio:</span>
            <strong>{session.clinicAccount?.clinicName}</strong>
            <span className="text-sky-200">({session.clinicAccount?.prefix} {session.clinicAccount?.doctorName})</span>
          </div>
          <button
            type="button"
            onClick={handleReturnToSuperAdmin}
            className="px-3 py-1 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl shadow transition-all flex items-center gap-1.5 text-xs shrink-0"
          >
            <span>⬅️ Regresar al Panel Super Admin</span>
          </button>
        </div>
      )}

      {/* Top Main Navigation Header */}
      <Header
        ticketFolio={record.ticketFolio || ''}
        onTicketFolioChange={(folio) => setRecord({ ...record, ticketFolio: folio })}
        onOpenOperationalGuide={() => setIsOpGuideOpen(true)}
        onOpenRawDataParser={() => setIsRawParserOpen(true)}
        onOpenSpecialistTools={() => setIsSpecialistToolsOpen(true)}
        onOpenPatientTimeline={() => setIsPatientTimelineOpen(true)}
        onOpenSavedDrawer={() => setIsDrawerOpen(true)}
        onOpenPrintPreview={() => setIsPrintModalOpen(true)}
        onOpenPrintNote={() => setIsPrintModalOpen(true)}
        onOpenPrescription={() => setIsPrescriptionModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewPatient={handleNewPatient}
        onLogout={handleLogout}
        doctorSettings={doctorSettings}
        session={session}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Real-time Audit & NOM-004 Banner */}
        <AuditAlertsBanner
          record={record}
          onUpdateRecord={(updated) => setRecord(updated)}
        />

        {/* Tab Selector Bar for the 4 Clinical Modules */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-2">
          <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-1.5 flex-1">
            
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setActiveTab('modulo1')}
              className={`flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'modulo1'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 scale-[1.01]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                activeTab === 'modulo1' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                1
              </div>
              <span className="truncate">Ficha del Paciente</span>
            </button>

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => setActiveTab('modulo2')}
              className={`flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'modulo2'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 scale-[1.01]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                activeTab === 'modulo2' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                2
              </div>
              <span className="truncate">Consulta & Receta</span>
            </button>

            {/* Step 3 */}
            <button
              type="button"
              onClick={() => setActiveTab('modulo3')}
              className={`flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'modulo3'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.01]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                activeTab === 'modulo3' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                3
              </div>
              <span className="truncate">Evolución</span>
            </button>

            {/* Step 4 */}
            <button
              type="button"
              onClick={() => setActiveTab('modulo4')}
              className={`flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'modulo4'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 scale-[1.01]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                activeTab === 'modulo4' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                4
              </div>
              <span className="truncate">Procedimientos</span>
            </button>
          </div>

          {/* Quick Copy Active Module & Dark Mode Toggle */}
          <div className="flex items-center gap-2 px-2 ml-auto">
            <CopyButton
              text={getCurrentModuleCopyText()}
              label="Copiar Nota Rápida"
              variant="primary"
              size="sm"
            />

            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Cambiar tema claro / oscuro"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Active Module Content */}
        <div className="transition-all duration-200">
          {activeTab === 'modulo1' && (
            <Module1Identification
              data={record.identification}
              onChange={(updated) => setRecord({ ...record, identification: updated })}
              savedRecords={savedRecords}
            />
          )}

          {activeTab === 'modulo2' && (
            <Module2HistoryCheckup
              data={record.historyCheckup}
              onChange={(updated) => setRecord({ ...record, historyCheckup: updated })}
              clinicalImages={record.clinicalImages}
              onImagesChange={(imgs) => setRecord({ ...record, clinicalImages: imgs })}
              appointmentInfo={record.appointmentInfo}
              onAppointmentChange={(apt) => setRecord({ ...record, appointmentInfo: apt })}
              patientInfo={record.identification}
              doctorSettings={doctorSettings}
              clinicId={clinicId}
              onOpenPrintNote={() => setIsPrintModalOpen(true)}
              onOpenPrescription={() => setIsPrescriptionModalOpen(true)}
            />
          )}

          {activeTab === 'modulo3' && (
            <Module3EvolutionNote
              data={record.evolutionNote}
              onChange={(updated) => setRecord({ ...record, evolutionNote: updated })}
              clinicalImages={record.clinicalImages}
              onImagesChange={(imgs) => setRecord({ ...record, clinicalImages: imgs })}
              appointmentInfo={record.appointmentInfo}
              onAppointmentChange={(apt) => setRecord({ ...record, appointmentInfo: apt })}
              patientInfo={record.identification}
              doctorSettings={doctorSettings}
              onOpenPrintNote={() => setIsPrintModalOpen(true)}
              onOpenPrescription={() => setIsPrescriptionModalOpen(true)}
            />
          )}

          {activeTab === 'modulo4' && (
            <Module4Procedures
              data={record.procedure}
              onChange={(updated) => setRecord({ ...record, procedure: updated })}
            />
          )}
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="mt-auto py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{doctorSettings.nombreClinica || session.clinicAccount?.clinicName || 'CLINIC CARE TOY'}</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="font-mono text-[11px]">{lastSavedTime}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="hover:text-sky-600 transition-colors flex items-center gap-1 font-semibold"
              title="Ver e imprimir nota médica oficial completa"
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>Nota Médica</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsPrescriptionModalOpen(true)}
              className="hover:text-teal-600 transition-colors flex items-center gap-1 font-semibold"
              title="Ver e imprimir receta médica oficial para el paciente"
            >
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              <span>Receta Médica</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsSpecialistToolsOpen(true)}
              className="hover:text-sky-600 transition-colors flex items-center gap-1"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculadoras</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsPatientTimelineOpen(true)}
              className="hover:text-sky-600 transition-colors flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>Línea de Tiempo</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-sky-600 transition-colors flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configuración</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsOpGuideOpen(true)}
              className="hover:text-sky-600 transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Flujos SAC</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsRawParserOpen(true)}
              className="hover:text-sky-600 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dictado Libre</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-rose-600 hover:text-rose-700 font-bold transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={doctorSettings}
        onSaveSettings={handleSaveSettings}
      />

      <OperationalGuideModal
        isOpen={isOpGuideOpen}
        onClose={() => setIsOpGuideOpen(false)}
      />

      <RawDataParserModal
        isOpen={isRawParserOpen}
        onClose={() => setIsRawParserOpen(false)}
        currentRecord={record}
        onApplyParsedData={(updated) => setRecord(updated)}
      />

      <SpecialistToolsModal
        isOpen={isSpecialistToolsOpen}
        onClose={() => setIsSpecialistToolsOpen(false)}
        patientAge={record.identification.edad}
        patientSex={record.identification.sexo}
        patientWeight={record.historyCheckup.vitalSigns?.peso}
        onInsertTextToNote={(text) => {
          if (activeTab === 'modulo3') {
            setRecord({
              ...record,
              evolutionNote: {
                ...record.evolutionNote,
                evolucionCuadroClinico: (record.evolutionNote.evolucionCuadroClinico || '') + text
              }
            });
          } else {
            setRecord({
              ...record,
              historyCheckup: {
                ...record.historyCheckup,
                padecimientoActual: (record.historyCheckup.padecimientoActual || '') + text
              }
            });
          }
        }}
      />

      <PatientTimelineModal
        isOpen={isPatientTimelineOpen}
        onClose={() => setIsPatientTimelineOpen(false)}
        allRecords={savedRecords}
        currentPatientName={`${record.identification.nombres || ''} ${record.identification.apellidoPaterno || ''}`}
        currentPatientCurp={record.identification.curp}
        onSelectRecord={(rec) => setRecord(rec)}
      />

      <SavedRecordsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        savedRecords={savedRecords}
        onSelectRecord={(rec) => setRecord(rec)}
        onRefreshRecords={(recs) => setSavedRecords(recs)}
      />

      <PrintableNoteModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        record={record}
        doctorSettings={doctorSettings}
      />

      <PrintablePrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        record={record}
        doctorSettings={doctorSettings}
      />
    </div>
  );
};

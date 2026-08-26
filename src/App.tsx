import React, { useState, useEffect } from 'react';
import { ClinicalRecord, DoctorSettings, SessionUser } from './types';
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
import { SettingsModal } from './components/SettingsModal';
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
  LogOut
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
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

  // 1. Si no hay sesión -> Pantalla de Inicio de Sesión / Registro
  if (!session) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Si es Super Administrador (Fernando01) -> Panel de Control Maestro
  if (session.type === 'superadmin') {
    return <SuperAdminDashboard onLogout={handleLogout} />;
  }

  // 3. Si es un Consultorio Médico -> Espacio de Trabajo Clínico Aislado
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-sky-500 selection:text-white transition-colors duration-150">
      
      {/* Top Main Navigation Header */}
      <Header
        ticketFolio={record.ticketFolio || ''}
        onTicketFolioChange={(folio) => setRecord({ ...record, ticketFolio: folio })}
        onOpenOperationalGuide={() => setIsOpGuideOpen(true)}
        onOpenRawDataParser={() => setIsRawParserOpen(true)}
        onOpenSavedDrawer={() => setIsDrawerOpen(true)}
        onOpenPrintPreview={() => setIsPrintModalOpen(true)}
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

        {/* Tab Selector Bar for the 4 SAC Modules */}
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            <button
              type="button"
              onClick={() => setActiveTab('modulo1')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'modulo1'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Módulo 1: Alta & Ficha</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('modulo2')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'modulo2'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileHeart className="w-4 h-4" />
              <span>Módulo 2: Historia Clínica / Checkup</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('modulo3')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'modulo3'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Módulo 3: Nota de Evolución</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('modulo4')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'modulo4'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Syringe className="w-4 h-4" />
              <span>Módulo 4: Procedimientos</span>
            </button>
          </div>

          {/* Quick Copy Active Module & Dark Mode Toggle */}
          <div className="flex items-center gap-2 px-2">
            <CopyButton
              text={getCurrentModuleCopyText()}
              label="Copiar Módulo Activo"
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
            />
          )}

          {activeTab === 'modulo3' && (
            <Module3EvolutionNote
              data={record.evolutionNote}
              onChange={(updated) => setRecord({ ...record, evolutionNote: updated })}
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
    </div>
  );
};

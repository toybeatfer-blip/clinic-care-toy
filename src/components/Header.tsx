import React, { useState, useEffect } from 'react';
import { Stethoscope, Clock, BookOpen, Sparkles, FolderOpen, UserPlus, Printer, Settings, Ticket, LogOut, ShieldCheck, Building2, Calendar, Calculator, History } from 'lucide-react';
import { CopyButton } from './CopyButton';
import { DoctorSettings, SessionUser } from '../types';
import { getDaysRemaining } from '../utils/authStorage';

interface HeaderProps {
  ticketFolio: string;
  onTicketFolioChange: (folio: string) => void;
  onOpenOperationalGuide: () => void;
  onOpenRawDataParser: () => void;
  onOpenSpecialistTools: () => void;
  onOpenPatientTimeline: () => void;
  onOpenSavedDrawer: () => void;
  onOpenPrintPreview: () => void;
  onOpenSettings: () => void;
  onNewPatient: () => void;
  onLogout: () => void;
  doctorSettings: DoctorSettings;
  session: SessionUser;
}

export const Header: React.FC<HeaderProps> = ({
  ticketFolio,
  onTicketFolioChange,
  onOpenOperationalGuide,
  onOpenRawDataParser,
  onOpenSpecialistTools,
  onOpenPatientTimeline,
  onOpenSavedDrawer,
  onOpenPrintPreview,
  onOpenSettings,
  onNewPatient,
  onLogout,
  doctorSettings,
  session
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-MX', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const clinicName = session.clinicAccount?.clinicName || doctorSettings.nombreClinica || 'Consultorio Médico';
  const doctorDisplayName = doctorSettings.doctorName ? `${doctorSettings.prefix} ${doctorSettings.doctorName}` : (session.clinicAccount ? `${session.clinicAccount.prefix} ${session.clinicAccount.doctorName}` : 'Médico en Turno');
  
  const licenseRemaining = session.clinicAccount ? getDaysRemaining(session.clinicAccount.licenseValidUntil) : null;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Logo and Clinic Identity */}
          <div className="flex items-center gap-3">
            {doctorSettings.logoUrl ? (
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-sm">
                <img src={doctorSettings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Stethoscope className="w-6 h-6" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-800 dark:text-slate-100">
                  {clinicName}
                </h1>
                {licenseRemaining && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    licenseRemaining.days <= 5
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                    <span>Licencia: {licenseRemaining.label}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                {doctorDisplayName} {session.clinicAccount?.sucursal && `• ${session.clinicAccount.sucursal}`} (Usuario: {session.username})
              </p>
            </div>
          </div>

          {/* Ticket Folio and Action Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Ticket Folio Input */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <Ticket className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hidden sm:inline">Ticket:</span>
              <input
                type="text"
                placeholder="No. Folio"
                value={ticketFolio}
                onChange={(e) => onTicketFolioChange(e.target.value)}
                className="w-20 sm:w-24 text-xs font-mono font-bold bg-transparent focus:outline-none text-slate-800 dark:text-slate-100"
              />
              {ticketFolio && (
                <CopyButton text={ticketFolio} size="sm" variant="ghost" label="" />
              )}
            </div>

            {/* Live Clock */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>{time || '--:--:--'}</span>
            </div>

            {/* Quick Actions */}
            <button
              type="button"
              onClick={onOpenSpecialistTools}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-100 transition-colors shadow-sm"
              title="Calculadoras especializadas: Gineco (FUM/SDG), Pediatría (Dosis ponderal) y Cockcroft-Gault"
            >
              <Calculator className="w-3.5 h-3.5 text-blue-600" />
              <span>Calculadoras</span>
            </button>

            <button
              type="button"
              onClick={onOpenPatientTimeline}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold hover:bg-purple-100 transition-colors shadow-sm"
              title="Línea de tiempo cronológica y evolución de pacientes"
            >
              <History className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Línea de Tiempo</span>
            </button>

            <button
              type="button"
              onClick={onOpenRawDataParser}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 transition-colors shadow-sm"
              title="Pegar notas en bruto para estructurar automáticamente"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Procesador IA</span>
            </button>

            <button
              type="button"
              onClick={onOpenOperationalGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-semibold hover:bg-sky-100 transition-colors shadow-sm"
              title="Manual operativo de SAC, tickets, contraseñas y biométrico"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden md:inline">Manual SAC</span>
            </button>

            <button
              type="button"
              onClick={onOpenPrintPreview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              title="Ver nota médica y receta para impresión"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Imprimir</span>
            </button>

            <button
              type="button"
              onClick={onOpenSavedDrawer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              title="Historial de consultas de este consultorio"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden lg:inline">Historial</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
              title="Configurar datos del médico, consultorio, logo y colores"
            >
              <Settings className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline">Configuración</span>
            </button>

            <button
              type="button"
              onClick={onNewPatient}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
              title="Iniciar nuevo paciente en blanco"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nuevo Paciente</span>
            </button>

            {/* Red Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all active:scale-95 ml-1"
              title="Cerrar sesión del consultorio y guardar datos"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

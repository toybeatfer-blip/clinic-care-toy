import React, { useState, useEffect, useRef } from 'react';
import {
  Stethoscope,
  Clock,
  BookOpen,
  Sparkles,
  FolderOpen,
  UserPlus,
  Settings,
  Ticket,
  LogOut,
  ShieldCheck,
  Calculator,
  History,
  FileText,
  Pill,
  ChevronDown,
  Activity,
  Wrench
} from 'lucide-react';
import { CopyButton } from './CopyButton';
import { DoctorSettings, SessionUser } from '../types';
import { getDaysRemaining } from '../utils/authStorage';
import { CREATOR_LOGO_BASE64 } from '../constants/creatorBranding';

interface HeaderProps {
  ticketFolio: string;
  onTicketFolioChange: (folio: string) => void;
  onOpenOperationalGuide: () => void;
  onOpenRawDataParser: () => void;
  onOpenSpecialistTools: () => void;
  onOpenPatientTimeline: () => void;
  onOpenSavedDrawer: () => void;
  onOpenPrintPreview?: () => void;
  onOpenPrintNote?: () => void;
  onOpenPrescription?: () => void;
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
  onOpenPrintNote,
  onOpenPrescription,
  onOpenSettings,
  onNewPatient,
  onLogout,
  doctorSettings,
  session
}) => {
  const [time, setTime] = useState<string>('');
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-MX', { hour12: true, hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clinicName = session.clinicAccount?.clinicName || doctorSettings.nombreClinica || 'Consultorio Médico';
  const doctorDisplayName = doctorSettings.doctorName
    ? `${doctorSettings.prefix} ${doctorSettings.doctorName}`
    : (session.clinicAccount ? `${session.clinicAccount.prefix} ${session.clinicAccount.doctorName}` : 'Médico en Turno');
  
  const licenseRemaining = session.clinicAccount ? getDaysRemaining(session.clinicAccount.licenseValidUntil) : null;

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-2.5 gap-2.5">
          
          {/* Left: Brand, Clinic and Doctor Identity */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Sello Oficial e Inalterable del Creador: TOY */}
              <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-3 shrink-0" title="CLINIC CARE TOY • Desarrollado y Blindado por Toy">
                <div className="w-10 h-10 rounded-2xl bg-white p-1 border-2 border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                  <img src={CREATOR_LOGO_BASE64} alt="Toy Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="hidden xl:block leading-none">
                  <div className="text-[10px] font-black text-slate-900 dark:text-white tracking-wider">CLINIC CARE</div>
                  <div className="text-[9px] font-bold text-sky-600 dark:text-sky-400 tracking-widest mt-0.5">BY TOY</div>
                </div>
              </div>

              {doctorSettings.logoUrl ? (
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                  <img src={doctorSettings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 via-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/15 shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-slate-100 line-clamp-1">
                    {clinicName}
                  </h1>
                  {licenseRemaining && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      licenseRemaining.days <= 5
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                    }`}>
                      <ShieldCheck className="w-3 h-3" />
                      <span>{licenseRemaining.label}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{doctorDisplayName}</span>
                  {doctorSettings.especialidad && (
                    <>
                      <span>•</span>
                      <span className="text-slate-500">{doctorSettings.especialidad}</span>
                    </>
                  )}
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded-md">
                    ● En línea
                  </span>
                </div>
              </div>
            </div>

            {/* Live Clock on Small Screens */}
            <div className="flex lg:hidden items-center gap-1 text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              <Clock className="w-3 h-3 text-sky-500" />
              <span>{time}</span>
            </div>
          </div>

          {/* Right: Main Clinical Workflow & Action Group */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 sm:gap-2.5">
            
            {/* Ticket Folio Pill */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-inner">
              <Ticket className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Folio:</span>
              <input
                type="text"
                placeholder="No. Ticket"
                value={ticketFolio}
                onChange={(e) => onTicketFolioChange(e.target.value)}
                className="w-16 sm:w-20 text-xs font-mono font-bold bg-transparent focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
              {ticketFolio && (
                <CopyButton text={ticketFolio} size="sm" variant="ghost" label="" />
              )}
            </div>

            {/* Primary Action: Nuevo Paciente */}
            <button
              type="button"
              onClick={onNewPatient}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all"
              title="Iniciar una nueva consulta en blanco"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Nuevo Paciente</span>
            </button>

            {/* Expedir Receta Médica */}
            <button
              type="button"
              onClick={onOpenPrescription || onOpenPrintPreview}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Expedir receta médica oficial con datos del médico para firma y sello"
            >
              <Pill className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>💊 Receta</span>
            </button>

            {/* Ver Nota Médica */}
            <button
              type="button"
              onClick={onOpenPrintNote || onOpenPrintPreview}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Ver expediente clínico completo y nota médica oficial NOM-004"
            >
              <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>📋 Nota Médica</span>
            </button>

            {/* Dropdown: Herramientas Clínicas & Asistentes */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-sm ${
                  isToolsDropdownOpen
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
                title="Calculadoras, dictado inteligente, historial y manual"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isToolsDropdownOpen ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                <span className="hidden sm:inline">Herramientas</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isToolsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Asistentes Clínicos
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      onOpenSpecialistTools();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2.5 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">Calculadoras Médicas</div>
                      <p className="text-[10px] text-slate-400">Ginecología (SDG), Dosis Pediátrica y TFG</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      onOpenPatientTimeline();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2.5 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">Línea de Tiempo</div>
                      <p className="text-[10px] text-slate-400">Evolución histórica de consultas previas</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      onOpenRawDataParser();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2.5 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">Dictado Libre / IA</div>
                      <p className="text-[10px] text-slate-400">Pega texto libre para auto-llenar los 4 módulos</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      onOpenSavedDrawer();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2.5 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">Historial de Pacientes</div>
                      <p className="text-[10px] text-slate-400">Buscar expedientes guardados en este consultorio</p>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      onOpenOperationalGuide();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 flex items-center gap-2 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                    <span>Manual de Flujos SAC</span>
                  </button>
                </div>
              )}
            </div>

            {/* Settings Gear Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
              title="Configurar datos del médico, logo y consultorio"
            >
              <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 transition-all shadow-sm"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

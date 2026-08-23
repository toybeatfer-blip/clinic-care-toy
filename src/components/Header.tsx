import React, { useState, useEffect } from 'react';
import { Stethoscope, Clock, BookOpen, Sparkles, FolderOpen, UserPlus, Printer, Settings, Ticket } from 'lucide-react';
import { CopyButton } from './CopyButton';
import { DoctorSettings } from '../types';

interface HeaderProps {
  ticketFolio: string;
  onTicketFolioChange: (folio: string) => void;
  onOpenOperationalGuide: () => void;
  onOpenRawDataParser: () => void;
  onOpenSavedDrawer: () => void;
  onOpenPrintPreview: () => void;
  onOpenSettings: () => void;
  onNewPatient: () => void;
  doctorSettings: DoctorSettings;
}

export const Header: React.FC<HeaderProps> = ({
  ticketFolio,
  onTicketFolioChange,
  onOpenOperationalGuide,
  onOpenRawDataParser,
  onOpenSavedDrawer,
  onOpenPrintPreview,
  onOpenSettings,
  onNewPatient,
  doctorSettings
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

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Logo and System Identity */}
          <div className="flex items-center gap-3">
            {doctorSettings.logoUrl ? (
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-sm">
                <img src={doctorSettings.logoUrl} alt="Logo Clínico" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Stethoscope className="w-6 h-6" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-sky-700 to-indigo-800 dark:from-sky-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  CLINIC CARE TOY
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  SAC & NOM-004
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-sm">
                {doctorSettings.prefix} {doctorSettings.doctorName} • {doctorSettings.sucursal || doctorSettings.nombreClinica}
              </p>
            </div>
          </div>

          {/* Ticket Folio and Operational Tools Bar */}
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
              <span className="hidden sm:inline">Manual SAC</span>
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
              title="Historial de consultas y pacientes"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden lg:inline">Historial</span>
            </button>

            {/* Configurar Médico, Dirección, Logo y Colores */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
              title="Configurar datos del médico, consultorio, logo y colores"
            >
              <Settings className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Configuración</span>
            </button>

            <button
              type="button"
              onClick={onNewPatient}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
              title="Iniciar nuevo expediente en blanco"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nuevo Paciente</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

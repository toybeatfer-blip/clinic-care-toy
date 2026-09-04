import React from 'react';
import {
  X,
  Printer,
  Stethoscope,
  Pill,
  Calendar,
  AlertTriangle,
  Building2,
  User,
  Phone,
  Mail,
  FileCheck,
  Clock,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { ClinicalRecord, DoctorSettings } from '../types';
import { CREATOR_LOGO_BASE64 } from '../constants/creatorBranding';

interface PrintablePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ClinicalRecord;
  doctorSettings: DoctorSettings;
}

export const PrintablePrescriptionModal: React.FC<PrintablePrescriptionModalProps> = ({
  isOpen,
  onClose,
  record,
  doctorSettings
}) => {
  if (!isOpen) return null;

  const id = record.identification || ({} as any);
  const hc = record.historyCheckup || ({} as any);
  const evo = record.evolutionNote || ({} as any);
  const v = hc.vitalSigns || evo.vitalSigns || ({} as any);
  
  const fullName = `${id.nombres || 'Paciente'} ${id.apellidoPaterno || ''} ${id.apellidoMaterno || ''}`.trim();
  const dateFormatted = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeFormatted = new Date().toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const prescriptions = hc.prescripcion || [];
  const indications = hc.indicacionTerapeutica || evo.planTerapeutico || '';
  const diagnosis = hc.diagnosticoCie10 || evo.diagnosticoActualizado || 'Diagnóstico Clínico General';
  const allergies = id.alergias || 'Negadas';
  const isAllergic = allergies.toLowerCase() !== 'negadas' && allergies.toLowerCase() !== 'negado' && allergies.trim() !== '';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Toolbar (hidden during print) */}
        <div className="no-print p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Receta Médica Oficial Expedible</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300">
                  Lista para Sello y Firma
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Formato estándar de prescripción para farmacia y paciente conforme a Ley General de Salud
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print-page space-y-5">
          
          {/* 1. Header con datos del Médico Tratante y Clínica */}
          <div className="border-b-2 border-teal-800 pb-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {doctorSettings.logoUrl ? (
                <div className="w-16 h-16 rounded-xl border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={doctorSettings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-teal-700 to-sky-700 flex items-center justify-center text-white shadow-sm shrink-0">
                  <Stethoscope className="w-8 h-8" />
                </div>
              )}

              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                  {doctorSettings.nombreClinica || 'CONSULTORIO MÉDICO'}
                </h1>
                <p className="text-xs font-bold text-teal-800">
                  {doctorSettings.prefix} {doctorSettings.doctorName || 'Médico Tratante'} • {doctorSettings.especialidad || 'Medicina General'}
                </p>
                <div className="text-[11px] text-slate-600 mt-0.5 space-x-1">
                  <span>Céd. Profesional: <strong>{doctorSettings.cedulaGeneral || 'Pendiente'}</strong></span>
                  {doctorSettings.cedulaEspecialidad && (
                    <span>| Céd. Especialidad: <strong>{doctorSettings.cedulaEspecialidad}</strong></span>
                  )}
                  {doctorSettings.universidad && (
                    <span>| {doctorSettings.universidad}</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {doctorSettings.direccionClinica || 'Dirección de consulta'} {doctorSettings.telefonoClinica ? `• Tel: ${doctorSettings.telefonoClinica}` : ''}
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] shrink-0 self-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 bg-teal-50 border border-teal-200 px-2 py-1 rounded-md block mb-1">
                RECETA MÉDICA
              </span>
              <p className="text-slate-500 font-medium capitalize">{dateFormatted}</p>
              <p className="text-slate-400 font-mono text-[10px]">{timeFormatted} hrs</p>
              {record.ticketFolio && (
                <p className="text-[10px] text-slate-600 font-bold mt-0.5">Folio / Ticket: #{record.ticketFolio}</p>
              )}
            </div>
          </div>

          {/* 2. Barra de Datos del Paciente y Somatometría */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="sm:col-span-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Nombre del Paciente:</span>
              <strong className="text-slate-900 text-sm">{fullName}</strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Edad / Sexo:</span>
              <span className="text-slate-800 font-semibold">{id.edad ? `${id.edad} años` : 'N/E'} • {id.sexo || 'N/E'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Signos Vitales:</span>
              <span className="text-slate-800 font-mono text-[11px]">
                {v.peso ? `${v.peso}kg ` : ''}{v.talla ? `${v.talla}m ` : ''}{v.taSistolica ? `TA:${v.taSistolica}/${v.taDiastolica} ` : ''}{v.temp ? `T:${v.temp}°C` : ''}
              </span>
            </div>

            {/* Diagnóstico */}
            <div className="sm:col-span-3 border-t border-slate-200/80 pt-1.5 mt-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Diagnóstico Clínico (CIE-10):</span>
              <span className="text-slate-900 font-bold text-xs text-teal-900">{diagnosis}</span>
            </div>

            {/* Alergias destacadas */}
            <div className="border-t border-slate-200/80 pt-1.5 mt-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Alergias:</span>
              <span className={`font-bold text-xs ${isAllergic ? 'text-rose-600' : 'text-slate-700'}`}>
                {isAllergic ? `⚠️ ${allergies}` : allergies}
              </span>
            </div>
          </div>

          {/* 3. Cuerpo de la Receta (Rp. / Rx - Prescripción Médica) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-teal-200 pb-1.5">
              <span className="font-serif text-2xl font-black text-teal-800 italic">Rp.</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Prescripción Farmacológica:
              </span>
            </div>

            <div className="space-y-2.5">
              {prescriptions.length > 0 ? (
                prescriptions.map((med, idx) => (
                  <div
                    key={med.id || idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/40 text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <strong className="text-slate-900 text-xs sm:text-sm font-bold">
                          {med.producto}
                        </strong>
                        {med.marcaInstitucional && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
                            {med.marcaInstitucional}
                          </span>
                        )}
                      </div>

                      <div className="pl-7 text-slate-800 font-medium leading-relaxed">
                        <p className="text-teal-950 font-bold">
                          👉 {med.dosis} — {med.periodicidad}
                        </p>
                        {med.indicacionesAdicionales && (
                          <p className="text-slate-600 text-[11px] mt-0.5">
                            * {med.indicacionesAdicionales}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pl-7 sm:pl-0 sm:text-right text-[11px] text-slate-500 shrink-0">
                      <p className="font-semibold text-slate-700">Cantidad: {med.cantidad || '1 pieza'}</p>
                      <p className="text-[10px] text-slate-500">Vía: {med.via || 'Oral'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 italic">
                  No se registraron medicamentos en esta consulta.
                </div>
              )}
            </div>
          </div>

          {/* 4. Indicaciones Terapéuticas Generales & Medidas de Alarma */}
          {indications && (
            <div className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-3 text-xs space-y-1">
              <strong className="text-amber-900 uppercase font-bold text-[11px] block">
                Indicaciones Generales, Dieta y Datos de Alarma:
              </strong>
              <p className="text-slate-800 whitespace-pre-line leading-relaxed pl-1 text-[11px]">
                {indications}
              </p>
            </div>
          )}

          {/* 5. Próxima Cita de Revaloración (si aplica) */}
          {record.appointmentInfo?.nextDate && (
            <div className="bg-emerald-50/70 border border-emerald-300 p-2 rounded-lg text-xs flex items-center justify-between text-emerald-950">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Próxima Cita de Control:</strong> {record.appointmentInfo.nextDate} {record.appointmentInfo.nextTime ? `a las ${record.appointmentInfo.nextTime} hrs` : ''}
                </span>
              </div>
            </div>
          )}

          {/* 6. Espacio Oficial de Sello y Firma del Médico Tratante */}
          <div className="pt-6 border-t-2 border-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              
              {/* Leyenda institucional y validez legal */}
              <div className="text-[10px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">
                  Documento médico oficial válido para surtido en farmacias.
                </p>
                <p>
                  Expedido conforme a la Norma Oficial Mexicana <strong>NOM-004-SSA3-2012</strong> y los Artículos 28 y 29 del Reglamento de Insumos para la Salud.
                </p>
                <p className="font-mono text-[9px] text-slate-400">
                  Emitido por sistema: {doctorSettings.nombreClinica || 'CLINIC CARE TOY'}
                </p>
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200">
                  <div className="w-5 h-5 rounded bg-white p-0.5 border border-slate-300 flex items-center justify-center shrink-0">
                    <img src={CREATOR_LOGO_BASE64} alt="Toy" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[9px] text-slate-600 font-semibold">
                    Sistema Clínico • Desarrollado y Blindado por Toy (Marca Registrada)
                  </span>
                </div>
              </div>

              {/* Recuadro de Sello y Firma */}
              <div className="flex flex-col items-center justify-center text-center">
                {/* Cuadro simulador para sello si se desea */}
                <div className="border-2 border-dashed border-slate-300 rounded-lg w-full h-24 mb-2 flex items-center justify-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold bg-slate-50/30">
                  [ Espacio para Sello y Firma ]
                </div>
                
                <div className="border-t border-slate-800 w-64 pt-1 font-bold text-xs text-slate-900">
                  {doctorSettings.prefix} {doctorSettings.doctorName || 'Médico Tratante'}
                </div>
                <span className="text-[10px] text-slate-600 block">
                  Cédula Profesional: <strong>{doctorSettings.cedulaGeneral || 'N/E'}</strong>
                  {doctorSettings.cedulaEspecialidad && ` | Céd. Esp: ${doctorSettings.cedulaEspecialidad}`}
                </span>
                <span className="text-[9px] text-slate-400 block font-medium">
                  Firma del Médico Tratante
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

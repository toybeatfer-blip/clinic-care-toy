import React, { useState } from 'react';
import { ClinicalRecord } from '../types';
import {
  History,
  X,
  Calendar,
  Activity,
  Pill,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Camera,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface PatientTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  allRecords: ClinicalRecord[];
  currentPatientName?: string;
  currentPatientCurp?: string;
  onSelectRecord: (record: ClinicalRecord) => void;
}

export const PatientTimelineModal: React.FC<PatientTimelineModalProps> = ({
  isOpen,
  onClose,
  allRecords,
  currentPatientName = '',
  currentPatientCurp = '',
  onSelectRecord
}) => {
  const [selectedPatientKey, setSelectedPatientKey] = useState<string>('');

  if (!isOpen) return null;

  // Group records by patient
  const patientGroups: { [key: string]: { name: string; curp: string; records: ClinicalRecord[] } } = {};

  allRecords.forEach((rec) => {
    const name = `${rec.identification.nombres || ''} ${rec.identification.apellidoPaterno || ''} ${rec.identification.apellidoMaterno || ''}`.trim() || 'Paciente Sin Nombre';
    const curp = rec.identification.curp || rec.identification.rfc || '';
    const key = curp ? curp.toUpperCase() : name.toLowerCase();

    if (!patientGroups[key]) {
      patientGroups[key] = { name, curp, records: [] };
    }
    patientGroups[key].records.push(rec);
  });

  // Sort records inside each group chronologically (newest first)
  Object.values(patientGroups).forEach((group) => {
    group.records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  const patientKeys = Object.keys(patientGroups);

  // Auto-select current patient if available
  const activeKey = selectedPatientKey || (currentPatientCurp ? currentPatientCurp.toUpperCase() : currentPatientName.toLowerCase()) || patientKeys[0] || '';
  const currentGroup = patientGroups[activeKey] || (patientKeys.length > 0 ? patientGroups[patientKeys[0]] : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl">
              <History className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Línea de Tiempo e Historial Cronológico de Pacientes
              </h2>
              <p className="text-xs text-purple-100">
                Visualiza la evolución clínica, signos vitales históricos y recetas de cada visita
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout with patient selector sidebar and timeline body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Patient Selector List */}
          <div className="w-full md:w-72 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3 overflow-y-auto max-h-48 md:max-h-none space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 pb-1">
              Pacientes con Historial ({patientKeys.length})
            </span>
            {patientKeys.map((key) => {
              const group = patientGroups[key];
              const isSelected = key === activeKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedPatientKey(key)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-600 text-white font-bold shadow-sm'
                      : 'hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <p className="truncate font-semibold">{group.name}</p>
                    {group.curp && (
                      <span className={`text-[10px] block font-mono ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>
                        {group.curp}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {group.records.length} vis.
                  </span>
                </button>
              );
            })}
          </div>

          {/* Timeline View */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            {currentGroup ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {currentGroup.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {currentGroup.curp ? `CURP: ${currentGroup.curp} • ` : ''} Total de Consultas: {currentGroup.records.length}
                    </p>
                  </div>
                </div>

                {/* Timeline vertical sequence */}
                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-purple-200 dark:before:bg-purple-900">
                  {currentGroup.records.map((rec, index) => {
                    const dateFormatted = new Date(rec.createdAt).toLocaleDateString('es-MX', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    const vs = rec.historyCheckup.vitalSigns;
                    const isM3 = rec.activeModule === 'modulo3';
                    const isM4 = rec.activeModule === 'modulo4';
                    const title = isM4
                      ? `Procedimiento: ${rec.procedure.procedimientoRealizado || 'Cirugía Menor'}`
                      : isM3
                      ? `Nota de Evolución: ${rec.evolutionNote.diagnosticoActualizado || rec.evolutionNote.diagnosticoSeguimiento || 'Control'}`
                      : `Consulta Inicial: ${rec.historyCheckup.diagnosticoCie10 || 'Valoración General'}`;

                    return (
                      <div key={rec.id} className="relative group">
                        {/* Dot */}
                        <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-purple-600 dark:border-purple-400 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400" />
                        </div>

                        {/* Card */}
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-700 transition-all space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                                  {dateFormatted}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                                  {isM4 ? 'Procedimiento' : isM3 ? 'Evolución' : 'Consulta Inicial'}
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                                {title}
                              </h4>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                onSelectRecord(rec);
                                onClose();
                              }}
                              className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50 shadow-sm flex items-center gap-1 self-start sm:self-auto transition-all"
                            >
                              Cargar en Editor
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Vital Signs snapshot */}
                          {vs && (vs.taSistolica || vs.temp || vs.peso) && (
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-mono">
                              <div>T/A: <strong>{vs.taPediatricaBadge || `${vs.taSistolica}/${vs.taDiastolica}`}</strong></div>
                              <div>Temp: <strong>{vs.temp}°C</strong></div>
                              <div>FC: <strong>{vs.fc} lpm</strong></div>
                              <div>Peso: <strong>{vs.peso} kg</strong></div>
                              <div>IMC: <strong>{vs.imc}</strong></div>
                            </div>
                          )}

                          {/* Rx summary */}
                          {rec.historyCheckup.prescripcion && rec.historyCheckup.prescripcion.length > 0 && (
                            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                              <span className="font-bold flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-400">
                                <Pill className="w-3.5 h-3.5" />
                                Tratamiento Prescrito ({rec.historyCheckup.prescripcion.length} medicamentos):
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {rec.historyCheckup.prescripcion.map((p, idx) => (
                                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-medium">
                                    {p.producto}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Photos indicator */}
                          {rec.clinicalImages && rec.clinicalImages.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 font-semibold">
                              <Camera className="w-3.5 h-3.5" />
                              <span>{rec.clinicalImages.length} fotografía(s) clínica(s) adjunta(s)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">
                No hay expedientes registrados en el sistema para generar la línea de tiempo.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

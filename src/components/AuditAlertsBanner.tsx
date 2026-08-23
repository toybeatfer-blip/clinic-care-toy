import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import { ClinicalRecord } from '../types';
import { validateAuditRules, cleanForbiddenAcronyms } from '../utils/nom004Validator';

interface AuditAlertsBannerProps {
  record: ClinicalRecord;
  onUpdateRecord: (updated: ClinicalRecord) => void;
}

export const AuditAlertsBanner: React.FC<AuditAlertsBannerProps> = ({ record, onUpdateRecord }) => {
  const [expanded, setExpanded] = useState(false);
  const issues = validateAuditRules(record);

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  const handleFixAll = () => {
    let updated: ClinicalRecord = JSON.parse(JSON.stringify(record));

    // 1. Limpiar siglas prohibidas en textos
    updated.historyCheckup.padecimientoActual = cleanForbiddenAcronyms(updated.historyCheckup.padecimientoActual);
    updated.historyCheckup.interrogatorioAparatos = cleanForbiddenAcronyms(updated.historyCheckup.interrogatorioAparatos);
    updated.historyCheckup.physicalExam.habitusExterior = cleanForbiddenAcronyms(updated.historyCheckup.physicalExam.habitusExterior);
    updated.historyCheckup.physicalExam.cabezaCuello = cleanForbiddenAcronyms(updated.historyCheckup.physicalExam.cabezaCuello);
    updated.historyCheckup.physicalExam.torax = cleanForbiddenAcronyms(updated.historyCheckup.physicalExam.torax);
    updated.historyCheckup.physicalExam.abdomen = cleanForbiddenAcronyms(updated.historyCheckup.physicalExam.abdomen);
    updated.historyCheckup.physicalExam.miembros = cleanForbiddenAcronyms(updated.historyCheckup.physicalExam.miembros);
    updated.historyCheckup.indicacionTerapeutica = cleanForbiddenAcronyms(updated.historyCheckup.indicacionTerapeutica);
    updated.evolutionNote.evolucionCuadroClinico = cleanForbiddenAcronyms(updated.evolutionNote.evolucionCuadroClinico);
    updated.procedure.observacionesObligatorias = cleanForbiddenAcronyms(updated.procedure.observacionesObligatorias);

    // 2. Asegurar cierre de interrogatorio
    let interr = updated.historyCheckup.interrogatorioAparatos.trim();
    if (!interr.includes('resto del interrogatorio negado')) {
      interr = interr ? `${interr}, resto del interrogatorio negado.` : 'Sin sintomatología agregada, resto del interrogatorio negado.';
      updated.historyCheckup.interrogatorioAparatos = interr;
    }

    // 3. Corregir talla si está en cm
    const tallaNum = parseFloat(updated.historyCheckup.vitalSigns.talla);
    if (tallaNum > 3.0) {
      updated.historyCheckup.vitalSigns.talla = (tallaNum / 100).toFixed(2);
    }

    // 4. Genitales diferido
    if (!updated.historyCheckup.physicalExam.genitales) {
      updated.historyCheckup.physicalExam.genitales = 'Diferido';
    }

    // 5. Antecedentes vacíos
    const id = updated.identification;
    if (!id.antecedentesHeredofamiliares) id.antecedentesHeredofamiliares = 'Interrogados y negados';
    if (!id.antecedentesPersonalesPatologicos) id.antecedentesPersonalesPatologicos = 'Interrogados y negados';
    if (!id.farmacodependencias) id.farmacodependencias = 'Negadas';
    if (!id.tabaquismo) id.tabaquismo = 'Negado';
    if (!id.alcoholismo) id.alcoholismo = 'Negado';
    if (!id.alergias) id.alergias = 'Negadas';

    onUpdateRecord(updated);
  };

  const isCompliant = issues.length === 0;

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
      isCompliant
        ? 'bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
        : errors.length > 0
          ? 'bg-rose-50/90 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800'
          : 'bg-amber-50/90 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800'
    }`}>
      <div className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isCompliant
              ? 'bg-emerald-500 text-white'
              : errors.length > 0
                ? 'bg-rose-500 text-white'
                : 'bg-amber-500 text-white'
          }`}>
            {isCompliant ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Auditoría SAC y NOM-004-SSA3-2012
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isCompliant
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                  : errors.length > 0
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
              }`}>
                {isCompliant ? '100% Normativo' : `${issues.length} Observaciones (${errors.length} críticas)`}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {isCompliant
                ? 'El expediente cumple estrictamente con los lineamientos de auditoría y llenado del SAC.'
                : 'Se detectaron campos pendientes o siglas no autorizadas que podrían generar no-conformidad en auditoría.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCompliant && (
            <button
              type="button"
              onClick={handleFixAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all active:scale-95"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Corregir Todo Automáticamente</span>
            </button>
          )}

          {issues.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title={expanded ? 'Ocultar detalles' : 'Ver observaciones de auditoría'}
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {expanded && issues.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 bg-white/50 dark:bg-slate-900/50 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Detalle de Observaciones para Auditoría
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1 ${
                  issue.severity === 'error'
                    ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>[{issue.module}] {issue.field}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/70 dark:bg-slate-800">
                    {issue.severity === 'error' ? 'Crítico' : 'Sugerencia'}
                  </span>
                </div>
                <p className="text-[11px] opacity-90">{issue.message}</p>
                {issue.suggestion && (
                  <p className="text-[11px] font-mono bg-white/80 dark:bg-slate-800/80 p-1 rounded border border-black/5">
                    💡 Sugerido: {issue.suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { EvolutionNoteData } from '../types';
import { FieldWithCopy } from './FieldWithCopy';
import { CopyButton } from './CopyButton';
import { generateModule3Text, calculateIMC, formatTallaInput } from '../utils/nom004Validator';
import { DiagnosticStudiesCard } from './DiagnosticStudiesCard';
import { ClipboardList, Activity } from 'lucide-react';

interface Module3EvolutionNoteProps {
  data: EvolutionNoteData;
  onChange: (updated: EvolutionNoteData) => void;
}

export const Module3EvolutionNote: React.FC<Module3EvolutionNoteProps> = ({
  data,
  onChange
}) => {
  const updateField = <K extends keyof EvolutionNoteData>(field: K, value: EvolutionNoteData[K]) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const updateVital = (field: keyof typeof data.vitalSigns, val: string) => {
    const nextSigns = {
      ...data.vitalSigns,
      [field]: val
    };
    if (field === 'peso' || field === 'talla') {
      const calc = calculateIMC(field === 'peso' ? val : nextSigns.peso, field === 'talla' ? val : nextSigns.talla);
      nextSigns.imc = calc.imc;
    }
    updateField('vitalSigns', nextSigns);
  };

  const fullText = generateModule3Text(data);

  return (
    <div className="space-y-6">
      {/* Module Title & Global Copy */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Módulo 3: Nota de Evolución y Seguimiento
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Revaloración de tratamiento previo, respuesta clínica, exploración dirigida y ajuste terapéutico en SAC
            </p>
          </div>
        </div>

        <CopyButton
          text={fullText}
          label="Copiar Nota de Evolución Completa"
          variant="primary"
          size="md"
        />
      </div>

      {/* Main Content Form */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <FieldWithCopy
          label="Diagnóstico de Seguimiento (Diagnóstico Previo)"
          value={data.diagnosticoSeguimiento}
          onChange={(v) => updateField('diagnosticoSeguimiento', v)}
          placeholder="Ej. J00X - Rinofaringitis aguda [resfriado común]"
          required
        />

        {/* Current Vital Signs with SpO2 */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              <Activity className="w-4 h-4" />
              <span>Signos Vitales Actuales de Revaloración (con SpO2)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              IMC: {data.vitalSigns?.imc || '0.00'} kg/m²
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            <FieldWithCopy
              label="Temp (°C)"
              value={data.vitalSigns?.temp || ''}
              onChange={(v) => updateVital('temp', v)}
              placeholder="36.5"
            />

            <FieldWithCopy
              label="T/A Sist."
              value={data.vitalSigns?.taSistolica || ''}
              onChange={(v) => updateVital('taSistolica', v)}
              placeholder="120"
            />

            <FieldWithCopy
              label="T/A Diast."
              value={data.vitalSigns?.taDiastolica || ''}
              onChange={(v) => updateVital('taDiastolica', v)}
              placeholder="80"
            />

            <FieldWithCopy
              label="FC (lpm)"
              value={data.vitalSigns?.fc || ''}
              onChange={(v) => updateVital('fc', v)}
              placeholder="75"
            />

            <FieldWithCopy
              label="FR (rpm)"
              value={data.vitalSigns?.fr || ''}
              onChange={(v) => updateVital('fr', v)}
              placeholder="18"
            />

            {/* SpO2 */}
            <FieldWithCopy
              label="SpO2 (%)"
              value={data.vitalSigns?.satO2 || ''}
              onChange={(v) => updateVital('satO2', v)}
              placeholder="98"
              quickFillOptions={['98', '99', '97', '96', '95']}
            />

            <FieldWithCopy
              label="Peso (kg)"
              value={data.vitalSigns?.peso || ''}
              onChange={(v) => updateVital('peso', v)}
              placeholder="70.0"
            />
          </div>
        </div>

        <FieldWithCopy
          label="Evolución y Actualización del Cuadro Clínico"
          value={data.evolucionCuadroClinico}
          onChange={(v) => updateField('evolucionCuadroClinico', v)}
          type="textarea"
          rows={3}
          placeholder="Evolución cronológica de síntomas, respuesta y tolerancia al tratamiento previo..."
          quickFillOptions={[
            'Paciente acude a revaloración médica. Refiere adecuada respuesta y tolerancia al tratamiento previo, con disminución notable de la sintomatología inicial. Niega efectos adversos.',
            'Refiere mejoría parcial de los síntomas; persiste con tos leve de predominio nocturno. Niega fiebre en las últimas 48 horas.',
            'Acude a control rutinario. Asintomático al momento del interrogatorio, con apego terapéutico completo.'
          ]}
          required
        />

        <FieldWithCopy
          label="Exploración Física Dirigida"
          value={data.exploracionFisicaDirigida}
          onChange={(v) => updateField('exploracionFisicaDirigida', v)}
          type="textarea"
          rows={2}
          placeholder="Hallazgos dirigidos o 'Sin datos patológicos'..."
          quickFillOptions={[
            'Paciente consciente, orientado, adecuada coloración e hidratación. Faringe sin hiperemia, campos pulmonares limpios y bien ventilados, abdomen sin alteraciones.',
            'Sin datos patológicos agudos agregados en la exploración física dirigida.'
          ]}
          required
        />

        {/* Estudios de Laboratorio y Gabinete en Seguimiento */}
        <DiagnosticStudiesCard
          data={data.estudiosDiagnostico}
          onChange={(updatedStudies) => updateField('estudiosDiagnostico', updatedStudies)}
          title="Estudios de Laboratorio y Gabinete (Seguimiento / Control)"
          subtitle="Resultados de control aportados por el paciente en esta revaloración (RX, USG, TAC, Labs)"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWithCopy
            label="Diagnóstico Actualizado"
            value={data.diagnosticoActualizado}
            onChange={(v) => updateField('diagnosticoActualizado', v)}
            placeholder="CIE-10 actualizado o confirmatorio..."
            quickFillOptions={[
              'Diagnóstico de control y seguimiento en resolución favorable.',
              'I10X - Hipertensión esencial (primaria) en metas de control.',
              'E11.9 - Diabetes mellitus tipo 2 en adecuado control glucémico.'
            ]}
            required
          />

          <FieldWithCopy
            label="Plan Terapéutico y Receta"
            value={data.planTerapeutico}
            onChange={(v) => updateField('planTerapeutico', v)}
            type="textarea"
            rows={2}
            placeholder="Ajuste de dosis, continuación de tratamiento o alta médica..."
            quickFillOptions={[
              'Se mantiene esquema farmacológico actual hasta concluir los días indicados. Se reiteran medidas generales e hidratación. Cita abierta.',
              'Se da de alta por mejoría clínica evidente. Cita abierta en caso de requerir nueva valoración.',
              'Se ajusta dosificación de antihipertensivo y se cita a control en 15 días con bitácora de presión.'
            ]}
          />
        </div>
      </div>
    </div>
  );
};

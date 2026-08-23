import React from 'react';
import { ProcedureData } from '../types';
import { FieldWithCopy } from './FieldWithCopy';
import { CopyButton } from './CopyButton';
import { generateModule4Text } from '../utils/nom004Validator';
import { Syringe, ShieldCheck, Users, Scissors, Droplets } from 'lucide-react';

interface Module4ProceduresProps {
  data: ProcedureData;
  onChange: (updated: ProcedureData) => void;
}

const PROCEDURE_TEMPLATES = [
  {
    name: 'Inyección Intramuscular',
    procedimiento: 'Aplicación de Inyección Intramuscular',
    observaciones: 'Se realiza asepsia y antisepsia de región glútea superior externa. Se administra medicamento prescrito vía intramuscular profunda con técnica estéril. Paciente tolera procedimiento sin complicaciones inmediatas.',
    testigos: 'Se cuenta con firma de consentimiento informado por paciente y testigo'
  },
  {
    name: 'Curación Menor / Lavado',
    procedimiento: 'Curación de Herida Quirúrgica / Traumática Menor',
    observaciones: 'Se realiza lavado de herida con solución fisiológica al 0.9% y antiséptico tópico bajo técnica estéril. Se retira tejido desvitalizado, se seca y se cubre con gasa estéril y cinta microporosa. Se explican signos de infección.',
    testigos: 'Se cuenta con firma de consentimiento informado por paciente y testigo'
  },
  {
    name: 'Retiro de Puntos de Sutura',
    procedimiento: 'Retiro de Puntos de Sutura',
    observaciones: 'Se realiza asepsia de la herida, se verifica adecuada cicatrización y bordes afrontados sin dehiscencia ni datos de infección. Se retiran puntos de sutura de forma alternada sin eventualidades.',
    testigos: 'Se cuenta con firma de consentimiento informado por paciente y testigo'
  },
  {
    name: 'Toma de Glucosa Capilar',
    procedimiento: 'Monitoreo de Glucosa Capilar (Dextrostix)',
    observaciones: 'Se realiza asepsia de pulpejo digital con técnica estéril. Se obtiene muestra capilar mediante punción con lanceta descartable. Resultado obtenido: Glucosa capilar en ayunas / posprandial. Paciente orientado sobre sus cifras.',
    testigos: 'Se cuenta con firma de consentimiento informado por paciente y testigo'
  }
];

export const Module4Procedures: React.FC<Module4ProceduresProps> = ({
  data,
  onChange
}) => {
  const updateField = <K extends keyof ProcedureData>(field: K, value: ProcedureData[K]) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const applyTemplate = (tmpl: typeof PROCEDURE_TEMPLATES[0]) => {
    onChange({
      ...data,
      procedimientoRealizado: tmpl.procedimiento,
      observacionesObligatorias: tmpl.observaciones,
      leyendaTestigos: tmpl.testigos
    });
  };

  const fullText = generateModule4Text(data);

  return (
    <div className="space-y-6">
      {/* Module Header & Global Copy */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Módulo 4: Procedimientos y Consentimientos Informados
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registro normativo de inyecciones intramusculares, curaciones, retiro de puntos, somatometría y testigos en SAC
            </p>
          </div>
        </div>

        <CopyButton
          text={fullText}
          label="Copiar Procedimiento Completo"
          variant="primary"
          size="md"
        />
      </div>

      {/* Quick Template Selector */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Plantillas Rápidas de Procedimientos Habituales:
        </span>
        <div className="flex flex-wrap gap-2">
          {PROCEDURE_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyTemplate(tmpl)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 font-medium transition-all shadow-sm"
            >
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <FieldWithCopy
          label="Procedimiento Realizado (Nombre Exacto Cobrado en Ticket)"
          value={data.procedimientoRealizado}
          onChange={(v) => updateField('procedimientoRealizado', v)}
          placeholder="Ej. Aplicación de Inyección Intramuscular"
          quickFillOptions={[
            'Aplicación de Inyección Intramuscular',
            'Curación Menor',
            'Retiro de Puntos de Sutura',
            'Lavado de Oído / Extracción de Tapón de Cerumen',
            'Toma de Glucosa Capilar',
            'Toma de Presión Arterial y Somatometría'
          ]}
          required
        />

        {/* Dynamic Helpers for Specific Procedures */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700">
          <FieldWithCopy
            label="Fármaco / Sustancia y Dosis Exacta (Para Inyecciones)"
            value={data.farmacoAdministrado || ''}
            onChange={(v) => updateField('farmacoAdministrado', v)}
            placeholder="Ej. Ketorolaco 30 mg / 1 ml (ALMUS)"
            quickFillOptions={[
              'Ketorolaco 30 mg / 1 ml (ALMUS)',
              'Ceftriaxona 1 g con Lidocaína IM (ALMUS)',
              'Dexametasona 8 mg / 2 ml',
              'Complejo B / Lidocaína'
            ]}
          />

          <FieldWithCopy
            label="Zona de Aplicación / Región Anatómica"
            value={data.zonaAplicacion || ''}
            onChange={(v) => updateField('zonaAplicacion', v)}
            placeholder="Ej. Región glútea izquierda cuadrante superior externo"
            quickFillOptions={[
              'Región glútea cuadrante superior externo',
              'Región deltoidea',
              'Miembro superior derecho'
            ]}
          />
        </div>

        <FieldWithCopy
          label="Observaciones Obligatorias de Procedimiento (NOM-004)"
          value={data.observacionesObligatorias}
          onChange={(v) => updateField('observacionesObligatorias', v)}
          type="textarea"
          rows={3}
          placeholder="Descripción detallada de la técnica, asepsia, sustancia administrada, tolerancia y riesgos explicados..."
          required
        />

        {/* Leyenda de Testigos Obligatoria */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Leyenda de Consentimiento Informado y Testigos (Auditoría SAC)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Se cuenta con firma de consentimiento informado por paciente y testigo',
              'No se cuenta con un segundo testigo'
            ].map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => updateField('leyendaTestigos', opt)}
                className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                  data.leyendaTestigos === opt
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <FieldWithCopy
            label="Texto Exacto de Leyenda de Testigos"
            value={data.leyendaTestigos}
            onChange={(v) => updateField('leyendaTestigos', v)}
          />
        </div>
      </div>
    </div>
  );
};

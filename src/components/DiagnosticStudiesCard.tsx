import React, { useState } from 'react';
import { DiagnosticStudiesData } from '../types';
import { FieldWithCopy } from './FieldWithCopy';
import { CopyButton } from './CopyButton';
import {
  FlaskConical,
  Activity,
  FileSearch,
  Layers,
  Sparkles,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';

interface DiagnosticStudiesCardProps {
  data?: DiagnosticStudiesData;
  onChange: (updated: DiagnosticStudiesData) => void;
  title?: string;
  subtitle?: string;
}

export const DiagnosticStudiesCard: React.FC<DiagnosticStudiesCardProps> = ({
  data = {},
  onChange,
  title = 'Estudios Previos / Aportados por el Paciente (Laboratorio y Gabinete)',
  subtitle = 'Registro de Laboratorios, Rayos X (RX), Ultrasonido (USG), Tomografía (TAC) y otros'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'labs' | 'rx' | 'usg' | 'tac' | 'otros'>('all');

  const updateField = (field: keyof DiagnosticStudiesData, val: string) => {
    onChange({
      ...data,
      [field]: val
    });
  };

  // Generar texto resumen de estudios para copiar
  const generateStudiesSummaryText = (): string => {
    const lines: string[] = [];
    if (data.laboratorios?.trim()) lines.push(`- Laboratorios Clínicos: ${data.laboratorios.trim()}`);
    if (data.rayosX?.trim()) lines.push(`- Rayos X (RX): ${data.rayosX.trim()}`);
    if (data.ultrasonido?.trim()) lines.push(`- Ultrasonido (USG): ${data.ultrasonido.trim()}`);
    if (data.tomografiaTac?.trim()) lines.push(`- Tomografía Computarizada (TAC): ${data.tomografiaTac.trim()}`);
    if (data.otrosEstudios?.trim()) lines.push(`- Otros Estudios (RMN / ECG): ${data.otrosEstudios.trim()}`);
    if (data.interpretacionHallazgos?.trim()) lines.push(`- Interpretación / Conclusión Médica: ${data.interpretacionHallazgos.trim()}`);

    if (lines.length === 0) return 'Sin estudios previos de laboratorio o gabinete aportados por el paciente en esta consulta.';
    return `[ESTUDIOS PREVIOS Y RESULTADOS APORTADOS]\n${lines.join('\n')}`;
  };

  const hasAnyData = Boolean(
    data.laboratorios?.trim() ||
    data.rayosX?.trim() ||
    data.ultrasonido?.trim() ||
    data.tomografiaTac?.trim() ||
    data.otrosEstudios?.trim() ||
    data.interpretacionHallazgos?.trim()
  );

  return (
    <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                {title}
              </h3>
              {hasAnyData && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Con Estudios
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Global summary copy button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <CopyButton
            text={generateStudiesSummaryText()}
            label="Copiar Bloque de Estudios"
            size="sm"
            variant="outline"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('all')}
          className={`px-3 py-1 rounded-md font-semibold transition-all ${
            activeSubTab === 'all'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300'
          }`}
        >
          Todos los Estudios
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('labs')}
          className={`px-3 py-1 rounded-md font-semibold transition-all ${
            activeSubTab === 'labs'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300'
          }`}
        >
          🔬 Laboratorios
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('rx')}
          className={`px-3 py-1 rounded-md font-semibold transition-all ${
            activeSubTab === 'rx'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300'
          }`}
        >
          🩻 Rayos X (RX)
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('usg')}
          className={`px-3 py-1 rounded-md font-semibold transition-all ${
            activeSubTab === 'usg'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300'
          }`}
        >
          🩺 Ultrasonido (USG)
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('tac')}
          className={`px-3 py-1 rounded-md font-semibold transition-all ${
            activeSubTab === 'tac'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300'
          }`}
        >
          🧠 Tomografía (TAC)
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('otros')}
          className={`px-3 py-1 rounded-md font-semibold transition-all ${
            activeSubTab === 'otros'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300'
          }`}
        >
          📋 Otros / RMN
        </button>
      </div>

      {/* Grid of Fields */}
      <div className="space-y-4">
        
        {/* 1. Laboratorios Clínicos */}
        {(activeSubTab === 'all' || activeSubTab === 'labs') && (
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <FieldWithCopy
              label="🔬 Estudios de Laboratorio Clínico (BH, Química Sanguínea, EGO, Perfiles, etc.)"
              value={data.laboratorios || ''}
              onChange={(v) => updateField('laboratorios', v)}
              type="textarea"
              rows={2}
              placeholder="Ej. Biometría hemática completa dentro de parámetros normales (Hb: 14.5 g/dL, Leucocitos: 7,200/mm³, Plaquetas: 240,000/mm³). Glucosa en ayuno: 94 mg/dL. EGO sin datos de infección."
              quickFillOptions={[
                'Biometría hemática y química sanguínea dentro de parámetros normales de referencia.',
                'Examen General de Orina (EGO) con leucocituria y bacteriuria moderada, compatible con infección de vías urinarias.',
                'Química sanguínea: Glucosa 108 mg/dL, Colesterol total 220 mg/dL, Triglicéridos 195 mg/dL. Función renal conservada.',
                'Sin estudios de laboratorio aportados en esta consulta.'
              ]}
              helpText="* Asienta los valores relevantes, fecha de toma y laboratorio de procedencia si aplica."
            />
          </div>
        )}

        {/* 2. Rayos X (RX) */}
        {(activeSubTab === 'all' || activeSubTab === 'rx') && (
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <FieldWithCopy
              label="🩻 Radiografías / Rayos X (RX)"
              value={data.rayosX || ''}
              onChange={(v) => updateField('rayosX', v)}
              type="textarea"
              rows={2}
              placeholder="Ej. Telerradiografía de tórax PA: Silueta cardiaca de tamaño normal, campos pulmonares bien expandidos sin consolidaciones, derrames ni infiltrados pleuropulmonares agudos."
              quickFillOptions={[
                'RX Tórax PA: Campos pulmonares bien ventilados, sin infiltrados ni consolidaciones neumónicas, senos costofrénicos y cardiofrénicos libres, silueta cardiaca normal.',
                'RX Columna Lumbar AP y Lateral: Alineación vertebral conservada, espacios intersomáticos respetados, sin datos de espondilolistesis ni fracturas óseas agudas.',
                'RX Abdomen Simple en bipedestación: Distribución aérea normal, sin niveles hidroaéreos anormales ni aire libre subdiafragmático.',
                'RX Ósea / Extremidades: Integridad cortical ósea conservada, sin trazos de fractura ni luxación articular evidente.'
              ]}
              helpText="* Describe la proyección, región anatómica y hallazgos óseos o de partes blandas."
            />
          </div>
        )}

        {/* 3. Ultrasonido (USG / Ecografía) */}
        {(activeSubTab === 'all' || activeSubTab === 'usg') && (
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <FieldWithCopy
              label="🩺 Ultrasonido / Ecografía (USG)"
              value={data.ultrasonido || ''}
              onChange={(v) => updateField('ultrasonido', v)}
              type="textarea"
              rows={2}
              placeholder="Ej. USG Abdominal superior: Hígado de tamaño y ecogenicidad normal, vesícula biliar de paredes delgadas sin litiasis en su interior, vía biliar intra y extrahepática de calibre normal. Riñones sin ectasia."
              quickFillOptions={[
                'USG Abdomen Completo: Hígado, vesícula biliar, páncreas, bazo y ambos riñones de morfología y ecogenicidad habitual, sin litiasis, masas ni colecciones libres.',
                'USG Renal y Vías Urinarias: Ambos riñones de forma y tamaño normal, diferenciación córtico-medular conservada, sin litiasis ni datos de hidronefrosis. Vejiga urinaria con adecuado vaciamiento.',
                'USG Pélvico / Ginecológico: Útero en anteversoflexión de contornos regulares, endometrio homogéneo, anexos y ovarios sin imágenes quísticas o tumorales palpables.',
                'USG Obstétrico: Feto único intrauterino, biometría acorde a edad gestacional, frecuencia cardiaca fetal presente regular, líquido amniótico en cantidad normal.'
              ]}
              helpText="* Asienta el reporte del radiólogo o médico ecografista y correlación clínica."
            />
          </div>
        )}

        {/* 4. Tomografía Computarizada (TAC) */}
        {(activeSubTab === 'all' || activeSubTab === 'tac') && (
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <FieldWithCopy
              label="🧠 Tomografía Axial Computarizada (TAC)"
              value={data.tomografiaTac || ''}
              onChange={(v) => updateField('tomografiaTac', v)}
              type="textarea"
              rows={2}
              placeholder="Ej. TAC Simple de Cráneo: Sistema ventricular simétrico de tamaño normal, adecuada diferenciación entre sustancia gris y blanca, sin evidencia de colecciones hemorrágicas, edema cerebral ni lesiones isquémicas agudas."
              quickFillOptions={[
                'TAC Cráneo Simple: Sin evidencia de hemorragia intra o extraaxial, línea media centrada, sistema ventricular sin dilatación, parénquima cerebral sin lesiones focales agudas.',
                'TAC Tórax de Alta Resolución: Parénquima pulmonar sin patrón en vidrio deslustrado, sin consolidaciones alveolares ni adenopatías mediastinales significativas.',
                'TAC Abdomen y Pelvis Simple: Órganos sólidos abdominales homogéneos sin lesiones ocupantes de espacio, asas intestinales de calibre normal, sin líquido libre en cavidad peritoneal.'
              ]}
              helpText="* Detalla si el estudio fue simple o contrastado y los hallazgos radiológicos."
            />
          </div>
        )}

        {/* 5. Otros Estudios (RMN, ECG, Endoscopía) */}
        {(activeSubTab === 'all' || activeSubTab === 'otros') && (
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <FieldWithCopy
              label="📋 Otros Estudios de Gabinete (RMN, Electrocardiograma, Espirometría, etc.)"
              value={data.otrosEstudios || ''}
              onChange={(v) => updateField('otrosEstudios', v)}
              type="textarea"
              rows={2}
              placeholder="Ej. Electrocardiograma de 12 derivaciones (ECG): Ritmo sinusal, FC 75 lpm, eje QRS normal a +60°, intervalos PR y QT normales, sin datos de isquemia, lesión ni necrosis."
              quickFillOptions={[
                'Electrocardiograma (ECG): Ritmo sinusal, frecuencia cardiaca 72 lpm, intervalos y segmentos dentro de límites normales, sin alteraciones en repolarización ventricular.',
                'Resonancia Magnética (RMN): Estructuras anatómicas bien definidas, sin zonas de señal anómala ni procesos expansivos patológicos.',
                'Espirometría / Prueba de Función Pulmonar: Patrón ventilatorio normal, sin datos de obstrucción ni restricción al flujo aéreo.'
              ]}
            />
          </div>
        )}

        {/* 6. Conclusión e Interpretación Médica de los Estudios */}
        <div className="p-3.5 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 space-y-2">
          <FieldWithCopy
            label="📝 Interpretación / Conclusión Médica de los Estudios Aportados"
            value={data.interpretacionHallazgos || ''}
            onChange={(v) => updateField('interpretacionHallazgos', v)}
            type="textarea"
            rows={2}
            placeholder="Ej. Estudios de laboratorio y gabinete concordantes con cuadro clínico actual. Se correlacionan hallazgos para ajuste de esquema terapéutico."
            quickFillOptions={[
              'Estudios de laboratorio y gabinete aportados se encuentran dentro de límites normales de referencia, concordantes con evolución clínica favorable.',
              'Resultados de gabinete y laboratorio correlacionan clínicamente con el diagnóstico presuntivo, sustentando el plan de tratamiento establecido.',
              'Sin alteraciones patológicas agudas en los estudios de apoyo diagnóstico aportados por el paciente.'
            ]}
            helpText="* Conclusión diagnóstica integral derivada de los estudios aportados."
          />
        </div>

      </div>
    </div>
  );
};

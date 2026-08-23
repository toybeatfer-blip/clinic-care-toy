import React, { useState } from 'react';
import { X, Wand2, Sparkles, Check, FileText, ArrowRight, RefreshCw } from 'lucide-react';
import { ClinicalRecord } from '../types';
import { parseRawMedicalNote } from '../utils/rawDataParser';

interface RawDataParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRecord: ClinicalRecord;
  onApplyParsedData: (updatedRecord: ClinicalRecord) => void;
}

const SAMPLE_RAW_NOTES = [
  {
    label: 'Infección Respiratoria (Faringoamigdalitis)',
    text: `Paciente masculino de 34 años de edad, refiere que hace 3 días inició con dolor intenso de garganta al tragar, fiebre cuantificada en 38.4 °C, malestar general, dolor de cabeza y escalofríos. No ha tomado medicamento.
Signos vitales: TA 120/80, FC 84 lpm, FR 19 rpm, Temp 38.3 °C, Peso 78 kg, Talla 1.74 m.
Exploración: Faringe muy enrojecida con placas de pus en amígdalas, no tiene tos, cuello con ganglios inflamados dolorosos.
Dx: Faringoamigdalitis aguda bacteriana.
Tx: Amoxicilina con ácido clavulánico 875/125 mg cada 12 horas por 7 días, Paracetamol 750 mg cada 8 horas por 4 días.`
  },
  {
    label: 'Gastroenteritis / Gastritis',
    text: `Femenina de 26 años viene por dolor en la boca del estómago tipo ardor desde hace 4 días, acompañado de náuseas, reflujo y agruras después de comer alimentos grasosos o café.
Signos: TA 110/70, FC 72, FR 16, Temp 36.6, Peso 62 kg, Talla 1.62.
Exploración: Abdomen doloroso a la palpación en epigastrio, sin datos de apendicitis ni irritación.
Dx: Gastritis aguda y reflujo gastroesofágico.
Tx: Omeprazol 20 mg 1 cápsula en ayunas por 28 días, Gel hidróxido de aluminio y magnesio 1 cucharada después de comidas.`
  },
  {
    label: 'Infección Urinaria (Cistitis)',
    text: `Mujer de 45 años consulta por ardor y dolor al orinar (disuria), aumento en la frecuencia urinaria (polaquiuria) y sensación de vaciado incompleto desde hace 48 horas. Sin fiebre.
Signos: TA 125/80, FC 78, FR 18, Temp 36.8 °C, Peso 69 kg, Talla 1.60 m.
Dx: Infección de vías urinarias no complicada (Cistitis aguda).
Tx: Nitrofurantoína 100 mg cada 6 horas por 7 días con alimentos, abundante agua.`
  },
  {
    label: 'Lumbalgia Mecánica',
    text: `Hombre de 50 años que cargó un bulto pesado ayer en el trabajo y presentó dolor agudo en región lumbar baja que le dificulta agacharse o caminar erguido.
Signos: TA 130/85, FC 80, FR 18, Temp 36.5, Peso 85 kg, Talla 1.70.
Exploración: Contractura muscular paravertebral lumbar bilateral, arcos de movimiento limitados por dolor, maniobra de Lasègue negativa.
Dx: Lumbago no especificado (Lumbalgia mecánica aguda).
Tx: Ketorolaco 10 mg sublingual cada 8 horas por 3 días, Paracetamol 750 mg cada 8 horas, reposo relativo.`
  }
];

export const RawDataParserModal: React.FC<RawDataParserModalProps> = ({
  isOpen,
  onClose,
  currentRecord,
  onApplyParsedData
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [previewParsed, setPreviewParsed] = useState<Partial<ClinicalRecord> | null>(null);

  if (!isOpen) return null;

  const handleProcess = () => {
    if (!rawText.trim()) return;
    const parsed = parseRawMedicalNote(rawText, currentRecord);
    setPreviewParsed(parsed);
  };

  const handleApply = () => {
    if (!previewParsed) return;
    
    const merged: ClinicalRecord = {
      ...currentRecord,
      identification: {
        ...currentRecord.identification,
        ...(previewParsed.identification || {})
      },
      historyCheckup: {
        ...currentRecord.historyCheckup,
        ...(previewParsed.historyCheckup || {})
      },
      updatedAt: new Date().toISOString()
    };

    onApplyParsedData(merged);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-600 to-indigo-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl">
              <Sparkles className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Redactor y Procesador Inteligente de Datos en Bruto</h2>
              <p className="text-xs text-sky-100">
                Pega tus notas rápidas, dictados o apuntes y estructúralos en formato normativo NOM-004 para el SAC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Examples */}
          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
              Cargar ejemplos de prueba rápida:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_RAW_NOTES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setRawText(sample.text);
                    const parsed = parseRawMedicalNote(sample.text, currentRecord);
                    setPreviewParsed(parsed);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 font-medium transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Texto en Bruto / Dictado Clínico</span>
              </label>
              {rawText && (
                <button
                  onClick={() => { setRawText(''); setPreviewParsed(null); }}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Limpiar texto
                </button>
              )}
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Escribe o pega aquí la nota médica libre (ej. Paciente mujer 30a con tos con flema, fiebre 38.1, TA 120/80, faringe irritada, amoxicilina 500 c/8h x 7d, paracetamol)..."
              rows={5}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleProcess}
                disabled={!rawText.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Wand2 className="w-4 h-4" />
                <span>Procesar y Estructurar Datos</span>
              </button>
            </div>
          </div>

          {/* Live Preview of Parsed Result */}
          {previewParsed && (
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Estructuración Clínica Generada (NOM-004)</span>
                </h3>
                <span className="text-[11px] text-slate-500">Listo para aplicar al expediente</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 md:space-y-0">
                <div className="space-y-2">
                  <div>
                    <strong className="text-slate-500 block text-[10px] uppercase">Padecimiento Actual Formal:</strong>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {previewParsed.historyCheckup?.padecimientoActual}
                    </p>
                  </div>

                  <div>
                    <strong className="text-slate-500 block text-[10px] uppercase">Signos Vitales y Somatometría:</strong>
                    <div className="font-mono text-slate-700 dark:text-slate-300">
                      Temp: {previewParsed.historyCheckup?.vitalSigns.temp}°C | T/A: {previewParsed.historyCheckup?.vitalSigns.taSistolica}/{previewParsed.historyCheckup?.vitalSigns.taDiastolica} | FC: {previewParsed.historyCheckup?.vitalSigns.fc} | FR: {previewParsed.historyCheckup?.vitalSigns.fr} | Peso: {previewParsed.historyCheckup?.vitalSigns.peso} kg | Talla: {previewParsed.historyCheckup?.vitalSigns.talla} m | IMC: {previewParsed.historyCheckup?.vitalSigns.imc}
                    </div>
                  </div>

                  <div>
                    <strong className="text-slate-500 block text-[10px] uppercase">Diagnóstico CIE-10 Asignado:</strong>
                    <span className="inline-block px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 font-semibold">
                      {previewParsed.historyCheckup?.diagnosticoCie10}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <strong className="text-slate-500 block text-[10px] uppercase">Prescripción Institucional Detectada:</strong>
                    {previewParsed.historyCheckup?.prescripcion && previewParsed.historyCheckup.prescripcion.length > 0 ? (
                      <ul className="space-y-1">
                        {previewParsed.historyCheckup.prescripcion.map((p, i) => (
                          <li key={i} className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-sky-700 dark:text-sky-400">{p.producto}</span>
                            <div className="text-[11px] text-slate-600 dark:text-slate-300">
                              {p.dosis} - {p.periodicidad}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-slate-500 italic">Sin medicamentos detectados</span>
                    )}
                  </div>

                  <div>
                    <strong className="text-slate-500 block text-[10px] uppercase">Interrogatorio / Cierre Normativo:</strong>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 italic">
                      "{previewParsed.historyCheckup?.interrogatorioAparatos}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleApply}
            disabled={!previewParsed}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md transition-all active:scale-95"
          >
            <span>Aplicar al Expediente Activo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

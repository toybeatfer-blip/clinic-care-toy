import React, { useState } from 'react';
import {
  Calculator,
  X,
  Baby,
  HeartPulse,
  Activity,
  Calendar,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Stethoscope
} from 'lucide-react';

interface SpecialistToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientAge?: string;
  patientSex?: string;
  patientWeight?: string;
  onInsertTextToNote?: (text: string) => void;
}

export const SpecialistToolsModal: React.FC<SpecialistToolsModalProps> = ({
  isOpen,
  onClose,
  patientAge,
  patientSex = 'Femenino',
  patientWeight,
  onInsertTextToNote
}) => {
  const [activeTab, setActiveTab] = useState<'obstetric' | 'pediatric' | 'renal_cardio'>('obstetric');
  const [copied, setCopied] = useState<string>('');

  // 1. Estados Gineco-Obstetricia
  const [fumDate, setFumDate] = useState<string>('');
  
  // 2. Estados Pediatría
  const [pedWeight, setPedWeight] = useState<string>(patientWeight || '15');
  const [pedDoseMgKg, setPedDoseMgKg] = useState<string>('50'); // mg/kg/día
  const [pedFrequency, setPedFrequency] = useState<number>(3); // tomas al día (ej. cada 8h = 3)
  const [pedPresentationMg, setPedPresentationMg] = useState<string>('250'); // mg
  const [pedPresentationMl, setPedPresentationMl] = useState<string>('5'); // ml
  const [pedDrugName, setPedDrugName] = useState<string>('Amoxicilina');

  // 3. Estados Nefro / Cardio
  const [patientYears, setPatientYears] = useState<string>(patientAge || '50');
  const [patientGender, setPatientGender] = useState<'M' | 'F'>(patientSex === 'Masculino' ? 'M' : 'F');
  const [serumCreatinine, setSerumCreatinine] = useState<string>('1.0');
  const [renalWeight, setRenalWeight] = useState<string>(patientWeight || '70');
  const [bpSystolic, setBpSystolic] = useState<string>('120');
  const [bpDiastolic, setBpDiastolic] = useState<string>('80');

  if (!isOpen) return null;

  // CÁLCULOS OBSTETRICIA (Regla de Naegele)
  let fppDateStr = '';
  let semanasGestacion = 0;
  let diasGestacion = 0;
  let trimestre = '';
  let obstetricSummary = '';

  if (fumDate) {
    try {
      const fum = new Date(fumDate + 'T00:00:00');
      if (!isNaN(fum.getTime())) {
        // FPP = FUM + 7 días + 1 año - 3 meses (+280 días)
        const fpp = new Date(fum.getTime() + 280 * 24 * 60 * 60 * 1000);
        fppDateStr = fpp.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

        const today = new Date();
        const diffTime = today.getTime() - fum.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0) {
          semanasGestacion = Math.floor(diffDays / 7);
          diasGestacion = diffDays % 7;

          if (semanasGestacion < 14) trimestre = 'Primer Trimestre (0 - 13.6 SDG)';
          else if (semanasGestacion < 28) trimestre = 'Segundo Trimestre (14 - 27.6 SDG)';
          else trimestre = 'Tercer Trimestre (28 - 40+ SDG)';

          obstetricSummary = `FUM: ${fumDate} | FPP: ${fppDateStr} | Edad Gestacional: ${semanasGestacion}.${diasGestacion} SDG (${trimestre}).`;
        }
      }
    } catch (e) {}
  }

  // CÁLCULOS PEDIATRÍA
  const wNum = parseFloat(pedWeight) || 0;
  const doseMgKgNum = parseFloat(pedDoseMgKg) || 0;
  const presMgNum = parseFloat(pedPresentationMg) || 1;
  const presMlNum = parseFloat(pedPresentationMl) || 1;

  const totalMgDay = wNum * doseMgKgNum;
  const mgPerDose = pedFrequency > 0 ? totalMgDay / pedFrequency : totalMgDay;
  const mlPerDose = (mgPerDose * presMlNum) / presMgNum;
  const intervalHours = pedFrequency === 4 ? 6 : pedFrequency === 3 ? 8 : pedFrequency === 2 ? 12 : 24;

  const pediatricSummary = `${pedDrugName} Suspensión (${pedPresentationMg}mg/${pedPresentationMl}ml): Dar ${mlPerDose.toFixed(1)} ml vía oral cada ${intervalHours} horas (Dosis calculada a ${pedDoseMgKg} mg/kg/día para peso de ${pedWeight} kg).`;

  // CÁLCULOS NEFRO (Cockcroft-Gault)
  const crNum = parseFloat(serumCreatinine) || 1.0;
  const rAgeNum = parseFloat(patientYears) || 50;
  const rWNum = parseFloat(renalWeight) || 70;

  // Cockcroft-Gault = [(140 - Edad) * Peso] / (72 * CrS) * (0.85 si es mujer)
  let clcr = ((140 - rAgeNum) * rWNum) / (72 * crNum);
  if (patientGender === 'F') clcr *= 0.85;
  const clcrStr = clcr.toFixed(1);

  let kdigoStage = '';
  let kdigoDesc = '';
  if (clcr >= 90) {
    kdigoStage = 'Estadio G1 (Normal / Alto)';
    kdigoDesc = 'Función renal conservada. Sin ajuste de dosis.';
  } else if (clcr >= 60) {
    kdigoStage = 'Estadio G2 (Levemente disminuido)';
    kdigoDesc = 'Función renal limítrofe. Monitoreo regular.';
  } else if (clcr >= 45) {
    kdigoStage = 'Estadio G3a (Disminución leve a moderada)';
    kdigoDesc = 'Ajustar dosis de fármacos de eliminación renal estrecha.';
  } else if (clcr >= 30) {
    kdigoStage = 'Estadio G3b (Disminución moderada a grave)';
    kdigoDesc = 'Requiere ajuste de dosis en mayoría de antibióticos y AINEs contraindicados.';
  } else if (clcr >= 15) {
    kdigoStage = 'Estadio G4 (Disminución grave)';
    kdigoDesc = 'Falla renal avanzada. Ajuste estricto de posología.';
  } else {
    kdigoStage = 'Estadio G5 (Falla Renal Terminal)';
    kdigoDesc = 'Terapia de sustitución renal / diálisis.';
  }

  // CÁLCULO TAM (Tensión Arterial Media)
  const tas = parseFloat(bpSystolic) || 120;
  const tad = parseFloat(bpDiastolic) || 80;
  const tam = (2 * tad + tas) / 3;
  const tamStr = tam.toFixed(1);
  const isTamNormal = tam >= 70 && tam <= 105;

  const renalCardioSummary = `Depuración de Creatinina estimada (Cockcroft-Gault): ${clcrStr} mL/min (${kdigoStage}). TAM: ${tamStr} mmHg (${isTamNormal ? 'Perfusión tisular adecuada' : 'Alterada'}).`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl">
              <Calculator className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Calculadoras Clínicas para Médicos Especialistas
              </h2>
              <p className="text-xs text-blue-100">
                Gineco-Obstetricia (FUM/FPP/SDG), Pediatría Ponderal y Ajuste Renal Cockcroft-Gault
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

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('obstetric')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'obstetric'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-rose-500" />
            🤰 Gineco-Obstetricia (FUM / SDG)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pediatric')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'pediatric'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/50'
            }`}
          >
            <Baby className="w-4 h-4 text-sky-500" />
            👶 Pediatría (Dosis Ponderal)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('renal_cardio')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'renal_cardio'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/50'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-500" />
            🫀 Nefro / Cardio (Depuración Cr & TAM)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* 1. GINECO-OBSTETRICIA */}
          {activeTab === 'obstetric' && (
            <div className="space-y-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-900 dark:text-rose-200">
                <strong>Cálculo de Semanas de Gestación y Fecha Probable de Parto:</strong> Regla de Naegele (+7 días, -3 meses) y conteo exacto de semanas al día de hoy.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha de Última Menstruación (FUM):
                  </label>
                  <input
                    type="date"
                    value={fumDate}
                    onChange={(e) => setFumDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-rose-600 dark:text-rose-400 focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 70); // 10 weeks ago as example
                      setFumDate(d.toISOString().slice(0, 10));
                    }}
                    className="text-xs px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Ejemplo (Hace 10 semanas)
                  </button>
                </div>
              </div>

              {fumDate && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-200 dark:border-rose-800 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Edad Gestacional Actual:</span>
                      <strong className="text-base text-rose-700 dark:text-rose-300 font-mono">
                        {semanasGestacion}.{diasGestacion} SDG
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Trimestre:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                        {trimestre}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Fecha Probable de Parto:</span>
                      <strong className="text-slate-900 dark:text-slate-100 font-bold">
                        {fppDateStr}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/60 flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(obstetricSummary, 'obs')}
                      className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm font-semibold"
                    >
                      {copied === 'obs' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar Resumen
                    </button>

                    {onInsertTextToNote && (
                      <button
                        type="button"
                        onClick={() => {
                          onInsertTextToNote(`\n* Control Obstétrico: ${obstetricSummary}`);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        Insertar en Padecimiento / Nota
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. PEDIATRÍA */}
          {activeTab === 'pediatric' && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900 rounded-xl text-xs text-sky-900 dark:text-sky-200">
                <strong>Dosificación Ponderal Pediátrica:</strong> Calcula los mililitros exactos por toma según peso, dosis en $mg/kg/día$ y concentración de la suspensión.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fármaco:
                  </label>
                  <input
                    type="text"
                    value={pedDrugName}
                    onChange={(e) => setPedDrugName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Peso del Paciente (kg):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={pedWeight}
                    onChange={(e) => setPedWeight(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dosis Deseada (mg/kg/día):
                  </label>
                  <input
                    type="number"
                    value={pedDoseMgKg}
                    onChange={(e) => setPedDoseMgKg(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Concentración (mg):
                  </label>
                  <input
                    type="number"
                    value={pedPresentationMg}
                    onChange={(e) => setPedPresentationMg(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    En volumen de (ml):
                  </label>
                  <input
                    type="number"
                    value={pedPresentationMl}
                    onChange={(e) => setPedPresentationMl(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Frecuencia:
                  </label>
                  <select
                    value={pedFrequency}
                    onChange={(e) => setPedFrequency(parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value={3}>Cada 8 horas (3 veces al día)</option>
                    <option value={2}>Cada 12 horas (2 veces al día)</option>
                    <option value={4}>Cada 6 horas (4 veces al día)</option>
                    <option value={1}>Cada 24 horas (1 vez al día)</option>
                  </select>
                </div>
              </div>

              {/* Result card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 border border-sky-200 dark:border-sky-800 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Dosis por Toma:</span>
                    <strong className="text-xl text-sky-700 dark:text-sky-300 font-mono">
                      {mlPerDose.toFixed(1)} mL
                    </strong>
                    <span className="text-[10px] text-slate-400 block font-mono">({mgPerDose.toFixed(0)} mg/toma)</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Dosis Total Diaria:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {totalMgDay.toFixed(0)} mg / día
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Horario Sugerido:</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">
                      Cada {intervalHours} horas
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-sky-200/60 dark:border-sky-900/60 flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(pediatricSummary, 'ped')}
                    className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm font-semibold"
                  >
                    {copied === 'ped' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Dosificación
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. NEFROLOGÍA / CARDIO */}
          {activeTab === 'renal_cardio' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 rounded-xl text-xs text-indigo-900 dark:text-indigo-200">
                <strong>Depuración de Creatinina (Cockcroft-Gault) & Tensión Arterial Media (TAM):</strong> Estimación rápida de función renal para ajuste posológico y cálculo de perfusión hemodinámica.
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Creatinina Sérica (mg/dL):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={serumCreatinine}
                    onChange={(e) => setSerumCreatinine(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Edad (años):
                  </label>
                  <input
                    type="number"
                    value={patientYears}
                    onChange={(e) => setPatientYears(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Peso (kg):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={renalWeight}
                    onChange={(e) => setRenalWeight(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sexo Biológico:
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="M">Masculino (x1.0)</option>
                    <option value="F">Femenino (x0.85)</option>
                  </select>
                </div>
              </div>

              {/* T/A inputs for TAM */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tensión Arterial Sistólica (mmHg):
                  </label>
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tensión Arterial Diastólica (mmHg):
                  </label>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Result card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Depuración Cockcroft-Gault:</span>
                    <strong className="text-xl text-indigo-700 dark:text-indigo-300 font-mono">
                      {clcrStr} mL/min
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Estadificación KDIGO:</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold block">
                      {kdigoStage}
                    </strong>
                    <span className="text-[10px] text-slate-500">{kdigoDesc}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Tensión Arterial Media (TAM):</span>
                    <strong className="text-lg font-mono text-purple-700 dark:text-purple-300 block">
                      {tamStr} mmHg
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      {isTamNormal ? 'Normal (70-105 mmHg)' : 'Fuera de rango habitual'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60 flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(renalCardioSummary, 'ren')}
                    className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm font-semibold"
                  >
                    {copied === 'ren' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Resumen
                  </button>

                  {onInsertTextToNote && (
                    <button
                      type="button"
                      onClick={() => {
                        onInsertTextToNote(`\n* Evaluación Nefrológica/Cardio: ${renalCardioSummary}`);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      Insertar en Nota
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { HistoryCheckupData, PrescriptionItem, InstitutionalMed } from '../types';
import { FieldWithCopy } from './FieldWithCopy';
import { CopyButton } from './CopyButton';
import { generateModule2Text, calculateIMC, formatTallaInput } from '../utils/nom004Validator';
import { CIE10_CATALOG } from '../data/cie10Catalog';
import { MEDICATION_CATALOG } from '../data/medicationCatalog';
import {
  FileHeart,
  Activity,
  HeartPulse,
  Search,
  Pill,
  Plus,
  Trash2,
  ShieldCheck
} from 'lucide-react';

interface Module2HistoryCheckupProps {
  data: HistoryCheckupData;
  onChange: (updated: HistoryCheckupData) => void;
}

export const Module2HistoryCheckup: React.FC<Module2HistoryCheckupProps> = ({
  data,
  onChange
}) => {
  const [cieSearch, setCieSearch] = useState('');
  const [showCieDropdown, setShowCieDropdown] = useState(false);
  const [medSearch, setMedSearch] = useState('');
  const [showMedDropdown, setShowMedDropdown] = useState(false);

  const updateField = <K extends keyof HistoryCheckupData>(field: K, value: HistoryCheckupData[K]) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const updateVitalSign = (field: keyof typeof data.vitalSigns, val: string) => {
    const nextSigns = {
      ...data.vitalSigns,
      [field]: val
    };

    // Recalcular IMC cuando cambie peso o talla
    if (field === 'peso' || field === 'talla') {
      const calc = calculateIMC(field === 'peso' ? val : nextSigns.peso, field === 'talla' ? val : nextSigns.talla);
      nextSigns.imc = calc.imc;
    }

    updateField('vitalSigns', nextSigns);
  };

  const updatePhysicalExam = (field: keyof typeof data.physicalExam, val: string) => {
    updateField('physicalExam', {
      ...data.physicalExam,
      [field]: val
    });
  };

  // Prescription Helpers
  const addPrescriptionItem = (med?: InstitutionalMed) => {
    const newItem: PrescriptionItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
      producto: med ? med.name : '',
      marcaInstitucional: med ? (med.brand as any) : 'GENÉRICO',
      cantidad: '1 caja / pieza',
      via: med && med.category.includes('Inyectable') ? 'Intramuscular' : 'Oral',
      dosis: med?.defaultDose?.split('.')[0] || '1 tableta cada 8 horas',
      periodicidad: med?.defaultDose || 'Tomar según indicación médica por 5 días.',
      indicacionesAdicionales: 'Tomar con abundante agua después de los alimentos.'
    };
    updateField('prescripcion', [...data.prescripcion, newItem]);
  };

  const updatePrescriptionItem = (index: number, updatedItem: PrescriptionItem) => {
    const nextList = [...data.prescripcion];
    nextList[index] = updatedItem;
    updateField('prescripcion', nextList);
  };

  const removePrescriptionItem = (index: number) => {
    const nextList = data.prescripcion.filter((_, i) => i !== index);
    updateField('prescripcion', nextList);
  };

  // Filter CIE-10 Catalog
  const filteredCie10 = CIE10_CATALOG.filter(c => 
    c.name.toLowerCase().includes(cieSearch.toLowerCase()) || 
    c.code.toLowerCase().includes(cieSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(cieSearch.toLowerCase())
  ).slice(0, 8);

  // Filter Medication Catalog
  const filteredMeds = MEDICATION_CATALOG.filter(m =>
    m.name.toLowerCase().includes(medSearch.toLowerCase()) ||
    m.substance.toLowerCase().includes(medSearch.toLowerCase()) ||
    m.category.toLowerCase().includes(medSearch.toLowerCase())
  ).slice(0, 8);

  const fullModuleText = generateModule2Text(data);
  const imcInfo = calculateIMC(data?.vitalSigns?.peso, data?.vitalSigns?.talla);

  return (
    <div className="space-y-6">
      {/* Module Header & Global Copy */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            <FileHeart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Módulo 2: Historia Clínica General / Checkup
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Padecimiento, signos vitales con SpO2, somatometría, exploración, diagnóstico CIE-10 y prescripción
            </p>
          </div>
        </div>

        <CopyButton
          text={fullModuleText}
          label="Copiar Historia Clínica Completa"
          variant="primary"
          size="md"
        />
      </div>

      {/* Padecimiento Actual & Interrogatorio */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            <HeartPulse className="w-4 h-4" />
            <span>Padecimiento Actual e Interrogatorio</span>
          </div>
          <span className="text-[11px] text-slate-400">NOM-004: Redacción cronológica</span>
        </div>

        <div className="space-y-4">
          <FieldWithCopy
            label="Padecimiento Actual"
            value={data.padecimientoActual}
            onChange={(v) => updateField('padecimientoActual', v)}
            type="textarea"
            rows={3}
            placeholder="Descripción cronológica completa del padecimiento, síntomas, tiempo de evolución y factores asociados..."
            required
          />

          <div>
            <FieldWithCopy
              label="Interrogatorio por Aparatos y Sistemas"
              value={data.interrogatorioAparatos}
              onChange={(v) => updateField('interrogatorioAparatos', v)}
              type="textarea"
              rows={2}
              placeholder="Síntomas referidos, resto del interrogatorio negado."
              quickFillOptions={[
                'Aparato respiratorio, digestivo, cardiovascular y genitourinario sin sintomatología aguda, resto del interrogatorio negado.',
                'Refiere odinofagia y rinorrea hialina de 3 días, resto del interrogatorio negado.',
                'Refiere dolor epigástrico tipo ardor posprandial, pirosis, resto del interrogatorio negado.',
                'Refiere disuria y tenesmo vesical, resto del interrogatorio negado.'
              ]}
              helpText='* Obligatorio por auditoría finalizar siempre con la leyenda "...resto del interrogatorio negado."'
            />
          </div>
        </div>
      </div>

      {/* Somatometría y Signos Vitales con Saturación de Oxígeno (SpO2) */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            <Activity className="w-4 h-4" />
            <span>Somatometría y Signos Vitales (con SpO2)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              IMC: {data.vitalSigns.imc || '0.00'} kg/m² ({imcInfo.category || 'Sin calcular'})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          <FieldWithCopy
            label="Temp (°C)"
            value={data.vitalSigns.temp}
            onChange={(v) => updateVitalSign('temp', v)}
            placeholder="36.5"
          />

          <FieldWithCopy
            label="T/A Sist."
            value={data.vitalSigns.taSistolica}
            onChange={(v) => updateVitalSign('taSistolica', v)}
            placeholder="120"
          />

          <FieldWithCopy
            label="T/A Diast."
            value={data.vitalSigns.taDiastolica}
            onChange={(v) => updateVitalSign('taDiastolica', v)}
            placeholder="80"
          />

          <FieldWithCopy
            label="FC (lpm)"
            value={data.vitalSigns.fc}
            onChange={(v) => updateVitalSign('fc', v)}
            placeholder="75"
          />

          <FieldWithCopy
            label="FR (rpm)"
            value={data.vitalSigns.fr}
            onChange={(v) => updateVitalSign('fr', v)}
            placeholder="18"
          />

          {/* Saturación de Oxígeno (SpO2) */}
          <FieldWithCopy
            label="SpO2 (%)"
            value={data.vitalSigns.satO2 || ''}
            onChange={(v) => updateVitalSign('satO2', v)}
            placeholder="98"
            quickFillOptions={['98', '99', '97', '96', '95']}
          />

          <FieldWithCopy
            label="Peso (kg)"
            value={data.vitalSigns.peso}
            onChange={(v) => updateVitalSign('peso', v)}
            placeholder="70.0"
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Talla (m) <span className="text-rose-500">*</span>
              </label>
              <CopyButton text={data.vitalSigns.talla} size="sm" variant="ghost" label="" />
            </div>
            <input
              type="text"
              value={data.vitalSigns.talla}
              onChange={(e) => updateVitalSign('talla', formatTallaInput(e.target.value))}
              placeholder="1.70"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-bold text-sky-700 dark:text-sky-300"
            />
          </div>
        </div>

        {/* T/A Pediátrica badge selector */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-medium">T/A en menores:</span>
          {['', 'PEDIÁTRICO', 'INFANTE', 'MENOR'].map(badge => (
            <button
              key={badge}
              type="button"
              onClick={() => updateVitalSign('taPediatricaBadge', badge)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                data.vitalSigns.taPediatricaBadge === badge
                  ? 'bg-sky-600 text-white border-sky-600 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {badge || 'Adulto (Cifras)'}
            </button>
          ))}

          {/* Alert for controlled weight medication */}
          {imcInfo.alertControlled && (
            <span className="ml-auto text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              IMC &gt; 25: Apto para prescripción de control de peso
            </span>
          )}
        </div>
      </div>

      {/* Exploración Física Cefalocaudal */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            <HeartPulse className="w-4 h-4" />
            <span>Exploración Física Cefalocaudal (NOM-004)</span>
          </div>
          <span className="text-[11px] text-slate-400">Sin siglas NP / SDP</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldWithCopy
            label="Habitus Exterior"
            value={data.physicalExam.habitusExterior}
            onChange={(v) => updatePhysicalExam('habitusExterior', v)}
            type="textarea"
            rows={2}
            quickFillOptions={[
              'Paciente consciente, orientado en tiempo, espacio y persona, bien hidratado, con adecuada coloración mucotegumentaria, marcha regular.',
              'Paciente femenino, facies no dolorosa, bien hidratada, colaboradora, sin compromiso hemodinámico aparente.'
            ]}
          />

          <FieldWithCopy
            label="Cabeza y Cuello"
            value={data.physicalExam.cabezaCuello}
            onChange={(v) => updatePhysicalExam('cabezaCuello', v)}
            type="textarea"
            rows={2}
            quickFillOptions={[
              'Normocéfalo, sin exostosis, pupilas isocóricas fotorreactivas, faringe sin alteraciones, cuello simétrico sin adenomegalias palpables.',
              'Faringe hiperémica con exudado purulento en amígdalas, amígdalas grado II/III, adenopatías cervicales anteriores palpables dolorosas.',
              'Sin datos patológicos.'
            ]}
          />

          <FieldWithCopy
            label="Tórax y Campos Pulmonares"
            value={data.physicalExam.torax}
            onChange={(v) => updatePhysicalExam('torax', v)}
            type="textarea"
            rows={2}
            quickFillOptions={[
              'Normolíneo, simétrico, movimientos respiratorios normales, ruidos cardiacos rítmicos sin soplos, campos pulmonares bien ventilados sin estertores.',
              'Murmullo vesicular conservado, sibilancias espiratorias bilaterales leves, ruidos cardiacos rítmicos de buen tono.',
              'Sin datos patológicos.'
            ]}
          />

          <FieldWithCopy
            label="Abdomen"
            value={data.physicalExam.abdomen}
            onChange={(v) => updatePhysicalExam('abdomen', v)}
            type="textarea"
            rows={2}
            quickFillOptions={[
              'Plano, blando, depresible, no doloroso a la palpación superficial ni profunda, ruidos peristálticos presentes normales, sin irritación peritoneal.',
              'Blando, doloroso a la palpación en epigastrio y mesogastrio, sin rebote, ruidos hidroaéreos normales, sin visceromegalias.',
              'Sin datos patológicos.'
            ]}
          />

          <FieldWithCopy
            label="Miembros Torácicos y Pélvicos"
            value={data.physicalExam.miembros}
            onChange={(v) => updatePhysicalExam('miembros', v)}
            type="textarea"
            rows={2}
            quickFillOptions={[
              'Íntegros, simétricos, arcos de movilidad completos, pulsos distales presentes simétricos, sin edema, llenado capilar de 2 segundos.',
              'Edema bilateral de miembros pélvicos grado I, pulsos pedios presentes, sin cambios tróficos.',
              'Sin datos patológicos.'
            ]}
          />

          <FieldWithCopy
            label="Genitales (Urológico / Ginecológico)"
            value={data.physicalExam.genitales}
            onChange={(v) => updatePhysicalExam('genitales', v)}
            quickFillOptions={['Diferido', 'No explorado']}
            helpText='* Por norma del consultorio SAC, asentar "Diferido" o "No explorado".'
          />
        </div>
      </div>

      {/* Diagnóstico (CIE-10) y Pronóstico */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            <Search className="w-4 h-4" />
            <span>Diagnóstico Formal (CIE-10) y Pronóstico</span>
          </div>
          <span className="text-[11px] text-slate-400">Código oficial requerido</span>
        </div>

        <div className="space-y-3">
          {/* CIE-10 Search & Picker */}
          <div className="relative">
            <FieldWithCopy
              label="Diagnóstico Principal (Código CIE-10 + Descripción Oficial)"
              value={data.diagnosticoCie10}
              onChange={(v) => updateField('diagnosticoCie10', v)}
              placeholder="Ej. J00X - Rinofaringitis aguda [resfriado común]"
              required
            />

            {/* Quick CIE-10 Search Input */}
            <div className="mt-2 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar en catálogo CIE-10 (ej. faringitis, gastritis, lumbalgia, I10X, DM2)..."
                  value={cieSearch}
                  onChange={(e) => {
                    setCieSearch(e.target.value);
                    setShowCieDropdown(true);
                  }}
                  onFocus={() => setShowCieDropdown(true)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              {showCieDropdown && (
                <button
                  type="button"
                  onClick={() => setShowCieDropdown(false)}
                  className="text-xs px-2.5 py-1 text-slate-500 hover:text-slate-700 font-medium"
                >
                  Cerrar
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {showCieDropdown && cieSearch && (
              <div className="absolute left-0 right-0 z-30 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCie10.length > 0 ? (
                  filteredCie10.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        updateField('diagnosticoCie10', `${item.code} - ${item.name}`);
                        setShowCieDropdown(false);
                        setCieSearch('');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-sky-50 dark:hover:bg-sky-950/40 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <span className="font-mono font-bold text-sky-700 dark:text-sky-400 mr-2">[{item.code}]</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {item.category}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-slate-400 text-center">No se encontraron diagnósticos para "{cieSearch}"</div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldWithCopy
              label="Diagnóstico Secundario (Opcional)"
              value={data.diagnosticoSecundario || ''}
              onChange={(v) => updateField('diagnosticoSecundario', v)}
              placeholder="Ej. E66.0 - Obesidad debida a exceso de calorías"
            />

            <FieldWithCopy
              label="Pronóstico"
              value={data.pronostico}
              onChange={(v) => updateField('pronostico', v)}
              quickFillOptions={[
                'Favorable para la vida y función.',
                'Reservado a evolución y respuesta al tratamiento.',
                'Favorable para la vida, reservado para la función.'
              ]}
            />
          </div>
        </div>
      </div>

      {/* Prescripción / Orden de Surtido (ALMUS y Genéricos) */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              <Pill className="w-4 h-4" />
              <span>Orden de Surtido y Prescripción Médica (ALMUS / Genéricos)</span>
            </div>
            <p className="text-[11px] text-slate-500">Prescripción clara y normada conforme a NOM-004</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => addPrescriptionItem()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Medicamento</span>
            </button>
          </div>
        </div>

        {/* Quick Medication Search Bar */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar medicamento por nombre o sustancia (ej. amoxicilina, paracetamol, omeprazol, ketorolaco)..."
                value={medSearch}
                onChange={(e) => {
                  setMedSearch(e.target.value);
                  setShowMedDropdown(true);
                }}
                onFocus={() => setShowMedDropdown(true)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            {showMedDropdown && (
              <button
                type="button"
                onClick={() => setShowMedDropdown(false)}
                className="text-xs px-2.5 py-1 text-slate-500 hover:text-slate-700 font-medium"
              >
                Cerrar
              </button>
            )}
          </div>

          {showMedDropdown && medSearch && (
            <div className="absolute left-0 right-0 z-30 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMeds.length > 0 ? (
                filteredMeds.map((med, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      addPrescriptionItem(med);
                      setShowMedDropdown(false);
                      setMedSearch('');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs hover:bg-sky-50 dark:hover:bg-sky-950/40 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                          med.brand === 'ALMUS' ? 'bg-blue-600' : 'bg-slate-600'
                        }`}>
                          {med.brand}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{med.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {med.presentation} - {med.defaultDose}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 group-hover:underline">
                      + Agregar
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-xs text-slate-400 text-center">No se encontraron medicamentos para "{medSearch}"</div>
              )}
            </div>
          )}
        </div>

        {/* Prescription Items List */}
        <div className="space-y-3">
          {data.prescripcion.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>Medicamento #{idx + 1}</span>
                  {item.marcaInstitucional && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                      item.marcaInstitucional === 'ALMUS' ? 'bg-blue-600' : 'bg-slate-600'
                    }`}>
                      {item.marcaInstitucional}
                    </span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  <CopyButton
                    text={`Producto: ${item.producto}\nCantidad: ${item.cantidad}\nVía: ${item.via}\nDosis: ${item.dosis}\nPeriodicidad: ${item.periodicidad}`}
                    size="sm"
                    label="Copiar Fármaco"
                  />
                  <button
                    type="button"
                    onClick={() => removePrescriptionItem(idx)}
                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                    title="Eliminar este medicamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <FieldWithCopy
                    label="Producto / Sustancia"
                    value={item.producto}
                    onChange={(v) => updatePrescriptionItem(idx, { ...item, producto: v })}
                    placeholder="Ej. Paracetamol 500 mg Tabletas"
                    required
                  />
                </div>

                <FieldWithCopy
                  label="Cantidad"
                  value={item.cantidad}
                  onChange={(v) => updatePrescriptionItem(idx, { ...item, cantidad: v })}
                  placeholder="Ej. 1 caja"
                  quickFillOptions={['1 caja', '2 cajas', '1 frasco', '3 ampolletas']}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Vía de Adm.</label>
                  <select
                    value={item.via}
                    onChange={(e) => updatePrescriptionItem(idx, { ...item, via: e.target.value as any })}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Oral">Oral</option>
                    <option value="Intramuscular">Intramuscular</option>
                    <option value="Intravenosa">Intravenosa</option>
                    <option value="Tópica">Tópica</option>
                    <option value="Oftálmica">Oftálmica</option>
                    <option value="Ótica">Ótica</option>
                    <option value="Nasal">Nasal</option>
                    <option value="Sublingual">Sublingual</option>
                    <option value="Inhalatoria">Inhalatoria</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <FieldWithCopy
                    label="Dosis"
                    value={item.dosis}
                    onChange={(v) => updatePrescriptionItem(idx, { ...item, dosis: v })}
                    placeholder="Ej. Tomar 1 tableta (500 mg) cada 8 horas"
                  />
                </div>

                <div className="sm:col-span-2">
                  <FieldWithCopy
                    label="Periodicidad y Duración"
                    value={item.periodicidad}
                    onChange={(v) => updatePrescriptionItem(idx, { ...item, periodicidad: v })}
                    placeholder="Ej. Por 5 días en caso de dolor o fiebre"
                  />
                </div>
              </div>
            </div>
          ))}

          {data.prescripcion.length === 0 && (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
              No hay medicamentos agregados a la orden de surtido. Usa el buscador o presiona "Agregar Medicamento".
            </div>
          )}
        </div>

        {/* Indicaciones Terapéuticas (Comentarios de Receta) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <FieldWithCopy
            label="Indicaciones Terapéuticas Generales (Comentarios de Receta)"
            value={data.indicacionTerapeutica}
            onChange={(v) => updateField('indicacionTerapeutica', v)}
            type="textarea"
            rows={3}
            placeholder="Medidas higiénico-dietéticas, hidratación, datos de alarma y revaloración..."
            quickFillOptions={[
              '1. Abundante hidratación oral (2 a 3 litros de agua al día).\n2. Dieta baja en grasas e irritantes.\n3. Reposo relativo.\n4. Datos de alarma: fiebre >38.5°C o dificultad para respirar.\n5. Cita abierta o revaloración en 5 días.',
              '1. Dieta blanda fraccionada.\n2. Evitar ayunos prolongados, café y picante.\n3. Tomar medicamentos con alimentos.\n4. Cita abierta.',
              '1. Reposo relativo, evitar cargar objetos pesados.\n2. Aplicar calor local seco en región lumbar por 20 minutos 2 veces al día.\n3. Revaloración en 5 días.'
            ]}
          />
        </div>
      </div>
    </div>
  );
};

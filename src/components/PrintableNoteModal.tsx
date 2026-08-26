import React from 'react';
import { X, Printer, Stethoscope, Pill, Check, Building2, User, Phone, Mail, FlaskConical } from 'lucide-react';
import { ClinicalRecord, DoctorSettings } from '../types';

interface PrintableNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ClinicalRecord;
  doctorSettings: DoctorSettings;
}

export const PrintableNoteModal: React.FC<PrintableNoteModalProps> = ({
  isOpen,
  onClose,
  record,
  doctorSettings
}) => {
  if (!isOpen) return null;

  const id = record.identification;
  const hc = record.historyCheckup;
  const v = hc.vitalSigns;
  const fullName = `${id.nombres || 'Paciente'} ${id.apellidoPaterno || ''} ${id.apellidoMaterno || ''}`.trim();
  const dateFormatted = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Toolbar (hidden during print) */}
        <div className="no-print p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Vista de Impresión / Resumen de Expediente y Receta Oficial
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print-page space-y-6">
          
          {/* Header Note with Custom Doctor and Clinic Branding */}
          <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {doctorSettings.logoUrl ? (
                <div className="w-16 h-16 rounded-xl border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={doctorSettings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-sky-700 flex items-center justify-center text-white shrink-0">
                  <Stethoscope className="w-8 h-8" />
                </div>
              )}

              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                  {doctorSettings.nombreClinica}
                </h1>
                <p className="text-xs font-bold text-sky-800">
                  {doctorSettings.prefix} {doctorSettings.doctorName} • {doctorSettings.especialidad}
                </p>
                <p className="text-[11px] text-slate-600">
                  Céd. Prof. General: <strong>{doctorSettings.cedulaGeneral}</strong>
                  {doctorSettings.cedulaEspecialidad && (
                    <span> | Céd. Esp: <strong>{doctorSettings.cedulaEspecialidad}</strong></span>
                  )}
                  {doctorSettings.universidad && (
                    <span> | {doctorSettings.universidad}</span>
                  )}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {doctorSettings.direccionClinica} {doctorSettings.telefonoClinica && `• Tel: ${doctorSettings.telefonoClinica}`}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs shrink-0 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
              <p className="font-bold">Fecha: {dateFormatted}</p>
              {record.ticketFolio && (
                <p className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">
                  Ticket SAC: {record.ticketFolio}
                </p>
              )}
            </div>
          </div>

          {/* Patient Info Bar */}
          <div className="bg-slate-100 p-3 rounded-lg text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 border border-slate-300">
            <div>
              <span className="font-bold text-slate-600 block">Paciente:</span>
              <span className="font-semibold text-slate-900">{fullName}</span>
            </div>
            <div>
              <span className="font-bold text-slate-600 block">Edad / Sexo:</span>
              <span>{id.edad || '--'} años | {id.sexo}</span>
            </div>
            <div>
              <span className="font-bold text-slate-600 block">Fecha Nac:</span>
              <span>{id.fechaNacimiento || '--'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-600 block">CURP / RFC:</span>
              <span className="font-mono">{id.curp || id.rfc || '--'}</span>
            </div>
          </div>

          {/* Vital Signs Bar with SpO2 */}
          <div className="border border-slate-300 rounded-lg p-3 text-xs bg-slate-50">
            <span className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[10px]">
              Somatometría y Signos Vitales:
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 font-mono">
              <div>Temp: <strong>{v.temp}°C</strong></div>
              <div>T/A: <strong>{v.taPediatricaBadge || `${v.taSistolica}/${v.taDiastolica}`}</strong></div>
              <div>FC: <strong>{v.fc} lpm</strong></div>
              <div>FR: <strong>{v.fr} rpm</strong></div>
              <div>SpO2: <strong>{v.satO2 || '98'}%</strong></div>
              <div>Peso: <strong>{v.peso} kg</strong></div>
              <div>Talla: <strong>{v.talla} m (IMC: {v.imc})</strong></div>
            </div>
          </div>

          {/* Clinical Note Content */}
          <div className="space-y-4 text-xs">
            <div>
              <strong className="text-slate-800 uppercase block font-bold text-[11px] mb-1">
                Padecimiento Actual:
              </strong>
              <p className="text-slate-800 leading-relaxed bg-white border-l-2 border-sky-600 pl-3 py-1">
                {hc.padecimientoActual || 'Sin descripción asentada.'}
              </p>
            </div>

            <div>
              <strong className="text-slate-800 uppercase block font-bold text-[11px] mb-1">
                Interrogatorio por Aparatos y Sistemas:
              </strong>
              <p className="text-slate-700 leading-relaxed italic pl-3">
                {hc.interrogatorioAparatos}
              </p>
            </div>

            {/* Estudios de Laboratorio y Gabinete Aportados */}
            {(() => {
              const est = record.activeModule === 'modulo3' ? record.evolutionNote.estudiosDiagnostico : hc.estudiosDiagnostico;
              const hasStudies = Boolean(
                est?.laboratorios?.trim() ||
                est?.rayosX?.trim() ||
                est?.ultrasonido?.trim() ||
                est?.tomografiaTac?.trim() ||
                est?.otrosEstudios?.trim() ||
                est?.interpretacionHallazgos?.trim()
              );

              if (!hasStudies) return null;

              return (
                <div className="border-t border-slate-200 pt-3">
                  <strong className="text-slate-800 uppercase block font-bold text-[11px] mb-1.5 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-teal-700" />
                    <span>Estudios Auxiliares de Diagnóstico Aportados (Laboratorio y Gabinete):</span>
                  </strong>
                  <div className="bg-teal-50/40 rounded-lg p-2.5 border border-teal-200 text-xs space-y-1 text-slate-800">
                    {est?.laboratorios?.trim() && (
                      <p><strong>Laboratorios:</strong> {est.laboratorios.trim()}</p>
                    )}
                    {est?.rayosX?.trim() && (
                      <p><strong>Rayos X (RX):</strong> {est.rayosX.trim()}</p>
                    )}
                    {est?.ultrasonido?.trim() && (
                      <p><strong>Ultrasonido (USG):</strong> {est.ultrasonido.trim()}</p>
                    )}
                    {est?.tomografiaTac?.trim() && (
                      <p><strong>Tomografía (TAC):</strong> {est.tomografiaTac.trim()}</p>
                    )}
                    {est?.otrosEstudios?.trim() && (
                      <p><strong>Otros Estudios (RMN/ECG):</strong> {est.otrosEstudios.trim()}</p>
                    )}
                    {est?.interpretacionHallazgos?.trim() && (
                      <p className="border-t border-teal-200/60 pt-1 text-teal-950 font-medium">
                        <strong>Interpretación / Conclusión:</strong> {est.interpretacionHallazgos.trim()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="border-t border-slate-200 pt-3">
              <strong className="text-slate-800 uppercase block font-bold text-[11px] mb-1">
                Diagnóstico Oficial (CIE-10):
              </strong>
              <p className="font-bold text-sky-900 bg-sky-50 p-2 rounded border border-sky-200">
                {hc.diagnosticoCie10}
              </p>
            </div>

            {/* Prescripción */}
            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-sky-700" />
                <strong className="text-slate-900 uppercase font-bold text-xs">
                  Orden de Surtido / Prescripción Médica:
                </strong>
              </div>

              <div className="space-y-2">
                {hc.prescripcion.map((med, idx) => (
                  <div key={idx} className="p-2.5 rounded border border-slate-300 bg-slate-50/70 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{idx + 1}. {med.producto} {med.marcaInstitucional ? `(${med.marcaInstitucional})` : ''}</span>
                      <span className="text-[11px] font-normal text-slate-600">Cant: {med.cantidad} | Vía: {med.via}</span>
                    </div>
                    <p className="text-slate-700 mt-1 font-medium">
                      {med.dosis} - {med.periodicidad}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicaciones */}
            <div>
              <strong className="text-slate-800 uppercase block font-bold text-[11px] mb-1">
                Indicaciones Terapéuticas y Alarma:
              </strong>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed pl-3">
                {hc.indicacionTerapeutica}
              </p>
            </div>
          </div>

          {/* Signature lines with Doctor's professional details */}
          <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs border-t border-slate-300">
            <div>
              <div className="border-t border-slate-400 w-56 mx-auto pt-1 font-bold">
                {doctorSettings.prefix} {doctorSettings.doctorName}
              </div>
              <span className="text-[10px] text-slate-600 block">
                Cédula Profesional: {doctorSettings.cedulaGeneral}
              </span>
              {doctorSettings.cedulaEspecialidad && (
                <span className="text-[10px] text-slate-500 block">
                  Céd. Esp: {doctorSettings.cedulaEspecialidad}
                </span>
              )}
            </div>
            <div>
              <div className="border-t border-slate-400 w-56 mx-auto pt-1 font-bold">
                Firma del Paciente / Tutor
              </div>
              <span className="text-[10px] text-slate-500 block">
                Consentimiento de Atención Médica
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

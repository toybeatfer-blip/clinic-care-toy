import React from 'react';
import { IdentificationData, ClinicalRecord } from '../types';
import { FieldWithCopy } from './FieldWithCopy';
import { CopyButton } from './CopyButton';
import { generateModule1Text } from '../utils/nom004Validator';
import { UserCheck, MapPin, Phone, FileText, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';

interface Module1IdentificationProps {
  data: IdentificationData;
  onChange: (updated: IdentificationData) => void;
  savedRecords: ClinicalRecord[];
}

export const Module1Identification: React.FC<Module1IdentificationProps> = ({
  data,
  onChange,
  savedRecords
}) => {
  const updateField = (field: keyof IdentificationData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Anti-duplicity check: check if name + birth year already exists in database
  const fullName = `${data?.nombres || ''} ${data?.apellidoPaterno || ''} ${data?.apellidoMaterno || ''}`.trim().toLowerCase();
  const birthYear = data?.fechaNacimiento ? data.fechaNacimiento.split(/[-/]/)[0] : '';
  
  const duplicateMatch = (savedRecords || []).find(r => {
    if (!r || !r.identification) return false;
    const rName = `${r.identification.nombres || ''} ${r.identification.apellidoPaterno || ''} ${r.identification.apellidoMaterno || ''}`.trim().toLowerCase();
    const rYear = r.identification.fechaNacimiento ? r.identification.fechaNacimiento.split(/[-/]/)[0] : '';
    return rName && fullName && rName === fullName && (birthYear ? rYear === birthYear : true);
  });

  const fullModuleText = generateModule1Text(data);

  return (
    <div className="space-y-6">
      {/* Module Title & Global Copy Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Módulo 1: Alta y Ficha de Identificación del Paciente
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Datos generales, domicilio, contacto y antecedentes clínicos obligatorios para el expediente SAC
            </p>
          </div>
        </div>

        <CopyButton
          text={fullModuleText}
          label="Copiar Módulo 1 Completo para SAC"
          variant="primary"
          size="md"
        />
      </div>

      {/* Duplicity Alert */}
      {duplicateMatch && fullName.length > 5 && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3 text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="font-bold block">Alerta de Búsqueda Previa (Prevención de Duplicidad):</strong>
            Ya existe un paciente registrado con el nombre <strong>{data.nombres} {data.apellidoPaterno}</strong>. Verifica en la base de datos nacional del SAC antes de dar de alta para evitar duplicar el número de expediente.
          </div>
        </div>
      )}

      {/* Section 1: Datos Generales */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            <UserCheck className="w-4 h-4" />
            <span>Datos Generales del Paciente</span>
          </div>
          <span className="text-[11px] text-slate-400">Cero abreviaturas en nombres</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FieldWithCopy
            label="Nombre(s)"
            value={data.nombres}
            onChange={(v) => updateField('nombres', v)}
            placeholder="Ej. Juan Carlos"
            required
          />

          <FieldWithCopy
            label="Apellido Paterno"
            value={data.apellidoPaterno}
            onChange={(v) => updateField('apellidoPaterno', v)}
            placeholder="Ej. Hernández"
            required
          />

          <FieldWithCopy
            label="Apellido Materno"
            value={data.apellidoMaterno}
            onChange={(v) => updateField('apellidoMaterno', v)}
            placeholder="Ej. López"
          />

          <FieldWithCopy
            label="Fecha de Nacimiento"
            value={data.fechaNacimiento}
            onChange={(v) => updateField('fechaNacimiento', v)}
            placeholder="DD/MM/AAAA"
          />

          <FieldWithCopy
            label="Edad"
            value={data.edad}
            onChange={(v) => updateField('edad', v)}
            placeholder="Ej. 34 Años"
            type="text"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Sexo / Género</label>
            <select
              value={data.sexo}
              onChange={(e) => updateField('sexo', e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <FieldWithCopy
            label="Estado de Nacimiento"
            value={data.estadoNacimiento}
            onChange={(v) => updateField('estadoNacimiento', v)}
            placeholder="Ej. Ciudad de México"
          />

          <FieldWithCopy
            label="CURP"
            value={data.curp}
            onChange={(v) => updateField('curp', v.toUpperCase())}
            placeholder="18 caracteres"
          />

          <FieldWithCopy
            label="RFC"
            value={data.rfc}
            onChange={(v) => updateField('rfc', v.toUpperCase())}
            placeholder="RFC con homoclave"
          />
        </div>
      </div>

      {/* Section 2: Domicilio Actual */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            <MapPin className="w-4 h-4" />
            <span>Domicilio Actual del Paciente</span>
          </div>
          <span className="text-[11px] text-slate-400">El CP autocompleta en SAC</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <FieldWithCopy
            label="Código Postal (CP)"
            value={data.codigoPostal}
            onChange={(v) => updateField('codigoPostal', v)}
            placeholder="5 dígitos"
          />

          <FieldWithCopy
            label="Estado"
            value={data.estado}
            onChange={(v) => updateField('estado', v)}
            placeholder="Ej. Estado de México"
          />

          <FieldWithCopy
            label="Municipio / Alcaldía"
            value={data.municipio}
            onChange={(v) => updateField('municipio', v)}
            placeholder="Ej. Naucalpan"
          />

          <FieldWithCopy
            label="Colonia"
            value={data.colonia}
            onChange={(v) => updateField('colonia', v)}
            placeholder="Ej. Ciudad Satélite"
            required
          />

          <div className="sm:col-span-2">
            <FieldWithCopy
              label="Calle"
              value={data.calle}
              onChange={(v) => updateField('calle', v)}
              placeholder="Nombre completo de la calle"
              required
            />
          </div>

          <FieldWithCopy
            label="Número Exterior"
            value={data.numeroExt}
            onChange={(v) => updateField('numeroExt', v)}
            placeholder="Ej. 124"
            required
          />

          <FieldWithCopy
            label="Número Interior"
            value={data.numeroInt}
            onChange={(v) => updateField('numeroInt', v)}
            placeholder="Ej. Depto 4B o Sin Número"
            quickFillOptions={['Sin Número', 'Depto 1', 'Depto 2']}
          />
        </div>
      </div>

      {/* Section 3: Datos de Contacto */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <Phone className="w-4 h-4" />
          <span>Datos de Contacto</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWithCopy
            label="Teléfono Celular"
            value={data.telefonoCelular}
            onChange={(v) => updateField('telefonoCelular', v)}
            placeholder="10 dígitos"
          />

          <FieldWithCopy
            label="Correo Electrónico"
            value={data.correoElectronico}
            onChange={(v) => updateField('correoElectronico', v)}
            placeholder="correo@ejemplo.com"
          />
        </div>
      </div>

      {/* Section 4: Antecedentes Clínicos */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            <FileText className="w-4 h-4" />
            <span>Antecedentes Clínicos (NOM-004)</span>
          </div>
          <span className="text-[11px] text-slate-400">Prohibido dejar en blanco</span>
        </div>

        <div className="space-y-3.5">
          <FieldWithCopy
            label="Antecedentes Heredofamiliares"
            value={data.antecedentesHeredofamiliares}
            onChange={(v) => updateField('antecedentesHeredofamiliares', v)}
            placeholder="Detalle o 'Interrogados y negados'"
            quickFillOptions={['Interrogados y negados', 'Padre con DM2 e HAS', 'Madre con HAS', 'Sin antecedentes de importancia']}
          />

          <FieldWithCopy
            label="Antecedentes Personales Patológicos"
            value={data.antecedentesPersonalesPatologicos}
            onChange={(v) => updateField('antecedentesPersonalesPatologicos', v)}
            placeholder="Detalle o 'Interrogados y negados'"
            quickFillOptions={['Interrogados y negados', 'Hipertensión arterial en control', 'Diabetes mellitus tipo 2 en control', 'Apendicectomía hace 5 años']}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            <FieldWithCopy
              label="Farmacodependencias"
              value={data.farmacodependencias}
              onChange={(v) => updateField('farmacodependencias', v)}
              quickFillOptions={['Negadas', 'Positivas']}
            />

            <FieldWithCopy
              label="Tabaquismo"
              value={data.tabaquismo}
              onChange={(v) => updateField('tabaquismo', v)}
              quickFillOptions={['Negado', 'Positivo', 'Ex-fumador']}
            />

            <FieldWithCopy
              label="Alcoholismo"
              value={data.alcoholismo}
              onChange={(v) => updateField('alcoholismo', v)}
              quickFillOptions={['Negado', 'Ocasional / Social', 'Positivo']}
            />

            <FieldWithCopy
              label="Alergias"
              value={data.alergias}
              onChange={(v) => updateField('alergias', v)}
              quickFillOptions={['Negadas', 'Alérgico a Penicilina', 'Alérgico a AINES', 'Alérgico a Sulfas']}
            />
          </div>

          <FieldWithCopy
            label="Esquema de Inmunizaciones"
            value={data.inmunizaciones}
            onChange={(v) => updateField('inmunizaciones', v)}
            quickFillOptions={['Completas', 'Incompletas', 'Completas para la edad', 'Refuerzo Influenza y COVID']}
          />
        </div>
      </div>
    </div>
  );
};

import { ClinicalRecord, IdentificationData, HistoryCheckupData, EvolutionNoteData, ProcedureData } from '../types';

export interface AuditIssue {
  field: string;
  module: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  replaceTarget?: string;
  replacement?: string;
}

export const FORBIDDEN_ACRONYMS = [
  { regex: /\bNP\b/gi, acronym: 'NP', replacement: 'Sin datos patológicos' },
  { regex: /\bSDP\b/gi, acronym: 'SDP', replacement: 'Sin datos patológicos' },
  { regex: /\bNA\b/gi, acronym: 'NA', replacement: 'No aplica' },
  { regex: /\bS\/S\b/gi, acronym: 'S/S', replacement: 'Sin sintomatología agregada' },
  { regex: /\bTx\b/g, acronym: 'Tx', replacement: 'Tratamiento' },
  { regex: /\bDx\b/g, acronym: 'Dx', replacement: 'Diagnóstico' },
  { regex: /\bPx\b/g, acronym: 'Px', replacement: 'Paciente' },
  { regex: /\bSx\b/g, acronym: 'Sx', replacement: 'Síntomas' },
];

export function validateAuditRules(record: ClinicalRecord): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Módulo 1: Alta y Ficha de Identificación
  const id = record.identification;
  if (!id.nombres?.trim() || !id.apellidoPaterno?.trim()) {
    issues.push({
      field: 'Nombre del Paciente',
      module: 'Módulo 1',
      severity: 'error',
      message: 'El nombre completo y apellido paterno son obligatorios para el alta en SAC.'
    });
  }

  // Verificar antecedentes no vacíos
  const checkAntecedent = (val: string, name: string) => {
    if (!val || val.trim() === '') {
      issues.push({
        field: name,
        module: 'Módulo 1',
        severity: 'warning',
        message: `El campo ${name} no puede quedar en blanco. Asentar "Interrogados y negados" o "Negados".`,
        suggestion: 'Interrogados y negados'
      });
    }
  };

  checkAntecedent(id.antecedentesHeredofamiliares, 'Antecedentes Heredofamiliares');
  checkAntecedent(id.antecedentesPersonalesPatologicos, 'Antecedentes Personales Patológicos');
  checkAntecedent(id.farmacodependencias, 'Farmacodependencias');
  checkAntecedent(id.alergias, 'Alergias');

  // Módulo 2: Historia Clínica
  const hc = record.historyCheckup;
  if (!hc.padecimientoActual?.trim()) {
    issues.push({
      field: 'Padecimiento Actual',
      module: 'Módulo 2',
      severity: 'error',
      message: 'El Padecimiento Actual es obligatorio y debe redactarse cronológicamente.'
    });
  }

  // Interrogatorio terminación obligatoria
  if (hc.interrogatorioAparatos && !hc.interrogatorioAparatos.includes('resto del interrogatorio negado')) {
    issues.push({
      field: 'Interrogatorio por Aparatos y Sistemas',
      module: 'Módulo 2',
      severity: 'error',
      message: 'Obligatorio por auditoría finalizar con la frase "...resto del interrogatorio negado."',
      suggestion: 'Agregar al final: ", resto del interrogatorio negado."'
    });
  }

  // Somatometría: Talla en metros con punto decimal
  const tallaNum = parseFloat(hc.vitalSigns.talla);
  if (tallaNum > 3.0) {
    issues.push({
      field: 'Talla / Estatura',
      module: 'Módulo 2',
      severity: 'error',
      message: 'La talla debe asentarse en METROS con punto decimal (ej. 1.70), nunca en centímetros.',
      suggestion: (tallaNum / 100).toFixed(2)
    });
  }

  // Exploración genitales
  if (hc.physicalExam.genitales && !/diferido|no explorado/i.test(hc.physicalExam.genitales)) {
    issues.push({
      field: 'Exploración Genitales',
      module: 'Módulo 2',
      severity: 'warning',
      message: 'Las exploraciones ginecológica y urológica no se efectúan en consultorio SAC; asentar "Diferido" o "No explorado".'
    });
  }

  // Diagnóstico CIE-10
  if (!hc.diagnosticoCie10?.trim()) {
    issues.push({
      field: 'Diagnóstico (CIE-10)',
      module: 'Módulo 2',
      severity: 'error',
      message: 'Debe seleccionarse un código CIE-10 exacto con su descripción oficial.'
    });
  }

  // Revisión de siglas prohibidas en todos los textos de redacción
  const textFieldsToCheck = [
    { text: hc.padecimientoActual, name: 'Padecimiento Actual', mod: 'Módulo 2' },
    { text: hc.interrogatorioAparatos, name: 'Interrogatorio', mod: 'Módulo 2' },
    { text: hc.physicalExam.habitusExterior, name: 'Habitus Exterior', mod: 'Módulo 2' },
    { text: hc.physicalExam.cabezaCuello, name: 'Cabeza / Cuello', mod: 'Módulo 2' },
    { text: hc.physicalExam.torax, name: 'Tórax', mod: 'Módulo 2' },
    { text: hc.physicalExam.abdomen, name: 'Abdomen', mod: 'Módulo 2' },
    { text: hc.physicalExam.miembros, name: 'Miembros', mod: 'Módulo 2' },
    { text: hc.indicacionTerapeutica, name: 'Indicación Terapéutica', mod: 'Módulo 2' },
    { text: record.evolutionNote.evolucionCuadroClinico, name: 'Evolución Clínica', mod: 'Módulo 3' },
    { text: record.procedure.observacionesObligatorias, name: 'Observaciones de Procedimiento', mod: 'Módulo 4' }
  ];

  textFieldsToCheck.forEach(item => {
    if (!item.text) return;
    FORBIDDEN_ACRONYMS.forEach(rule => {
      if (rule.regex.test(item.text)) {
        issues.push({
          field: item.name,
          module: item.mod,
          severity: 'error',
          message: `Sigla prohibida detectada "${rule.acronym}". La NOM-004 prohíbe abreviaturas y siglas ambiguas.`,
          suggestion: `Reemplazar por "${rule.replacement}"`,
          replaceTarget: rule.acronym,
          replacement: rule.replacement
        });
      }
    });
  });

  return issues;
}

export function cleanForbiddenAcronyms(text: string): string {
  if (!text) return '';
  let cleaned = text;
  FORBIDDEN_ACRONYMS.forEach(rule => {
    cleaned = cleaned.replace(rule.regex, rule.replacement);
  });
  return cleaned;
}

export function calculateIMC(pesoKg: string | number, tallaMts: string | number): { imc: string; category: string; alertControlled: boolean } {
  let peso = typeof pesoKg === 'string' ? parseFloat(pesoKg) : pesoKg;
  let talla = typeof tallaMts === 'string' ? parseFloat(tallaMts) : tallaMts;

  if (!peso || !talla || talla <= 0 || peso <= 0) {
    return { imc: '', category: '', alertControlled: false };
  }

  // Si la talla fue puesta en cm ej 170 -> 1.70
  if (talla > 3.0) {
    talla = talla / 100;
  }

  const imcVal = peso / (talla * talla);
  const imcStr = imcVal.toFixed(2);

  let category = '';
  if (imcVal < 18.5) category = 'Bajo peso';
  else if (imcVal < 25) category = 'Peso normal';
  else if (imcVal < 30) category = 'Sobrepeso (Apto control peso)';
  else if (imcVal < 35) category = 'Obesidad Grado I (Apto control peso)';
  else if (imcVal < 40) category = 'Obesidad Grado II (Apto control peso)';
  else category = 'Obesidad Grado III / Mórbida (Apto control peso)';

  const alertControlled = imcVal >= 25;

  return { imc: imcStr, category, alertControlled };
}

export function formatTallaInput(raw: string): string {
  if (!raw) return '';
  const clean = raw.replace(/[^\d.]/g, '');
  const num = parseFloat(clean);
  if (isNaN(num)) return raw;
  if (num > 3.0 && num < 300) {
    return (num / 100).toFixed(2);
  }
  return clean;
}

// Generadores de texto modular listos para copiar y pegar en SAC
export function generateModule1Text(data: IdentificationData): string {
  return `[DATOS GENERALES]
Nombre(s): ${data.nombres || ''}
Apellido Paterno: ${data.apellidoPaterno || ''}
Apellido Materno: ${data.apellidoMaterno || ''}
Fecha de Nacimiento: ${data.fechaNacimiento || ''} | Edad: ${data.edad || ''} | Sexo: ${data.sexo || ''}
Estado de Nacimiento: ${data.estadoNacimiento || 'México'} | Nacionalidad: ${data.nacionalidad || 'Mexicana'}
CURP: ${data.curp || ''} | RFC: ${data.rfc || ''}

[DOMICILIO ACTUAL]
Código Postal: ${data.codigoPostal || ''}
Estado: ${data.estado || ''} | Municipio: ${data.municipio || ''} | Localidad: ${data.localidad || ''}
Colonia: ${data.colonia || ''}
Calle: ${data.calle || ''} | Número Ext: ${data.numeroExt || ''} | Número Int: ${data.numeroInt || 'Sin Número'}

[DATOS DE CONTACTO]
Teléfono Celular: ${data.telefonoCelular || ''} | Correo Electrónico: ${data.correoElectronico || ''}

[ANTECEDENTES CLÍNICOS]
- Antecedentes Heredofamiliares: ${data.antecedentesHeredofamiliares || 'Interrogados y negados'}
- Antecedentes Personales Patológicos: ${data.antecedentesPersonalesPatologicos || 'Interrogados y negados'}
- Farmacodependencias: ${data.farmacodependencias || 'Negadas'}
- Tabaquismo: ${data.tabaquismo || 'Negado'}
- Alcoholismo: ${data.alcoholismo || 'Negado'}
- Alergias: ${data.alergias || 'Negadas'}
- Inmunizaciones: ${data.inmunizaciones || 'Completas'}`;
}

export function generateModule2Text(data: HistoryCheckupData): string {
  const v = data.vitalSigns;
  const pe = data.physicalExam;

  let interr = data.interrogatorioAparatos?.trim() || 'Sin sintomatología referida por aparatos y sistemas';
  if (!interr.includes('resto del interrogatorio negado')) {
    interr += ', resto del interrogatorio negado.';
  }

  const prescripts = data.prescripcion.map((p, i) => 
    `  ${i + 1}. Producto: ${p.producto} ${p.marcaInstitucional ? `(${p.marcaInstitucional})` : ''}
     Cantidad: ${p.cantidad} | Vía: ${p.via} | Dosis: ${p.dosis}
     Periodicidad: ${p.periodicidad}${p.indicacionesAdicionales ? `\n     Indicación: ${p.indicacionesAdicionales}` : ''}`
  ).join('\n\n');

  const taDisplay = v.taPediatricaBadge ? `${v.taPediatricaBadge}` : `${v.taSistolica || '120'}/${v.taDiastolica || '80'}`;
  const spo2Display = v.satO2 ? ` | SpO2: ${v.satO2}%` : ' | SpO2: 98%';

  return `* Padecimiento Actual:
  ${data.padecimientoActual || 'Acude a valoración médica general.'}

* Interrogatorio por Aparatos y Sistemas:
  ${interr}

* Exploración Física:
  - Habitus Exterior: ${pe.habitusExterior || 'Paciente consciente, orientado en sus tres esferas neurológicas, reactivo, bien hidratado, con adecuada coloración de tegumentos y marcha normal.'}
  - Signos Vitales: Temp: ${v.temp || '36.5'} °C | T/A: ${taDisplay} mmHg | FC: ${v.fc || '75'} lpm | FR: ${v.fr || '18'} rpm${spo2Display} | Peso: ${v.peso || '70.0'} kg | Talla: ${v.talla || '1.70'} m | IMC: ${v.imc || '24.22'} kg/m²${v.glucosa ? ` | Glucosa: ${v.glucosa} mg/dL` : ''}
  - Cabeza / Cuello: ${pe.cabezaCuello || 'Normocéfalo, sin exostosis ni hundimientos, pupilas isocóricas normorreflécticas, faringe sin alteraciones, cuello simétrico sin adenomegalias palpables.'}
  - Tórax: ${pe.torax || 'Normolíneo, con adecuada amplexión y amplexación, campos pulmonares bien ventilados sin estertores ni sibilancias, ruidos cardiacos rítmicos de buen tono e intensidad sin soplos agregados.'}
  - Abdomen: ${pe.abdomen || 'Plano, blando, depresible, no doloroso a la palpación superficial ni profunda, ruidos peristálticos presentes normales, sin visceromegalias ni datos de irritación peritoneal.'}
  - Miembros: ${pe.miembros || 'Torácicos y pélvicos íntegros, simétricos, arcos de movilidad conservados, pulsos periféricos presentes de adecuada intensidad, sin edema y llenado capilar distal inmediato.'}
  - Genitales: Diferido

* Diagnóstico (CIE-10):
  ${data.diagnosticoCie10 || 'Z00.0 - Examen médico general (Chequeo general / Rutina)'}${data.diagnosticoSecundario ? `\n  ${data.diagnosticoSecundario}` : ''}

* Pronóstico:
  ${data.pronostico || 'Favorable para la vida y función.'}

* Indicación Terapéutica (Comentarios de Receta):
  ${data.indicacionTerapeutica || 'Medidas higiénico-dietéticas: adecuada hidratación oral (2 a 3 litros de agua al día), reposo relativo, alimentación balanceada baja en irritantes y grasas. Se explican datos de alarma. Cita abierta en caso de persistencia o revaloración en 5 días.'}

* Orden de Surtido (Prescripción):
${prescripts || '  - Sin prescripción farmacológica en esta consulta.'}`;
}

export function generateModule3Text(data: EvolutionNoteData): string {
  const v = data.vitalSigns;
  const taDisplay = v?.taPediatricaBadge ? `${v.taPediatricaBadge}` : `${v?.taSistolica || '120'}/${v?.taDiastolica || '80'}`;
  const spo2Display = v?.satO2 ? ` | SpO2: ${v.satO2}%` : ' | SpO2: 98%';

  return `* Diagnóstico de Seguimiento:
  ${data.diagnosticoSeguimiento || 'Seguimiento de consulta previa.'}

* Signos Vitales Actuales:
  Temp: ${v?.temp || '36.5'} °C | T/A: ${taDisplay} mmHg | FC: ${v?.fc || '75'} lpm | FR: ${v?.fr || '18'} rpm${spo2Display} | Peso: ${v?.peso || '70.0'} kg | Talla: ${v?.talla || '1.70'} m | IMC: ${v?.imc || '24.22'} kg/m²

* Evolución y Actualización del Cuadro Clínico:
  ${data.evolucionCuadroClinico || 'Paciente acude a revaloración médica. Refiere adecuada respuesta y tolerancia al tratamiento previo, con disminución progresiva de la sintomatología.'}

* Exploración Física Dirigida:
  ${data.exploracionFisicaDirigida || 'Paciente consciente, orientado, adecuada hidratación. Exploración dirigida sin datos patológicos agudos agregados.'}

* Diagnóstico Actualizado:
  ${data.diagnosticoActualizado || 'Diagnóstico de control y seguimiento.'}

* Plan Terapéutico y Receta:
  ${data.planTerapeutico || 'Se mantiene plan terapéutico actual con recomendaciones higiénico-dietéticas. Se reitera vigilancia de signos de alarma. Cita abierta.'}`;
}

export function generateModule4Text(data: ProcedureData): string {
  return `* Procedimiento Realizado:
  ${data.procedimientoRealizado || 'Aplicación de Inyección Intramuscular'}

* Observaciones Obligatorias:
  ${data.observacionesObligatorias || 'Se realiza procedimiento bajo técnica aséptica, previa explicación al paciente de indicaciones y riesgos. Sin complicaciones inmediatas.'}

* Leyenda de Consentimiento y Testigos:
  ${data.leyendaTestigos || 'Se cuenta con firma de consentimiento informado por paciente y testigo.'}`;
}

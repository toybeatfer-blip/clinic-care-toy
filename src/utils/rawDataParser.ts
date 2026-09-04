import { ClinicalRecord, Gender, PrescriptionItem } from '../types';
import { CIE10_CATALOG } from '../data/cie10Catalog';
import { MEDICATION_CATALOG } from '../data/medicationCatalog';
import { calculateIMC, cleanForbiddenAcronyms } from './nom004Validator';

export function parseRawMedicalNote(rawText: string, existingRecord?: ClinicalRecord): Partial<ClinicalRecord> {
  const text = rawText.trim();
  if (!text) return {};

  // 1. Detectar Sexo y Edad
  let detectedGender: Gender = 'Masculino';
  if (/femenin[oa]|mujer|paciente\s+f\b|femenina|niña|señora/i.test(text)) {
    detectedGender = 'Femenino';
  } else if (/masculin[oa]|hombre|paciente\s+m\b|masculino|niño|señor/i.test(text)) {
    detectedGender = 'Masculino';
  }

  let detectedAge = '';
  const ageMatch = text.match(/(\d{1,3})\s*(?:años|a\b|añs|año)/i);
  if (ageMatch) {
    detectedAge = ageMatch[1];
  }

  // 2. Detectar Nombre si viene al inicio (ej. Nombre: Juan Pérez o Paciente: María Gómez)
  let detectedName = '';
  let detectedAppPaterno = '';
  let detectedAppMaterno = '';
  const nameMatch = text.match(/(?:paciente|nombre|px|nombre del paciente):\s*([a-záéíóúñ\s]+)/i);
  if (nameMatch) {
    const parts = nameMatch[1].trim().split(/\s+/);
    if (parts.length >= 3) {
      detectedName = parts.slice(0, parts.length - 2).join(' ');
      detectedAppPaterno = parts[parts.length - 2];
      detectedAppMaterno = parts[parts.length - 1];
    } else if (parts.length === 2) {
      detectedName = parts[0];
      detectedAppPaterno = parts[1];
    } else if (parts.length === 1) {
      detectedName = parts[0];
    }
  }

  // 3. Detectar Signos Vitales
  let temp = '';
  const tempMatch = text.match(/(?:temp|temperatura|t°?|fiebre)\s*(?:de|:)?\s*([34]\d(?:\.\d)?)\s*(?:°?c)?/i);
  if (tempMatch) temp = tempMatch[1];

  let taSist = '120';
  let taDiast = '80';
  let taBadge = '';
  const taMatch = text.match(/(?:t\/?a|p\/?a|presion|presión|tensi[oó]n arterial)\s*(?:de|:)?\s*(\d{2,3})\s*[\/|\-]\s*(\d{2,3})/i);
  if (taMatch) {
    taSist = taMatch[1];
    taDiast = taMatch[2];
  } else if (/pedi[aá]trico|lactante|bebe|infante/i.test(text) && detectedAge && parseInt(detectedAge) < 8) {
    taBadge = 'PEDIÁTRICO';
  }

  let fc = '';
  const fcMatch = text.match(/(?:fc|frecuencia cardiaca|pulso|lpm)\s*(?:de|:)?\s*(\d{2,3})/i);
  if (fcMatch) fc = fcMatch[1];

  let fr = '';
  const frMatch = text.match(/(?:fr|frecuencia respiratoria|rpm)\s*(?:de|:)?\s*(\d{1,2})/i);
  if (frMatch) fr = frMatch[1];

  let satO2 = '';
  const satMatch = text.match(/(?:sato2|spo2|saturaci[oó]n|sat|oxigeno|oxígeno)\s*(?:de|:)?\s*(\d{2,3})\s*%?/i);
  if (satMatch) satO2 = satMatch[1];

  let peso = '';
  const pesoMatch = text.match(/(?:peso|kg)\s*(?:de|:)?\s*(\d{1,3}(?:\.\d{1,2})?)\s*(?:kg|kilos)?/i);
  if (pesoMatch) peso = pesoMatch[1];

  let talla = '';
  const tallaMatch = text.match(/(?:talla|estatura|altura|m|mts)\s*(?:de|:)?\s*(\d(?:\.\d{1,2})?|\d{2,3})\s*(?:m|mts|cm)?/i);
  if (tallaMatch) {
    let tVal = parseFloat(tallaMatch[1]);
    if (tVal > 3.0) tVal = tVal / 100;
    talla = tVal.toFixed(2);
  }

  let glucosa = '';
  const gluMatch = text.match(/(?:glucosa|dxtx|hgt|glicemia)\s*(?:de|:)?\s*(\d{2,3})\s*(?:mg\/dl)?/i);
  if (gluMatch) glucosa = gluMatch[1];

  const imcCalc = calculateIMC(peso || '70', talla || '1.70');

  // 4. Buscar Diagnóstico CIE-10 aproximado
  let detectedCie10 = '';
  const lowerText = text.toLowerCase();
  for (const item of CIE10_CATALOG) {
    const itemKeywords = item.name.toLowerCase().split(/[,\s[\]()]+/).filter(w => w.length > 3);
    const matchesKeyword = itemKeywords.some(kw => lowerText.includes(kw));
    if (matchesKeyword || lowerText.includes(item.code.toLowerCase())) {
      detectedCie10 = `${item.code} - ${item.name}`;
      break;
    }
  }
  if (!detectedCie10) {
    if (/garganta|faringe|odinofagia|amigdal/i.test(text)) {
      detectedCie10 = 'J02.9 - Faringitis aguda, no especificada';
    } else if (/gripe|resfriado|rinorrea|tos\s+seca/i.test(text)) {
      detectedCie10 = 'J00X - Rinofaringitis aguda [resfriado común]';
    } else if (/estomago|diarrea|vomito|evacuacion|gastritis/i.test(text)) {
      detectedCie10 = 'K29.7 - Gastritis, no especificada';
    } else if (/lumbalgia|espalda|cintura|dolor lumbar/i.test(text)) {
      detectedCie10 = 'M54.5 - Lumbago no especificado (Lumbalgia)';
    } else if (/orina|cistitis|ardor al orinar|disuria/i.test(text)) {
      detectedCie10 = 'N39.0 - Infección de vías urinarias, sitio no especificado';
    } else {
      detectedCie10 = 'Z00.0 - Examen médico general (Chequeo general / Rutina)';
    }
  }

  // 5. Detectar Medicamentos y armar prescripción
  const prescripciones: PrescriptionItem[] = [];
  const medMatches = text.match(/(?:tx|tratamiento|medicamento|receta|dar|indicar|prescribir):?([\s\S]*?)(?:pronostico|indicaciones|observaciones|$)/i);
  const medSection = medMatches ? medMatches[1] : text;

  MEDICATION_CATALOG.forEach(med => {
    const medRegex = new RegExp(med.substance.split('/')[0].trim().replace(/\s+/g, '\\s*'), 'i');
    if (medRegex.test(medSection) || medSection.toLowerCase().includes(med.name.toLowerCase().substring(0, 8))) {
      prescripciones.push({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
        producto: med.name,
        marcaInstitucional: med.brand,
        cantidad: '1 caja / pieza',
        via: med.category.includes('Inyectable') ? 'Intramuscular' : 'Oral',
        dosis: med.defaultDose?.split('.')[0] || '1 tableta cada 8 horas',
        periodicidad: med.defaultDose || 'Tomar según prescripción médica.',
        indicacionesAdicionales: 'Tomar con abundante agua después de los alimentos.'
      });
    }
  });

  // Si no encontró de catálogo pero hay texto descriptivo de medicamentos
  if (prescripciones.length === 0 && /paracetamol|amoxicilina|ibuprofeno|omeprazol|loratadina|ketorolaco|ciprofloxacino/i.test(text)) {
    if (/paracetamol/i.test(text)) {
      prescripciones.push({
        id: String(Math.random()),
        producto: 'Paracetamol 500 mg Tabletas',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 20 tabletas',
        via: 'Oral',
        dosis: '500 mg',
        periodicidad: 'Tomar 1 tableta cada 8 horas por 5 días en caso de dolor o fiebre.'
      });
    }
    if (/amoxi|amoxicilina/i.test(text)) {
      prescripciones.push({
        id: String(Math.random()),
        producto: 'Amoxicilina / Ácido Clavulánico 875 mg / 125 mg Tabletas',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 14 tabletas',
        via: 'Oral',
        dosis: '875 mg / 125 mg',
        periodicidad: 'Tomar 1 tableta cada 12 horas con alimentos por 7 días continuos.'
      });
    }
  }

  // 6. Construir Redacción Médica Formal de Padecimiento Actual
  let padecimiento = cleanForbiddenAcronyms(text)
    .replace(/(?:nombre|paciente|edad|sexo|signos|ta|fc|fr|sat|spo2|peso|talla|dx|tx|receta):[^\n]*/gi, '')
    .trim();

  if (!padecimiento || padecimiento.length < 15) {
    padecimiento = `Paciente ${detectedGender.toLowerCase()} de ${detectedAge || 'edad no especificada'} años acude a consulta médica por presentar cuadro clínico caracterizado por sintomatología referida de evolución reciente. Refiere malestar general y solicita valoración diagnóstica y tratamiento oportuno.`;
  } else {
    padecimiento = `Inicia su padecimiento actual ${padecimiento.replace(/^\w/, c => c.toUpperCase())}. No refiere sintomatología previa similar ni automedicación de relevancia.`;
  }

  // 7. Exploración física contextual
  let habitus = 'Paciente consciente, orientado en sus tres esferas neurológicas, cooperador, bien hidratado, con adecuada coloración mucotegumentaria, marcha regular.';
  let cabezaCuello = 'Normocéfalo, sin exostosis, pupilas isocóricas fotorreactivas, faringe ' + (/faringe|amigdal/i.test(text) ? 'hiperémica con exudado leve, amígdalas eutróficas' : 'con adecuada coloración sin datos de inflamación aguda') + ', cuello sin adenomegalias palpables.';
  let torax = 'Normolíneo, simétrico, movimientos de amplexión y amplexación normales, ruidos cardiacos rítmicos sin soplos, campos pulmonares ' + (/tos|flema|pulmon/i.test(text) ? 'con murmullo vesicular presente, estertores leves en bases' : 'bien ventilados sin ruidos agregados') + '.';
  let abdomen = 'Blando, depresible, no doloroso a la palpación superficial ni profunda, ruidos peristálticos presentes de tono y frecuencia normal, sin datos de irritación peritoneal.';
  let miembros = 'Íntegros, simétricos, arcos de movilidad conservados, pulsos periféricos palpables y simétricos, sin edema de miembros pélvicos, llenado capilar inmediato.';

  // 8. Detectar mención de estudios previos (Labs, RX, USG, TAC)
  let parsedLaboratorios = '';
  let parsedRx = '';
  let parsedUsg = '';
  let parsedTac = '';
  let parsedOtros = '';
  let parsedInterp = '';

  const labMatch = text.match(/(?:laboratorio|laboratorios|labs|bh|qu[ií]mica sangu[ií]nea|ego|biometr[ií]a|glucosa en ayuno)[\s:]*([^\n.;]+)/i);
  if (labMatch) parsedLaboratorios = labMatch[0].trim();

  const rxMatch = text.match(/(?:rx|rayos x|radiograf[ií]a|placa)[\s:]*([^\n.;]+)/i);
  if (rxMatch) parsedRx = rxMatch[0].trim();

  const usgMatch = text.match(/(?:usg|ultrasonido|ecograf[ií]a|eco)[\s:]*([^\n.;]+)/i);
  if (usgMatch) parsedUsg = usgMatch[0].trim();

  const tacMatch = text.match(/(?:tac|tomograf[ií]a|tc)[\s:]*([^\n.;]+)/i);
  if (tacMatch) parsedTac = tacMatch[0].trim();

  if (parsedLaboratorios || parsedRx || parsedUsg || parsedTac) {
    parsedInterp = 'Estudios aportados por el paciente se correlacionan clínicamente con el diagnóstico y evolución del cuadro actual.';
  }

  // 9. Detectar Antecedentes Heredofamiliares o Patológicos en dictado libre
  let parsedAHF = existingRecord?.identification.antecedentesHeredofamiliares || '';
  const ahfMatch = text.match(/(?:ahf|antecedentes\s+familiares|heredofamiliares|heredofamiliar)[\s:]*([^\n;]+)/i);
  if (ahfMatch) {
    parsedAHF = ahfMatch[1].trim();
  } else if (!parsedAHF) {
    parsedAHF = 'Interrogados y negados';
  }

  let parsedAPP = existingRecord?.identification.antecedentesPersonalesPatologicos || '';
  const appMatch = text.match(/(?:app|antecedentes\s+patol[oó]gicos|patol[oó]gicos|antecedentes\s+personales)[\s:]*([^\n;]+)/i);
  if (appMatch) {
    parsedAPP = appMatch[1].trim();
  } else if (!parsedAPP) {
    parsedAPP = 'Interrogados y negados';
  }

  return {
    identification: {
      nombres: detectedName || existingRecord?.identification.nombres || '',
      apellidoPaterno: detectedAppPaterno || existingRecord?.identification.apellidoPaterno || '',
      apellidoMaterno: detectedAppMaterno || existingRecord?.identification.apellidoMaterno || '',
      fechaNacimiento: existingRecord?.identification.fechaNacimiento || '',
      edad: detectedAge || existingRecord?.identification.edad || '',
      sexo: detectedGender,
      estadoNacimiento: existingRecord?.identification.estadoNacimiento || 'México',
      nacionalidad: 'Mexicana',
      curp: existingRecord?.identification.curp || '',
      rfc: existingRecord?.identification.rfc || '',
      codigoPostal: existingRecord?.identification.codigoPostal || '',
      estado: existingRecord?.identification.estado || '',
      municipio: existingRecord?.identification.municipio || '',
      localidad: existingRecord?.identification.localidad || '',
      colonia: existingRecord?.identification.colonia || '',
      calle: existingRecord?.identification.calle || '',
      numeroExt: existingRecord?.identification.numeroExt || '',
      numeroInt: existingRecord?.identification.numeroInt || 'Sin Número',
      telefonoCelular: existingRecord?.identification.telefonoCelular || '',
      correoElectronico: existingRecord?.identification.correoElectronico || '',
      antecedentesHeredofamiliares: parsedAHF,
      antecedentesPersonalesPatologicos: parsedAPP,
      farmacodependencias: existingRecord?.identification.farmacodependencias || 'Negadas',
      tabaquismo: existingRecord?.identification.tabaquismo || 'Negado',
      alcoholismo: existingRecord?.identification.alcoholismo || 'Negado',
      alergias: existingRecord?.identification.alergias || 'Negadas',
      inmunizaciones: 'Completas'
    },
    historyCheckup: {
      padecimientoActual: padecimiento,
      interrogatorioAparatos: 'Aparato respiratorio, digestivo, cardiovascular y genitourinario sin alteraciones agregadas, resto del interrogatorio negado.',
      vitalSigns: {
        temp: temp || '36.5',
        taSistolica: taSist,
        taDiastolica: taDiast,
        taPediatricaBadge: taBadge,
        fc: fc || '76',
        fr: fr || '18',
        satO2: satO2 || '98',
        peso: peso || '70.0',
        talla: talla || '1.70',
        imc: imcCalc.imc,
        glucosa: glucosa || ''
      },
      physicalExam: {
        habitusExterior: habitus,
        cabezaCuello: cabezaCuello,
        torax: torax,
        abdomen: abdomen,
        miembros: miembros,
        genitales: 'Diferido'
      },
      estudiosDiagnostico: {
        laboratorios: parsedLaboratorios || existingRecord?.historyCheckup.estudiosDiagnostico?.laboratorios || '',
        rayosX: parsedRx || existingRecord?.historyCheckup.estudiosDiagnostico?.rayosX || '',
        ultrasonido: parsedUsg || existingRecord?.historyCheckup.estudiosDiagnostico?.ultrasonido || '',
        tomografiaTac: parsedTac || existingRecord?.historyCheckup.estudiosDiagnostico?.tomografiaTac || '',
        otrosEstudios: parsedOtros || existingRecord?.historyCheckup.estudiosDiagnostico?.otrosEstudios || '',
        interpretacionHallazgos: parsedInterp || existingRecord?.historyCheckup.estudiosDiagnostico?.interpretacionHallazgos || ''
      },
      diagnosticoCie10: detectedCie10,
      pronostico: 'Favorable para la vida y función.',
      indicacionTerapeutica: '1. Reposo relativo y abundantes líquidos orales (2 a 3 litros al día).\n2. Dieta balanceada baja en irritantes, condimentos y grasas saturadas.\n3. Evitar cambios bruscos de temperatura.\n4. Datos de alarma: fiebre persistente >38.5°C resistente a antipiréticos, dificultad respiratoria, vómito incoercible o intolerancia a la vía oral; acudir de inmediato a revaloración.\n5. Cita abierta o revaloración en 5 días si no presenta mejoría clínica.',
      prescripcion: prescripciones.length > 0 ? prescripciones : [
        {
          id: '1',
          producto: 'Paracetamol 500 mg Tabletas',
          marcaInstitucional: 'GENÉRICO',
          cantidad: '1 caja con 20 tabletas',
          via: 'Oral',
          dosis: 'Tomar 1 tableta cada 8 horas',
          periodicidad: 'Por 5 días en caso de dolor o fiebre.'
        }
      ]
    }
  };
}

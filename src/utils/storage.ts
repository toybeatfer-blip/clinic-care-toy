import { ClinicalRecord, DoctorSettings } from '../types';

const STORAGE_KEY = 'clinic_care_toy_records_v1';
const CURRENT_ACTIVE_KEY = 'clinic_care_toy_current_active_v1';
const DOCTOR_SETTINGS_KEY = 'clinic_care_toy_doctor_settings_v1';

export function getInitialDoctorSettings(): DoctorSettings {
  return {
    doctorName: 'Carlos Morales Hernández',
    prefix: 'Dr.',
    cedulaGeneral: '12345678',
    cedulaEspecialidad: '',
    especialidad: 'Medicina General y Primer Contacto',
    universidad: 'Universidad Nacional Autónoma de México (UNAM)',
    telefonoContacto: '55 1234 5678',
    correoContacto: 'dr.carlos@consultorio.med.mx',
    nombreClinica: 'Consultorio Médico de Primer Contacto',
    sucursal: 'Sucursal 1404 - Centro',
    direccionClinica: 'Av. Juárez #105, Col. Centro, CP 06000, Ciudad de México',
    telefonoClinica: '55 9876 5432',
    logoUrl: '',
    primaryColor: 'sky'
  };
}

export function loadDoctorSettings(): DoctorSettings {
  try {
    const raw = localStorage.getItem(DOCTOR_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading doctor settings', e);
  }
  return getInitialDoctorSettings();
}

export function saveDoctorSettings(settings: DoctorSettings): void {
  try {
    localStorage.setItem(DOCTOR_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving doctor settings', e);
  }
}

export function getInitialRecord(): ClinicalRecord {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ticketFolio: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activeModule: 'modulo2',
    identification: {
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      fechaNacimiento: '',
      edad: '',
      sexo: 'Masculino',
      estadoNacimiento: 'México',
      nacionalidad: 'Mexicana',
      curp: '',
      rfc: '',
      codigoPostal: '',
      estado: '',
      municipio: '',
      localidad: '',
      colonia: '',
      calle: '',
      numeroExt: '',
      numeroInt: 'Sin Número',
      telefonoCelular: '',
      correoElectronico: '',
      antecedentesHeredofamiliares: 'Interrogados y negados',
      antecedentesPersonalesPatologicos: 'Interrogados y negados',
      farmacodependencias: 'Negadas',
      tabaquismo: 'Negado',
      alcoholismo: 'Negado',
      alergias: 'Negadas',
      inmunizaciones: 'Completas'
    },
    historyCheckup: {
      padecimientoActual: '',
      interrogatorioAparatos: 'Sin sintomatología agregada por aparatos y sistemas, resto del interrogatorio negado.',
      vitalSigns: {
        temp: '36.5',
        taSistolica: '120',
        taDiastolica: '80',
        taPediatricaBadge: '',
        fc: '75',
        fr: '18',
        peso: '70.0',
        talla: '1.70',
        imc: '24.22',
        satO2: '98',
        glucosa: ''
      },
      physicalExam: {
        habitusExterior: 'Paciente consciente, orientado en tiempo, espacio y persona, bien hidratado, con adecuada coloración de tegumentos y marcha normal.',
        cabezaCuello: 'Normocéfalo, sin exostosis, pupilas isocóricas normorreflécticas, faringe sin alteraciones evidentes, cuello simétrico sin adenomegalias palpables.',
        torax: 'Normolíneo, simétrico, con adecuada amplexión y amplexación, campos pulmonares bien ventilados sin estertores, ruidos cardiacos rítmicos sin soplos.',
        abdomen: 'Plano, blando, depresible, no doloroso a la palpación superficial ni profunda, ruidos peristálticos presentes normales, sin visceromegalias ni irritación peritoneal.',
        miembros: 'Íntegros, simétricos, arcos de movilidad conservados, pulsos presentes, sin edema en miembros pélvicos, llenado capilar distal de 2 segundos.',
        genitales: 'Diferido'
      },
      diagnosticoCie10: 'J00X - Rinofaringitis aguda [resfriado común]',
      diagnosticoSecundario: '',
      pronostico: 'Favorable para la vida y función.',
      indicacionTerapeutica: '1. Medidas higiénico-dietéticas: Reposo relativo, hidratación oral abundante (2 a 3 litros de agua al día).\n2. Dieta blanda, fraccionada, baja en irritantes, grasas saturadas y condimentos.\n3. Se explican signos de alarma (fiebre de difícil control, disnea, vómito persistente).\n4. Cita abierta o revaloración en caso de persistencia del cuadro en 5 días.',
      prescripcion: [
        {
          id: '1',
          producto: 'Paracetamol 500 mg Tabletas (FABE)',
          marcaInstitucional: 'FABE',
          cantidad: '1 caja con 20 tabletas',
          via: 'Oral',
          dosis: 'Tomar 1 tableta (500 mg) cada 8 horas',
          periodicidad: 'Por 5 días en caso de dolor o fiebre.'
        }
      ]
    },
    evolutionNote: {
      diagnosticoSeguimiento: 'J00X - Rinofaringitis aguda [resfriado común]',
      evolucionCuadroClinico: 'Paciente acude a consulta de revaloración y seguimiento. Refiere mejoría clínica progresiva tras inicio de tratamiento, con disminución notable de la sintomatología inicial. Niega efectos adversos al medicamento prescrito.',
      exploracionFisicaDirigida: 'Paciente consciente, reactivo, afebril, mucosa oral adecuadamente hidratada, faringe sin hiperemia ni exudados, campos pulmonares limpios y bien ventilados, abdomen sin alteraciones.',
      diagnosticoActualizado: 'J00X - Rinofaringitis aguda [resfriado común] en resolución.',
      planTerapeutico: 'Se mantiene esquema terapéutico hasta completar los días indicados. Se reitera la importancia de la hidratación y cuidados generales. Cita abierta.',
      vitalSigns: {
        temp: '36.5',
        taSistolica: '120',
        taDiastolica: '80',
        taPediatricaBadge: '',
        fc: '74',
        fr: '18',
        peso: '70.0',
        talla: '1.70',
        imc: '24.22',
        satO2: '98',
        glucosa: ''
      }
    },
    procedure: {
      procedimientoRealizado: 'Aplicación de Inyección Intramuscular',
      tipoProcedimiento: 'Inyección Intramuscular',
      observacionesObligatorias: 'Se realiza asepsia y antisepsia de región glútea cuadrante superior externo. Se administra medicamento prescrito vía intramuscular profunda con técnica estéril. Paciente tolera procedimiento sin complicaciones inmediatas.',
      farmacoAdministrado: 'Ketorolaco trometamina / Ceftriaxona',
      presentacionDosis: 'Ampolleta 30 mg / 1 ml',
      zonaAplicacion: 'Región glútea izquierda',
      leyendaTestigos: 'Se cuenta con firma de consentimiento informado por paciente y testigo'
    }
  };
}

export function loadSavedRecords(): ClinicalRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading records', e);
    return [];
  }
}

export function saveRecordToStorage(record: ClinicalRecord): ClinicalRecord[] {
  try {
    const records = loadSavedRecords();
    const existingIndex = records.findIndex(r => r.id === record.id);
    const updated = { ...record, updatedAt: new Date().toISOString() };
    
    let nextRecords: ClinicalRecord[];
    if (existingIndex >= 0) {
      nextRecords = [...records];
      nextRecords[existingIndex] = updated;
    } else {
      nextRecords = [updated, ...records];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
    localStorage.setItem(CURRENT_ACTIVE_KEY, JSON.stringify(updated));
    return nextRecords;
  } catch (e) {
    console.error('Error saving record', e);
    return [];
  }
}

export function loadActiveRecord(): ClinicalRecord {
  try {
    const raw = localStorage.getItem(CURRENT_ACTIVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return getInitialRecord();
}

export function deleteRecordFromStorage(id: string): ClinicalRecord[] {
  try {
    const records = loadSavedRecords();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error(e);
    return [];
  }
}

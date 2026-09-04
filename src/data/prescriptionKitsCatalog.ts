import { PrescriptionKit } from '../types';

export const DEFAULT_PRESCRIPTION_KITS: PrescriptionKit[] = [
  {
    id: 'kit-lumbalgia',
    name: 'Lumbalgia Mecánica / Espasmo Muscular',
    category: 'Traumatología / General',
    description: 'AINE + Relajante muscular + Protector gástrico',
    indications: 'Reposo relativo en posición fetal o fowler con almohada bajo rodillas. Aplicación de compresas tibias en región lumbar 15 min 3 veces al día. Evitar cargar objetos pesados.',
    items: [
      {
        id: '1',
        producto: 'Ketorolaco con Trometamina 10 mg Tabletas',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 10 tabletas',
        via: 'Oral',
        dosis: 'Tomar 1 tableta cada 8 horas',
        periodicidad: 'Por 3 a 5 días (no exceder 5 días).',
        indicacionesAdicionales: 'Tomar después de los alimentos.'
      },
      {
        id: '2',
        producto: 'Metocarbamol 500 mg Tabletas',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 20 tabletas',
        via: 'Oral',
        dosis: 'Tomar 1 tableta cada 8 horas',
        periodicidad: 'Por 5 días.',
        indicacionesAdicionales: 'Puede causar ligera somnolencia.'
      },
      {
        id: '3',
        producto: 'Omeprazol 20 mg Cápsulas',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 14 cápsulas',
        via: 'Oral',
        dosis: 'Tomar 1 cápsula cada 24 horas',
        periodicidad: 'Por 7 días en ayuno.',
        indicacionesAdicionales: 'Tomar 30 minutos antes del desayuno.'
      }
    ]
  },
  {
    id: 'kit-faringoamigdalitis',
    name: 'Faringoamigdalitis Aguda Bacteriana',
    category: 'Infectología / Otorrino',
    description: 'Antibiótico betalactámico + Antipirético/Analgésico + Antiséptico bucofaríngeo',
    indications: 'Abundantes líquidos tibios, gárgaras con agua tibia y sal, evitar cambios bruscos de temperatura y alimentos irritantes.',
    items: [
      {
        id: '1',
        producto: 'Amoxicilina con Ácido Clavulánico 875/125 mg Tabletas',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 14 tabletas',
        via: 'Oral',
        dosis: 'Tomar 1 tableta cada 12 horas',
        periodicidad: 'Por 7 días continuos.',
        indicacionesAdicionales: 'Completar el tratamiento completo aunque desaparezcan los síntomas.'
      },
      {
        id: '2',
        producto: 'Paracetamol 750 mg Tabletas',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 10 tabletas',
        via: 'Oral',
        dosis: 'Tomar 1 tableta cada 8 horas',
        periodicidad: 'Por 3 a 5 días en caso de dolor o fiebre.',
        indicacionesAdicionales: 'No exceder 4 g al día.'
      },
      {
        id: '3',
        producto: 'Benzidamina 0.15% Solución Spray Bucal',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 frasco nebulizador',
        via: 'Tópica',
        dosis: 'Aplicar 3 atomizaciones en la orofaringe',
        periodicidad: 'Cada 6 horas por 4 días.',
        indicacionesAdicionales: 'No ingerir alimentos en los 15 minutos posteriores.'
      }
    ]
  },
  {
    id: 'kit-cistitis-itu',
    name: 'Infección de Vías Urinarias / Cistitis No Complicada',
    category: 'Urología / Ginecología',
    description: 'Antiséptico urinario + Antiespasmódico vesical',
    indications: 'Ingesta hídrica abundante (2.5 a 3 litros de agua natural al día). No aguantar las ganas de orinar. Aseo genital adecuado de adelante hacia atrás.',
    items: [
      {
        id: '1',
        producto: 'Nitrofurantoína 100 mg Cápsulas de liberación prolongada',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 20 cápsulas',
        via: 'Oral',
        dosis: 'Tomar 1 cápsula cada 12 horas',
        periodicidad: 'Por 7 días.',
        indicacionesAdicionales: 'Tomar con los alimentos. Puede colorear la orina de amarillo intenso/café.'
      },
      {
        id: '2',
        producto: 'Fenazopiridina 100 mg Tabletas',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 20 tabletas',
        via: 'Oral',
        dosis: 'Tomar 1 tableta cada 8 horas',
        periodicidad: 'Por 2 días únicamente.',
        indicacionesAdicionales: 'Colorea la orina de color anaranjado-rojizo normal.'
      }
    ]
  },
  {
    id: 'kit-gastritis-erge',
    name: 'Gastritis Aguda / Dispepsia / ERGE',
    category: 'Gastroenterología',
    description: 'Inhibidor de bomba de protones + Antiácido en gel + Procinético',
    indications: 'Dieta fraccionada en 5 tiempos, baja en grasas, condimentos, café, chocolate y alcohol. Evitar acostarse inmediatamente después de comer (esperar 2 horas).',
    items: [
      {
        id: '1',
        producto: 'Pantoprazol 40 mg Tabletas',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 14 tabletas',
        via: 'Oral',
        dosis: 'Tomar 1 tableta cada 24 horas',
        periodicidad: 'Por 14 a 28 días.',
        indicacionesAdicionales: 'Tomar 30 a 60 minutos antes del desayuno con agua.'
      },
      {
        id: '2',
        producto: 'Gel de Hidróxido de Aluminio y Magnesio con Dimeticona',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 frasco con 250 ml',
        via: 'Oral',
        dosis: 'Tomar 1 cucharada sopera (15 ml)',
        periodicidad: '1 hora después de los alimentos y antes de dormir.',
        indicacionesAdicionales: 'Agitar bien antes de usar.'
      }
    ]
  },
  {
    id: 'kit-control-prenatal',
    name: 'Suplementación en Control Prenatal',
    category: 'Ginecología y Obstetricia',
    description: 'Ácido Fólico + Hierro elemental + Calcio con Vitamina D',
    indications: 'Monitoreo de movimientos fetales diarios, vigilancia de signos de alarma obstétrica (sangrado transvaginal, salida de líquido amniótico, cefalea intensa, acúfenos, fosfenos o dolor en epigastrio). Cita de control mensual.',
    items: [
      {
        id: '1',
        producto: 'Ácido Fólico 5 mg Tabletas',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 30 tabletas',
        via: 'Oral',
        dosis: 'Tomar 1 tableta cada 24 horas',
        periodicidad: 'Durante todo el embarazo.',
        indicacionesAdicionales: 'Tomar por la mañana.'
      },
      {
        id: '2',
        producto: 'Fumarato Ferroso con Ácido Fólico 200 mg / 0.4 mg',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 30 tabletas',
        via: 'Oral',
        dosis: 'Tomar 1 tableta cada 24 horas',
        periodicidad: 'A partir de la semana 14 de gestación.',
        indicacionesAdicionales: 'Tomar preferentemente con jugo de naranja o agua con limón para mejorar su absorción.'
      }
    ]
  },
  {
    id: 'kit-postquirurgico',
    name: 'Manejo Post-Quirúrgico / Cirugía Menor',
    category: 'Cirugía General / Traumatología',
    description: 'Analgésico potente + Antibiótico profiláctico + Cuidado de herida',
    indications: 'Mantener la herida quirúrgica limpia y seca. Lavado con agua y jabón neutro diario. Cita para retiro de puntos en 7 a 10 días.',
    items: [
      {
        id: '1',
        producto: 'Cefalexina 500 mg Cápsulas',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 20 cápsulas',
        via: 'Oral',
        dosis: 'Tomar 1 cápsula cada 8 horas',
        periodicidad: 'Por 5 a 7 días.',
        indicacionesAdicionales: 'Completar horario estricto.'
      },
      {
        id: '2',
        producto: 'Clonixinato de Lisina 125 mg Tabletas',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 20 tabletas',
        via: 'Oral',
        dosis: 'Tomar 1 tableta cada 8 horas',
        periodicidad: 'Por 4 días en caso de dolor.',
        indicacionesAdicionales: 'Tomar con alimentos.'
      }
    ]
  },
  {
    id: 'kit-candidiasis',
    name: 'Candidiasis Vulvovaginal Aguda',
    category: 'Ginecología',
    description: 'Antimicótico oral sistémico + Óvulos vaginales',
    indications: 'Uso de ropa interior de algodón holgada, evitar duchas vaginales y jabones perfumados. Tratamiento en pareja si existen síntomas.',
    items: [
      {
        id: '1',
        producto: 'Fluconazol 150 mg Cápsula',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 1 cápsula',
        via: 'Oral',
        dosis: 'Tomar 1 cápsula dosis única',
        periodicidad: 'Dosis única.',
        indicacionesAdicionales: 'Tomar con agua.'
      },
      {
        id: '2',
        producto: 'Clotrimazol 200 mg Óvulos Vaginales',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 3 óvulos',
        via: 'Tópica',
        dosis: 'Aplicar 1 óvulo por vía vaginal profundo',
        periodicidad: 'Por 3 noches consecutivas al acostarse.',
        indicacionesAdicionales: 'Abstinencia sexual durante el tratamiento.'
      }
    ]
  },
  {
    id: 'kit-rinitis-alergica',
    name: 'Rinitis Alérgica / Crisis Estacional',
    category: 'Alergología / Neumología',
    description: 'Antihistamínico de segunda generación + Corticoide nasal',
    indications: 'Lavados nasales con solución salina estéril 2 veces al día. Evitar exposición a alérgenos conocidos, polvo y humo de tabaco.',
    items: [
      {
        id: '1',
        producto: 'Levocetirizina 5 mg Tabletas',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 caja con 10 tabletas',
        via: 'Oral',
        dosis: 'Tomar 1 tableta cada 24 horas',
        periodicidad: 'Por 10 a 14 días por la noche.',
        indicacionesAdicionales: 'No causa somnolencia significativa.'
      },
      {
        id: '2',
        producto: 'Furoato de Mometasona 50 mcg Suspensión Nasal',
        marcaInstitucional: 'GENÉRICO',
        cantidad: '1 frasco nebulizador',
        via: 'Nasal',
        dosis: 'Aplicar 1 a 2 disparos en cada fosa nasal',
        periodicidad: 'Cada 24 horas por 15 a 30 días.',
        indicacionesAdicionales: 'Dirigir el spray hacia la pared lateral de la fosa nasal.'
      }
    ]
  }
];

export function getCustomKits(clinicId?: string): PrescriptionKit[] {
  try {
    const key = `clinic_care_custom_kits_${clinicId || 'default'}_v2`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading custom kits', e);
  }
  return [];
}

export function saveCustomKit(kit: PrescriptionKit, clinicId?: string): PrescriptionKit[] {
  try {
    const key = `clinic_care_custom_kits_${clinicId || 'default'}_v2`;
    const current = getCustomKits(clinicId);
    const existingIndex = current.findIndex(k => k.id === kit.id);
    let next: PrescriptionKit[];
    if (existingIndex >= 0) {
      next = [...current];
      next[existingIndex] = kit;
    } else {
      next = [kit, ...current];
    }
    localStorage.setItem(key, JSON.stringify(next));
    return next;
  } catch (e) {
    console.error('Error saving custom kit', e);
    return [];
  }
}

export function deleteCustomKit(kitId: string, clinicId?: string): PrescriptionKit[] {
  try {
    const key = `clinic_care_custom_kits_${clinicId || 'default'}_v2`;
    const current = getCustomKits(clinicId);
    const next = current.filter(k => k.id !== kitId);
    localStorage.setItem(key, JSON.stringify(next));
    return next;
  } catch (e) {
    console.error('Error deleting custom kit', e);
    return [];
  }
}

// Catálogo enriquecido de Antecedentes Heredofamiliares (AHF) y Personales Patológicos (APP)
// Diseñado para agilizar la captura clínica conforme a NOM-004

export interface AntecedentCategory {
  category: string;
  items: string[];
}

export const HEREDOFAMILIARES_CATALOG: AntecedentCategory[] = [
  {
    category: 'Frecuentes / Generales',
    items: [
      'Interrogados y negados',
      'Sin antecedentes heredofamiliares de importancia',
      'Padre con Diabetes Mellitus Tipo 2 e Hipertensión Arterial',
      'Madre con Hipertensión Arterial Sistémica',
      'Padre con Diabetes Mellitus Tipo 2',
      'Madre con Diabetes Mellitus Tipo 2',
      'Padres vivos aparentemente sanos'
    ]
  },
  {
    category: 'Metabólicos & Cardiovasculares',
    items: [
      'Diabetes Mellitus Tipo 2 (Línea paterna)',
      'Diabetes Mellitus Tipo 2 (Línea materna)',
      'Hipertensión Arterial Sistémica (Línea paterna)',
      'Hipertensión Arterial Sistémica (Línea materna)',
      'Cardiopatía Isquémica / Infarto agudo al miocardio prematuro',
      'Enfermedad Vascular Cerebral (EVC / Embolia)',
      'Dislipidemia familiar (Hipercolesterolemia / Hipertrigliceridemia)',
      'Aterosclerosis prematura familiar'
    ]
  },
  {
    category: 'Oncológicos (Cáncer)',
    items: [
      'Cáncer de Mama (Madre / Hermana)',
      'Cáncer Cervicouterino',
      'Cáncer de Próstata (Padre / Abuelo)',
      'Cáncer de Colon y Recto / Gastrointestinal',
      'Cáncer Gástrico',
      'Cáncer de Pulmón',
      'Cáncer de Tiroides',
      'Leucemia / Linfoma',
      'Antecedente oncológico familiar de tipo no especificado'
    ]
  },
  {
    category: 'Renales & Urológicos',
    items: [
      'Enfermedad Renal Crónica / Nefropatía',
      'Poliquistosis Renal Autosómica',
      'Litiasis Renal Recurrente'
    ]
  },
  {
    category: 'Autoinmunes & Reumatológicos',
    items: [
      'Artritis Reumatoide',
      'Lupus Eritematoso Sistémico (LES)',
      'Psoriasis / Vitiligo',
      'Espondilitis Anquilosante'
    ]
  },
  {
    category: 'Respiratorios & Alergias',
    items: [
      'Asma bronquial',
      'Rinitis alérgica / Atopia familiar',
      'Enfermedad Pulmonar Obstructiva Crónica (EPOC)'
    ]
  },
  {
    category: 'Neurológicos & Psiquiátricos',
    items: [
      'Epilepsia / Crisis convulsivas',
      'Enfermedad de Alzheimer / Demencia senil',
      'Enfermedad de Parkinson',
      'Trastorno Depresivo Mayor / Ansiedad',
      'Trastorno Bipolar / Esquizofrenia'
    ]
  },
  {
    category: 'Tiroideos & Otros',
    items: [
      'Hipotiroidismo / Tiroiditis de Hashimoto',
      'Hipertiroidismo',
      'Glaucoma familiar',
      'Otros antecedentes familiares (especificar)'
    ]
  }
];

export const PERSONALES_PATOLOGICOS_CATALOG: AntecedentCategory[] = [
  {
    category: 'Generales / Negados',
    items: [
      'Interrogados y negados',
      'Sin antecedentes personales patológicos de importancia'
    ]
  },
  {
    category: 'Crónico-Degenerativas',
    items: [
      'Hipertensión Arterial Sistémica (HAS) en control',
      'Hipertensión Arterial Sistémica de reciente diagnóstico',
      'Diabetes Mellitus Tipo 2 (DM2) en control con hipoglucemiantes',
      'Diabetes Mellitus Tipo 2 con insulinoterapia',
      'Dislipidemia (Hipertrigliceridemia / Hipercolesterolemia) en tratamiento',
      'Hipotiroidismo en tratamiento con Levotiroxina',
      'Hiperuricemia / Gota',
      'Síndrome Metabólico / Obesidad'
    ]
  },
  {
    category: 'Cardiovasculares & Respiratorias',
    items: [
      'Cardiopatía Isquémica crónica / Angina de pecho',
      'Arritmia cardíaca / Fibrilación auricular',
      'Insuficiencia cardíaca congestiva en manejo',
      'Asma bronquial en control',
      'EPOC / Bronquitis crónica por tabaquismo',
      'Rinitis alérgica crónica',
      'Secuelas respiratorias post-COVID-19'
    ]
  },
  {
    category: 'Gastrointestinales & Hepáticas',
    items: [
      'Gastritis crónica / Enfermedad por Reflujo Gastroesofágico (ERGE)',
      'Síndrome de Intestino Irritable (Colitis crónica)',
      'Enfermedad por úlcera péptica previa',
      'Colelitiasis / Litiasis vesicular',
      'Hígado Graso (Esteatosis hepática)',
      'Hepatitis viral previa'
    ]
  },
  {
    category: 'Renales & Urológicas',
    items: [
      'Enfermedad Renal Crónica (Estadio inicial / moderado)',
      'Litiasis Renal (Cálculos renales previos)',
      'Infecciones de Vías Urinarias (IVU) recurrentes',
      'Hiperplasia Prostática Benigna (HPB)'
    ]
  },
  {
    category: 'Quirúrgicos (Cirugías Previas)',
    items: [
      'Apendicectomía previa sin complicaciones',
      'Colecistectomía laparoscópica previa',
      'Cesárea previa (1 evento)',
      'Cesárea previa (2 o más eventos)',
      'Histerectomía',
      'Salpingoclasia (OTB) / Vasectomía',
      'Hernioplastia inguinal / umbilical',
      'Cirugías traumatológicas / Osteosíntesis',
      'Amigdalectomía en la infancia'
    ]
  },
  {
    category: 'Traumáticos & Transfusionales',
    items: [
      'Fracturas previas tratadas y consolidadas',
      'Traumatismo craneoencefálico leve previo sin secuelas',
      'Transfusiones sanguíneas previas (Positivas sin reacción adversa)',
      'Transfusiones: Negadas'
    ]
  },
  {
    category: 'Alergias Medicamentosas & Sustancias',
    items: [
      'Alergia a Penicilinas / Betalactámicos',
      'Alergia a AINEs (Ketorolaco, Ácido Acetilsalicílico, Ibuprofeno)',
      'Alergia a Sulfas / Trimetoprima',
      'Alergia a Medios de Contraste',
      'Alergias medicamentosas: Negadas'
    ]
  },
  {
    category: 'Infecciosos, Neurológicos & Otros',
    items: [
      'COVID-19 previo (sin secuelas)',
      'Dengue previo',
      'Migraña crónica / Cefalea tensional recurrente',
      'Epilepsia en control',
      'Trastorno de Ansiedad / Depresión en tratamiento',
      'Otros antecedentes personales patológicos (especificar)'
    ]
  }
];

// Helper para obtener una lista plana de opciones más frecuentes para el quickFill
export const TOP_HEREDOFAMILIARES_QUICK_FILL = [
  'Interrogados y negados',
  'Padre con DM2 e HAS',
  'Madre con HAS',
  'Madre con DM2',
  'Cardiopatía isquémica familiar',
  'Cáncer de mama (Línea materna)',
  'Cáncer de próstata (Línea paterna)',
  'Enfermedad Renal Crónica familiar',
  'Asma / Alergias familiares',
  'Sin antecedentes de importancia'
];

export const TOP_PERSONALES_PATOLOGICOS_QUICK_FILL = [
  'Interrogados y negados',
  'Hipertensión Arterial Sistémica en control',
  'Diabetes Mellitus Tipo 2 en control',
  'Dislipidemia en tratamiento',
  'Hipotiroidismo en sustitución',
  'Gastritis crónica / ERGE',
  'Asma bronquial',
  'Apendicectomía previa',
  'Colecistectomía previa',
  'Cesárea previa',
  'Transfusionales negados',
  'Sin antecedentes de importancia'
];

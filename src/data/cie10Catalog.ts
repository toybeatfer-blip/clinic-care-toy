import { Cie10Item } from '../types';

export const CIE10_CATALOG: Cie10Item[] = [
  // Infecciones Respiratorias
  { code: 'J00X', name: 'Rinofaringitis aguda [resfriado común]', category: 'Respiratorio', frequent: true },
  { code: 'J02.9', name: 'Faringitis aguda, no especificada', category: 'Respiratorio', frequent: true },
  { code: 'J03.9', name: 'Amigdalitis aguda, no especificada', category: 'Respiratorio', frequent: true },
  { code: 'J01.9', name: 'Sinusitis aguda, no especificada', category: 'Respiratorio', frequent: true },
  { code: 'J20.9', name: 'Bronquitis aguda, no especificada', category: 'Respiratorio', frequent: true },
  { code: 'J04.0', name: 'Laringitis aguda', category: 'Respiratorio' },
  { code: 'J06.9', name: 'Infección aguda de las vías respiratorias superiores, no especificada', category: 'Respiratorio', frequent: true },
  { code: 'J45.9', name: 'Asma, no especificada', category: 'Respiratorio', frequent: true },
  { code: 'J30.4', name: 'Rinitis alérgica, no especificada', category: 'Respiratorio', frequent: true },
  { code: 'J18.9', name: 'Neumonía, no especificada', category: 'Respiratorio' },
  { code: 'J44.9', name: 'Enfermedad pulmonar obstructiva crónica, no especificada', category: 'Respiratorio' },

  // Gastrointestinal
  { code: 'K29.7', name: 'Gastritis, no especificada', category: 'Gastrointestinal', frequent: true },
  { code: 'K21.9', name: 'Enfermedad por reflujo gastroesofágico sin esofagitis', category: 'Gastrointestinal', frequent: true },
  { code: 'A09.X', name: 'Gastroenteritis y colitis de origen no especificado', category: 'Gastrointestinal', frequent: true },
  { code: 'A08.4', name: 'Infección intestinal viral, sin otra especificación', category: 'Gastrointestinal' },
  { code: 'K58.9', name: 'Síndrome del intestino irritable sin diarrea', category: 'Gastrointestinal', frequent: true },
  { code: 'K59.0', name: 'Constipación', category: 'Gastrointestinal', frequent: true },
  { code: 'K30.X', name: 'Dispepsia', category: 'Gastrointestinal', frequent: true },
  { code: 'K64.9', name: 'Hemorroides no especificadas', category: 'Gastrointestinal' },
  { code: 'K52.9', name: 'Gastroenteritis y colitis no infecciosas, no especificadas', category: 'Gastrointestinal' },
  { code: 'A06.0', name: 'Amibiasis intestinal aguda', category: 'Gastrointestinal' },

  // Cardiovascular y Metabólico
  { code: 'I10X', name: 'Hipertensión esencial (primaria)', category: 'Cardiovascular', frequent: true },
  { code: 'E11.9', name: 'Diabetes mellitus tipo 2 sin mención de complicación', category: 'Metabólico', frequent: true },
  { code: 'E78.5', name: 'Hiperlipidemia, no especificada (Dislipidemia mixta)', category: 'Metabólico', frequent: true },
  { code: 'E78.0', name: 'Hipercolesterolemia pura', category: 'Metabólico' },
  { code: 'E78.1', name: 'Hipertrigliceridemia pura', category: 'Metabólico' },
  { code: 'E66.0', name: 'Obesidad debida a exceso de calorías', category: 'Metabólico', frequent: true },
  { code: 'E66.9', name: 'Obesidad, no especificada', category: 'Metabólico', frequent: true },
  { code: 'E79.0', name: 'Hiperuricemia sin signos de artritis inflamatoria ni enfermedad tofácea', category: 'Metabólico' },
  { code: 'I83.9', name: 'Venas varicosas de los miembros inferiores sin úlcera ni inflamación', category: 'Cardiovascular' },

  // Genitourinario
  { code: 'N39.0', name: 'Infección de vías urinarias, sitio no especificado', category: 'Genitourinario', frequent: true },
  { code: 'N30.0', name: 'Cistitis aguda', category: 'Genitourinario', frequent: true },
  { code: 'N76.0', name: 'Vaginitis aguda', category: 'Genitourinario', frequent: true },
  { code: 'N94.6', name: 'Dismenorrea, no especificada', category: 'Genitourinario' },
  { code: 'N40.X', name: 'Hiperplasia de la próstata', category: 'Genitourinario' },
  { code: 'N23.X', name: 'Cólico renal, no especificado', category: 'Genitourinario' },

  // Músculo esquelético y Dolor
  { code: 'M54.5', name: 'Lumbago no especificado (Lumbalgia)', category: 'Osteomuscular', frequent: true },
  { code: 'M54.2', name: 'Cervicalgia', category: 'Osteomuscular', frequent: true },
  { code: 'M79.1', name: 'Mialgia', category: 'Osteomuscular', frequent: true },
  { code: 'M25.5', name: 'Dolor articular', category: 'Osteomuscular', frequent: true },
  { code: 'M19.9', name: 'Osteoartrosis, no especificada', category: 'Osteomuscular' },
  { code: 'S93.4', name: 'Esguince y torcedura del tobillo', category: 'Osteomuscular', frequent: true },
  { code: 'M54.4', name: 'Lumbago con ciática', category: 'Osteomuscular' },

  // Dermatología
  { code: 'L20.9', name: 'Dermatitis atópica, no especificada', category: 'Dermatología', frequent: true },
  { code: 'L23.9', name: 'Dermatitis alérgica de contacto, causa no especificada', category: 'Dermatología', frequent: true },
  { code: 'L50.9', name: 'Urticaria, no especificada', category: 'Dermatología', frequent: true },
  { code: 'B35.9', name: 'Dermatofitosis, no especificada (Micosis cutánea)', category: 'Dermatología', frequent: true },
  { code: 'L70.0', name: 'Acné vulgar', category: 'Dermatología' },
  { code: 'L08.9', name: 'Infección local de la piel y del tejido subcutáneo, no especificada', category: 'Dermatología' },
  { code: 'L03.9', name: 'Celulitis, sitio no especificado', category: 'Dermatología' },
  { code: 'B37.0', name: 'Estomatitis candidiásica', category: 'Dermatología' },

  // Sistema Nervioso / Cefaleas
  { code: 'G43.9', name: 'Migraña, no especificada', category: 'Neurológico', frequent: true },
  { code: 'G44.2', name: 'Cefalea debida a tensión', category: 'Neurológico', frequent: true },
  { code: 'R51.X', name: 'Cefalea', category: 'Neurológico', frequent: true },
  { code: 'H81.1', name: 'Vértigo paroxístico benigno', category: 'Neurológico' },
  { code: 'F41.9', name: 'Trastorno de ansiedad, no especificado', category: 'Salud Mental', frequent: true },
  { code: 'F41.2', name: 'Trastorno mixto de ansiedad y depresión', category: 'Salud Mental' },
  { code: 'G47.0', name: 'Trastornos del inicio y del mantenimiento del sueño [insomnios]', category: 'Neurológico' },

  // Ojos y Oídos
  { code: 'H10.9', name: 'Conjuntivitis, no especificada', category: 'Oftalmología / Otorrino', frequent: true },
  { code: 'H60.9', name: 'Otitis externa, sin otra especificación', category: 'Oftalmología / Otorrino', frequent: true },
  { code: 'H66.9', name: 'Otitis media, no especificada', category: 'Oftalmología / Otorrino', frequent: true },
  { code: 'H61.2', name: 'Cerumen impactado (Tapón de cerumen)', category: 'Oftalmología / Otorrino', frequent: true },

  // Chequeo / Control / Preventivo
  { code: 'Z00.0', name: 'Examen médico general (Chequeo general / Rutina)', category: 'Preventivo / Control', frequent: true },
  { code: 'Z01.4', name: 'Examen ginecológico (general) (de rutina)', category: 'Preventivo / Control' },
  { code: 'Z02.1', name: 'Examen médico para el ingreso al empleo (Certificado médico)', category: 'Preventivo / Control', frequent: true },
  { code: 'Z02.8', name: 'Otros exámenes para fines administrativos (Certificado escolar)', category: 'Preventivo / Control', frequent: true },
  { code: 'Z71.3', name: 'Consulta para instrucción y vigilancia de la dieta (Control nutricional)', category: 'Preventivo / Control', frequent: true },
  { code: 'Z76.0', name: 'Emisión de receta de repetición', category: 'Preventivo / Control' },

  // Heridas y Traumatismos Menores
  { code: 'T14.0', name: 'Traumatismo superficial de región no especificada del cuerpo', category: 'Traumatología', frequent: true },
  { code: 'T14.1', name: 'Herida de región no especificada del cuerpo', category: 'Traumatología', frequent: true },
  { code: 'T29.0', name: 'Quemaduras de múltiples regiones, grado no especificado', category: 'Traumatología' },
  { code: 'T30.0', name: 'Quemadura de región del cuerpo no especificada, grado no especificado', category: 'Traumatología' }
];

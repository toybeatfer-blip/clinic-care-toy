import { InstitutionalMed } from '../types';

export const MEDICATION_CATALOG: InstitutionalMed[] = [
  // Analgésicos y Antiinflamatorios (FABE / ALMUS)
  {
    name: 'Paracetamol 500 mg Tabletas (FABE)',
    substance: 'Paracetamol',
    brand: 'FABE',
    presentation: 'Caja con 20 tabletas de 500 mg',
    category: 'Analgésico / Antipirético',
    defaultDose: 'Tomar 1 tableta cada 8 horas por 3 a 5 días en caso de dolor o fiebre.'
  },
  {
    name: 'Paracetamol 750 mg Tabletas (ALMUS)',
    substance: 'Paracetamol',
    brand: 'ALMUS',
    presentation: 'Caja con 10 tabletas de 750 mg',
    category: 'Analgésico / Antipirético',
    defaultDose: 'Tomar 1 tableta cada 8 horas por 3 a 5 días.'
  },
  {
    name: 'Ibuprofeno 400 mg Grageas (FABE)',
    substance: 'Ibuprofeno',
    brand: 'FABE',
    presentation: 'Caja con 10 grageas de 400 mg',
    category: 'AINE / Antiinflamatorio',
    defaultDose: 'Tomar 1 gragea cada 8 horas después de los alimentos por 5 días.'
  },
  {
    name: 'Ibuprofeno 600 mg Tabletas (ALMUS)',
    substance: 'Ibuprofeno',
    brand: 'ALMUS',
    presentation: 'Caja con 10 tabletas de 600 mg',
    category: 'AINE / Antiinflamatorio',
    defaultDose: 'Tomar 1 tableta cada 12 horas con alimentos por 5 días.'
  },
  {
    name: 'Ketorolaco 10 mg Tabletas Sublinguales (FABE)',
    substance: 'Ketorolaco trometamina',
    brand: 'FABE',
    presentation: 'Caja con 4 tabletas sublinguales de 10 mg',
    category: 'AINE / Analgésico Potente',
    defaultDose: 'Disolver 1 tableta debajo de la lengua cada 8 horas por máximo 4 días.'
  },
  {
    name: 'Ketorolaco / Trometamina 30 mg/1ml Solución Inyectable (ALMUS)',
    substance: 'Ketorolaco trometamina',
    brand: 'ALMUS',
    presentation: 'Caja con 3 ampolletas de 30 mg / 1 ml',
    category: 'AINE / Inyectable',
    defaultDose: 'Aplicar 1 ampolleta vía intramuscular profunda en dosis única o cada 12 horas por 2 días.'
  },
  {
    name: 'Naproxeno / Paracetamol 275 mg / 300 mg Tabletas (FABE)',
    substance: 'Naproxeno sódico / Paracetamol',
    brand: 'FABE',
    presentation: 'Caja con 16 tabletas',
    category: 'Analgésico / Antiinflamatorio',
    defaultDose: 'Tomar 1 tableta cada 8 horas con alimentos por 5 días.'
  },
  {
    name: 'Diclofenaco 100 mg Cápsulas de Liberación Prolongada (ALMUS)',
    substance: 'Diclofenaco sódico',
    brand: 'ALMUS',
    presentation: 'Caja con 20 cápsulas de 100 mg',
    category: 'AINE',
    defaultDose: 'Tomar 1 cápsula cada 24 horas después de la comida por 5 a 7 días.'
  },
  {
    name: 'Metamizol Sódico 500 mg Tabletas (FABE)',
    substance: 'Metamizol sódico (Dipirona)',
    brand: 'FABE',
    presentation: 'Caja con 10 tabletas de 500 mg',
    category: 'Antipirético / Analgésico',
    defaultDose: 'Tomar 1 tableta cada 8 horas en caso de fiebre o dolor moderado.'
  },

  // Antibióticos (FABE / ALMUS)
  {
    name: 'Amoxicilina 500 mg Cápsulas (FABE)',
    substance: 'Amoxicilina trihidratada',
    brand: 'FABE',
    presentation: 'Caja con 12 cápsulas de 500 mg',
    category: 'Antibiótico / Penicilinas',
    defaultDose: 'Tomar 1 cápsula cada 8 horas por 7 días continuos.'
  },
  {
    name: 'Amoxicilina / Ácido Clavulánico 500 mg / 125 mg Tabletas (ALMUS)',
    substance: 'Amoxicilina / Clavulanato',
    brand: 'ALMUS',
    presentation: 'Caja con 10 tabletas recubiertas',
    category: 'Antibiótico / Betalactámico + Inhibidor',
    defaultDose: 'Tomar 1 tableta cada 8 horas al inicio de las comidas por 7 a 10 días.'
  },
  {
    name: 'Amoxicilina / Ácido Clavulánico 875 mg / 125 mg Tabletas (FABE)',
    substance: 'Amoxicilina / Clavulanato',
    brand: 'FABE',
    presentation: 'Caja con 14 tabletas',
    category: 'Antibiótico / Betalactámico + Inhibidor',
    defaultDose: 'Tomar 1 tableta cada 12 horas con alimentos por 7 días.'
  },
  {
    name: 'Azitromicina 500 mg Tabletas (ALMUS)',
    substance: 'Azitromicina dihidratada',
    brand: 'ALMUS',
    presentation: 'Caja con 3 tabletas de 500 mg',
    category: 'Antibiótico / Macrólido',
    defaultDose: 'Tomar 1 tableta cada 24 horas 1 hora antes de los alimentos por 3 días.'
  },
  {
    name: 'Ciprofloxacino 500 mg Tabletas (FABE)',
    substance: 'Ciprofloxacino clorhidrato',
    brand: 'FABE',
    presentation: 'Caja con 8 tabletas de 500 mg',
    category: 'Antibiótico / Fluoroquinolona',
    defaultDose: 'Tomar 1 tableta cada 12 horas con abundante agua por 5 a 7 días.'
  },
  {
    name: 'Ceftriaxona 1 g Solución Inyectable IM (ALMUS)',
    substance: 'Ceftriaxona sódica',
    brand: 'ALMUS',
    presentation: 'Frasco ámpula con 1 g y ampolleta con diluyente con lidocaína 3.5 ml',
    category: 'Antibiótico / Cefalosporina',
    defaultDose: 'Aplicar 1 frasco ámpula vía intramuscular profunda cada 24 horas por 3 días.'
  },
  {
    name: 'Trimetoprima / Sulfametoxazol 160 mg / 800 mg Tabletas (FABE)',
    substance: 'Trimetoprima / Sulfametoxazol',
    brand: 'FABE',
    presentation: 'Caja con 14 tabletas',
    category: 'Antibiótico / Sulfamidas',
    defaultDose: 'Tomar 1 tableta cada 12 horas después de los alimentos por 7 días.'
  },
  {
    name: 'Nitrofurantoína 100 mg Cápsulas (ALMUS)',
    substance: 'Nitrofurantoína macrocristales',
    brand: 'ALMUS',
    presentation: 'Caja con 40 cápsulas de 100 mg',
    category: 'Antiséptico Urinario',
    defaultDose: 'Tomar 1 cápsula cada 6 horas con alimentos por 7 días.'
  },

  // Gastrointestinales (FABE / ALMUS)
  {
    name: 'Omeprazol 20 mg Cápsulas (FABE)',
    substance: 'Omeprazol',
    brand: 'FABE',
    presentation: 'Frasco con 30 cápsulas de 20 mg',
    category: 'Gastrointestinal / IBP',
    defaultDose: 'Tomar 1 cápsula en ayunas 30 minutos antes del desayuno por 14 a 28 días.'
  },
  {
    name: 'Pantoprazol 40 mg Grageas (ALMUS)',
    substance: 'Pantoprazol sódico',
    brand: 'ALMUS',
    presentation: 'Caja con 14 grageas de 40 mg',
    category: 'Gastrointestinal / IBP',
    defaultDose: 'Tomar 1 gragea en ayunas por las mañanas por 14 días.'
  },
  {
    name: 'Butilhioscina 10 mg Grageas (FABE)',
    substance: 'Butilhioscina (Bromuro de Hioscina)',
    brand: 'FABE',
    presentation: 'Caja con 10 grageas de 10 mg',
    category: 'Antiespasmódico',
    defaultDose: 'Tomar 1 gragea cada 8 horas en caso de cólico o dolor abdominal.'
  },
  {
    name: 'Metoclopramida 10 mg Tabletas (ALMUS)',
    substance: 'Metoclopramida clorhidrato',
    brand: 'ALMUS',
    presentation: 'Caja con 20 tabletas de 10 mg',
    category: 'Procinético / Antiemético',
    defaultDose: 'Tomar 1 tableta 15 minutos antes de los alimentos cada 8 horas por 3 días.'
  },
  {
    name: 'Difenidol 25 mg Tabletas (FABE)',
    substance: 'Difenidol clorhidrato',
    brand: 'FABE',
    presentation: 'Caja con 30 tabletas de 25 mg',
    category: 'Antivertiginoso / Antiemético',
    defaultDose: 'Tomar 1 tableta cada 8 horas en caso de náusea, vómito o mareo.'
  },
  {
    name: 'Loperamida 2 mg Tabletas (ALMUS)',
    substance: 'Loperamida clorhidrato',
    brand: 'ALMUS',
    presentation: 'Caja con 12 tabletas de 2 mg',
    category: 'Antidiarreico',
    defaultDose: 'Tomar 2 tabletas como dosis inicial y después 1 tableta tras cada evacuación líquida (máximo 4 al día).'
  },
  {
    name: 'Gel Hidróxido de Aluminio y Magnesio con Dimeticona (FABE)',
    substance: 'Aluminio / Magnesio / Dimeticona',
    brand: 'FABE',
    presentation: 'Frasco con suspensión 240 ml',
    category: 'Antiácido',
    defaultDose: 'Tomar 1 cucharada (10 ml) 1 hora después de las comidas y antes de acostarse.'
  },

  // Antihistamínicos y Respiratorios (FABE / ALMUS)
  {
    name: 'Loratadina 10 mg Tabletas (FABE)',
    substance: 'Loratadina',
    brand: 'FABE',
    presentation: 'Caja con 10 tabletas de 10 mg',
    category: 'Antihistamínico',
    defaultDose: 'Tomar 1 tableta cada 24 horas por la noche por 7 días.'
  },
  {
    name: 'Cetirizina 10 mg Tabletas (ALMUS)',
    substance: 'Cetirizina diclorhidrato',
    brand: 'ALMUS',
    presentation: 'Caja con 10 tabletas de 10 mg',
    category: 'Antihistamínico',
    defaultDose: 'Tomar 1 tableta cada 24 horas por las noches por 7 a 10 días.'
  },
  {
    name: 'Clorfenamina Compuesta Tabletas (FABE)',
    substance: 'Paracetamol / Cafeína / Fenilefrina / Clorfenamina',
    brand: 'FABE',
    presentation: 'Caja con 10 tabletas antigripales',
    category: 'Antigripal',
    defaultDose: 'Tomar 1 tableta cada 8 horas por 3 a 5 días.'
  },
  {
    name: 'Ambroxol 30 mg / 5 ml Jarabe Adulto (FABE)',
    substance: 'Ambroxol clorhidrato',
    brand: 'FABE',
    presentation: 'Frasco con jarabe 120 ml',
    category: 'Mucolítico / Expectorante',
    defaultDose: 'Tomar 1 cucharada (10 ml) cada 8 horas después de los alimentos por 5 días.'
  },
  {
    name: 'Dextrometorfano / Ambroxol Jarabe (ALMUS)',
    substance: 'Dextrometorfano / Ambroxol',
    brand: 'ALMUS',
    presentation: 'Frasco con jarabe 150 ml con vaso dosificador',
    category: 'Antitusígeno y Mucolítico',
    defaultDose: 'Tomar 10 ml cada 8 horas por 5 días.'
  },

  // Crónico Degenerativos (Cardio / Diabetes / Lípidos)
  {
    name: 'Losartán 50 mg Tabletas (FABE)',
    substance: 'Losartán potásico',
    brand: 'FABE',
    presentation: 'Caja con 30 tabletas de 50 mg',
    category: 'Antihipertensivo / ARA-II',
    defaultDose: 'Tomar 1 tableta cada 24 horas por la mañana de forma continua.'
  },
  {
    name: 'Telmisartán 40 mg Tabletas (ALMUS)',
    substance: 'Telmisartán',
    brand: 'ALMUS',
    presentation: 'Caja con 30 tabletas de 40 mg',
    category: 'Antihipertensivo / ARA-II',
    defaultDose: 'Tomar 1 tableta cada 24 horas por la mañana.'
  },
  {
    name: 'Amlodipino 5 mg Tabletas (FABE)',
    substance: 'Amlodipino besilato',
    brand: 'FABE',
    presentation: 'Caja con 30 tabletas de 5 mg',
    category: 'Antihipertensivo / Calcioantagonista',
    defaultDose: 'Tomar 1 tableta cada 24 horas.'
  },
  {
    name: 'Metformina 850 mg Tabletas (ALMUS)',
    substance: 'Metformina clorhidrato',
    brand: 'ALMUS',
    presentation: 'Caja con 30 tabletas de 850 mg',
    category: 'Hipoglucemiante Oral',
    defaultDose: 'Tomar 1 tableta con el desayuno de forma diaria.'
  },
  {
    name: 'Atorvastatina 20 mg Tabletas (FABE)',
    substance: 'Atorvastatina cálcica',
    brand: 'FABE',
    presentation: 'Caja con 30 tabletas de 20 mg',
    category: 'Hipolipemiante / Estatina',
    defaultDose: 'Tomar 1 tableta por la noche antes de dormir por 30 días.'
  },

  // Medicamentos de Control de Peso (Requiere IMC > 25)
  {
    name: 'Fentermina 15 mg / 30 mg Cápsulas (Controlado)',
    substance: 'Fentermina clorhidrato',
    brand: 'GENÉRICO',
    presentation: 'Caja con 30 cápsulas',
    category: 'Control de Peso / Anorexigénico',
    isControlledWeight: true,
    defaultDose: 'Tomar 1 cápsula 30 minutos antes del desayuno por 30 días. (Solo si IMC > 25 kg/m²).'
  },
  {
    name: 'Mazindol 1 mg / 2 mg Tabletas (Controlado)',
    substance: 'Mazindol',
    brand: 'GENÉRICO',
    presentation: 'Caja con 30 tabletas',
    category: 'Control de Peso / Anorexigénico',
    isControlledWeight: true,
    defaultDose: 'Tomar 1 tableta 1 hora antes del desayuno. (Solo si IMC > 25 kg/m²).'
  },
  {
    name: 'Orlistat 120 mg Cápsulas (ALMUS)',
    substance: 'Orlistat',
    brand: 'ALMUS',
    presentation: 'Caja con 30 cápsulas de 120 mg',
    category: 'Control de Peso / Inhibidor lipasa',
    isControlledWeight: true,
    defaultDose: 'Tomar 1 cápsula con la comida principal o hasta 1 hora después.'
  }
];

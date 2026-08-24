export interface OperationalTopic {
  id: string;
  title: string;
  category: 'Acceso y Contraseñas' | 'Asistencia y Turnos' | 'Gestión de Tickets' | 'Auditoría NOM-004';
  summary: string;
  steps: string[];
  tips?: string[];
  alert?: string;
}

export const SAC_OPERATIONAL_GUIDES: OperationalTopic[] = [
  {
    id: 'passwords',
    title: 'Accesos y Contraseñas Oficiales',
    category: 'Acceso y Contraseñas',
    summary: 'Estructura de credenciales para Windows de consultorio y SAC.',
    steps: [
      'Usuario SAC: Corresponde al número de empleado asignado.',
      'Contraseña SAC Inicial Universal: Umeb123# ó Umeb123$',
      'Contraseña Windows Consultorio: Formato X[Primeros 3 dígitos].[Últimos 3 dígitos] (Ejemplo: Para 140468 -> X140.468).',
      'No abrir sesiones simultáneas del SAC para evitar bloqueos de base de datos.',
      'Reiniciar el equipo de cómputo al inicio de turno y limpiar archivos temporales de Internet Explorer/Edge regularmente.'
    ],
    tips: [
      'Usa el generador interactivo de contraseñas de Windows en la barra superior.',
      'Si el usuario se bloquea, contactar inmediatamente a soporte HELIX.'
    ]
  },
  {
    id: 'attendance',
    title: 'Registro de Asistencia y Biométrico ADS',
    category: 'Asistencia y Turnos',
    summary: 'Reglas de checado de entrada, recesos y salidas de consultorio.',
    steps: [
      '1er Registro Obligatorio: En farmacia mediante biométrico ADS antes de subir a consultorio.',
      'Entrada SAC: El primer inicio de sesión en el sistema SAC marca la hora de entrada automática.',
      'Turno Corrido: Registrar únicamente Salida al concluir la jornada.',
      'Turno Mixto: Registrar obligatoriamente Receso Inicio, Receso Fin y Salida.',
      'Tolerancia Oficial: 15 minutos en los registros.',
      'Cada registro de receso o salida en SAC requiere ingresar nuevamente el password.'
    ],
    alert: 'Omitir el checado biométrico en farmacia o no registrar recesos en turno mixto genera incidencias administrativas automáticas.'
  },
  {
    id: 'ticket-management',
    title: 'Gestión de Tickets y Contingencia HELIX',
    category: 'Gestión de Tickets',
    summary: 'Procedimiento obligatorio para asociar cada consulta o procedimiento a un cobro.',
    steps: [
      'Todo servicio brindado debe enlazarse a un ticket de pago emitido por caja/farmacia.',
      'Si el ticket no aparece en el sistema SAC:',
      '1. Seleccionar la casilla "Sin Ticket".',
      '2. Elegir el motivo: "Promoción" o "No aparece el ticket".',
      '3. Anotar el número de folio físico del ticket en el campo "Comentario".',
      '4. Levantar reporte de sincronización en plataforma HELIX con el folio físico y número de empleado.'
    ],
    tips: [
      'Nunca dejes un servicio sin asentar el folio físico en el comentario si seleccionas "Sin Ticket".',
      'Verifica que el número de ticket coincida con el servicio exacto (consulta general vs procedimiento).'
    ]
  },
  {
    id: 'nom004-audit',
    title: 'Reglas Críticas de Auditoría Médica (NOM-004)',
    category: 'Auditoría NOM-004',
    summary: 'Lineamientos de estricto cumplimiento para evitar no conformidades en auditorías internas y COFEPRIS.',
    steps: [
      'Búsqueda Previa: Buscar por Nombre Completo y Año de Nacimiento antes del alta para evitar duplicidad nacional.',
      'Cero Abreviaturas: Prohibido abreviar nombres, calles, municipios o diagnósticos.',
      'Prohibición de Siglas: Cero "NP", "SDP", "NA", "S/S", "Tx", "Dx". Usar "Sin datos patológicos", "Normal", "Diferido".',
      'Interrogatorio: Finalizar obligatoriamente con "...resto del interrogatorio negado."',
      'Exploración Ginecológica y Urológica: Asentar siempre "Diferido" o "No explorado".',
      'Somatometría: Talla siempre en metros con punto decimal (ej. 1.70 m, nunca 170 cm). T/A pediátrica asentar "PEDIÁTRICO", "INFANTE" o "MENOR".',
      'Diagnósticos: Código CIE-10 exacto y descripción oficial.',
      'Prescripción: Priorizar genéricos y marcas institucionales (ALMUS). En control de peso, medicamento controlado SOLO si IMC > 25 kg/m².',
      'Procedimientos: En inyección IM detallar sustancia, presentación y dosis exacta. Obligatorio firma de testigo o leyenda de no contar con segundo testigo.'
    ]
  }
];

export function generateWindowsPassword(inputNumber: string): string {
  const clean = inputNumber.replace(/\D/g, '');
  if (clean.length < 6) return '';
  const first3 = clean.substring(0, 3);
  const last3 = clean.substring(clean.length - 3);
  return `X${first3}.${last3}`;
}

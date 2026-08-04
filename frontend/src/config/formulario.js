export const STEPS = [
  { id: 1, title: 'Datos Generales' },
  { id: 2, title: 'Producción' },
  { id: 3, title: 'Métricas ESG' },
  { id: 4, title: 'Impacto Social' },
  { id: 5, title: 'Capacitación y Rotación' },
  { id: 6, title: 'Revisión' }
];

export const BACKGROUNDS = {
  1: '/bg-tunel.jpg',
  2: '/bg-produccion.jpg',
  3: '/bg-esg.jpg',
  4: '/bg-social.jpg',
  5: '/bg-capacitacion.jpg',
  6: '/bg-revision.jpg'
};

export const METALS = [
  { key: 'oro', label: 'Oro', unit: 'oz' },
  { key: 'plata', label: 'Plata', unit: 'oz' },
  { key: 'cobre', label: 'Cobre', unit: 't' },
  { key: 'plomo', label: 'Plomo', unit: 't' },
  { key: 'zinc', label: 'Zinc', unit: 't' },
];

export const UNIT_MAP = {
  oro: ' oz', plata: ' oz', cobre: ' t', plomo: ' t', zinc: ' t',
  incidentes: ' casos', cumplimiento: '%', 'agua-reciclada': '%', 'reduccion-gei': '%',
  reforestacion: ' árboles', inversion: ' mdd',
};

export const YEARS_ESG = ['2023', '2024', '2025', '2026'];
export const ESG_METRICS = [
  { id: 'incidentes', label: 'Incidentes Ambientales', fullTitle: 'Número de incidentes ambientales notificables.', unit: 'Casos' },
  { id: 'cumplimiento', label: 'Cumplimiento Normativo', fullTitle: 'Porcentaje de cumplimiento de regulaciones ambientales.', unit: '%' },
  { id: 'agua-reciclada', label: 'Agua Reciclada', fullTitle: 'Porcentaje de uso de agua reciclada.', unit: '%' },
  { id: 'reduccion-gei', label: 'Reducción GEI', fullTitle: 'Porcentaje de reducción de emisiones de Gases de Efecto Invernadero (GEI).', unit: '%' },
  { id: 'reforestacion', label: 'Reforestación', fullTitle: 'Número de árboles sembrados en campañas de reforestación.', unit: 'Árboles' },
  { id: 'inversion', label: 'Inversión Ambiental', fullTitle: 'Monto de inversión de acciones vinculadas al medio ambiente.', unit: 'Millones de dólares' }
];

export const YEARS_SOCIAL = ['2023', '2024', '2025', '2026'];
export const SOCIAL_CATEGORIES = [
  { id: 'empresa', label: 'Empresa', desc: 'Personal contratado directamente por la unidad minera.' },
  { id: 'contratistas', label: 'Contratistas', desc: 'Personal subcontratado prestando servicios en la unidad.' },
  { id: 'comunidades', label: 'Comunidades', desc: 'Empleos generados para habitantes de comunidades locales.' },
  { id: 'guerrero', label: 'Guerrero', desc: 'Empleos generados para habitantes del Estado de Guerrero.' }
];

export const YEARS_CAPACITACION = ['2023', '2024', '2025', '2026'];
export const YEARS_ROTACION = ['2023', '2024', '2025'];
export const CAPACITACION_TABS = [
  { id: 'capacitacion', label: 'Capacitación en Seguridad', desc: 'Registro de horas o personal capacitado en materia de seguridad.' },
  { id: 'rotacion', label: 'Tasa de Rotación de Personal', desc: 'Porcentajes o métricas de rotación general y por género.' }
];

export const ESG_DEFAULTS = Object.fromEntries(
  ESG_METRICS.map(m => [
    m.id,
    Object.fromEntries([...YEARS_ESG.map(y => [y, '']), ['comentarios', '']])
  ])
);

export const SOCIAL_DEFAULTS = Object.fromEntries(
  SOCIAL_CATEGORIES.map(cat => [
    cat.id,
    Object.fromEntries(YEARS_SOCIAL.map(y => [y, { mujeres: '', hombres: '' }]))
  ])
);

export const CAPACITACION_DEFAULTS = {
  capacitacion: Object.fromEntries(YEARS_CAPACITACION.map(y => [y, { mujeres: '', hombres: '' }])),
  rotacion: Object.fromEntries(YEARS_ROTACION.map(y => [y, { total: '', mujeres: '', hombres: '' }]))
};

export const HELP_TEXTS = {
  empresaMatriz: 'Nombre del grupo corporativo o en su caso, nombre de la empresa cuando no haya matriz.',
  subsidiaria: 'Razón social o nombre legal de la empresa subsidiaria.',
  unidadMinera: 'Nombre oficial de la Unidad Minera.',
  tipoMinado: 'Método de extracción principal utilizado en la operación minera.',
  fechaInicio: 'Fecha en que iniciaron oficialmente las operaciones de la unidad.',
  vidaUtil: 'Estimación de la vida útil restante de la mina, expresada en años.',
  capacidad: 'Capacidad instalada de procesamiento de mineral en toneladas por día.',
  oro: 'Volumen de oro producido en onzas troy (oz).',
  plata: 'Volumen de plata producido en onzas troy (oz).',
  cobre: 'Volumen de cobre producido en toneladas (t).',
  plomo: 'Volumen de plomo producido en toneladas (t).',
  zinc: 'Volumen de zinc producido en toneladas (t).',
  'incidentes': 'Reporte de eventos que causaron impacto ambiental y debieron notificarse a las autoridades.',
  'cumplimiento': 'Porcentaje general de acatamiento a las normas ambientales vigentes.',
  'agua-reciclada': 'Proporción de agua reutilizada respecto al consumo total hídrico.',
  'reduccion-gei': 'Disminución porcentual de emisiones de gases de efecto invernadero respecto al año base.',
  'reforestacion': 'Conteo total de especies arbóreas plantadas con fines de restauración ecológica.',
  'inversion': 'Capital total destinado a proyectos, mitigación y mejoras ambientales en millones de USD.'
};

const PORCENTAJE_ESG = new Set(['cumplimiento', 'agua-reciclada', 'reduccion-gei']);

export function esPorcentajeESG(metricId) {
  return PORCENTAJE_ESG.has(metricId);
}

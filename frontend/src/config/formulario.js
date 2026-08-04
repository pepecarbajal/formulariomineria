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

import { METALES, YEARS_ESG, YEARS_SOCIAL, YEARS_CAPACITACION, YEARS_ROTACION, ESG_METRICS, SOCIAL_CATEGORIES } from '../../../shared/catalogo.js';
export { METALES as METALS, YEARS_ESG, YEARS_SOCIAL, YEARS_CAPACITACION, YEARS_ROTACION, ESG_METRICS, SOCIAL_CATEGORIES };

export const UNIT_MAP = {
  oro: ' oz', plata: ' oz', cobre: ' t', plomo: ' t', zinc: ' t',
  incidentes: ' casos', cumplimiento: '%', 'agua-reciclada': '%', 'reduccion-gei': '%',
  reforestacion: ' árboles', inversion: ' mdd',
};

export const PAISES = [
  'Afganistán', 'Albania', 'Alemania', 'Andorra', 'Angola', 'Antigua y Barbuda', 'Arabia Saudita', 'Argelia',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaiyán', 'Bahamas', 'Bangladés', 'Barbados', 'Baréin',
  'Bélgica', 'Belice', 'Benín', 'Bielorrusia', 'Birmania (Myanmar)', 'Bolivia', 'Bosnia y Herzegovina',
  'Botsuana', 'Brasil', 'Brunéi', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Bután', 'Cabo Verde', 'Camboya',
  'Camerún', 'Canadá', 'Catar', 'Chad', 'Chile', 'China', 'Chipre', 'Colombia', 'Comoras', 'Congo (Brazzaville)',
  'Congo (Kinsasa)', 'Corea del Norte', 'Corea del Sur', 'Costa de Marfil', 'Costa Rica', 'Croacia', 'Cuba',
  'Dinamarca', 'Dominica', 'Ecuador', 'Egipto', 'El Salvador', 'Emiratos Árabes Unidos', 'Eritrea', 'Eslovaquia',
  'Eslovenia', 'España', 'Estados Unidos', 'Estonia', 'Esuatini', 'Etiopía', 'Filipinas', 'Finlandia', 'Fiyi',
  'Francia', 'Gabón', 'Gambia', 'Georgia', 'Ghana', 'Granada', 'Grecia', 'Guatemala', 'Guinea',
  'Guinea Ecuatorial', 'Guinea-Bisáu', 'Guyana', 'Haití', 'Honduras', 'Hungría', 'India', 'Indonesia', 'Irak',
  'Irán', 'Irlanda', 'Islandia', 'Islas Marshall', 'Islas Salomón', 'Israel', 'Italia', 'Jamaica', 'Japón',
  'Jordania', 'Kazajistán', 'Kenia', 'Kirguistán', 'Kiribati', 'Kuwait', 'Laos', 'Lesoto', 'Letonia', 'Líbano',
  'Liberia', 'Libia', 'Liechtenstein', 'Lituania', 'Luxemburgo', 'Madagascar', 'Malasia', 'Malaui', 'Maldivas',
  'Malí', 'Malta', 'Marruecos', 'Mauricio', 'Mauritania', 'México', 'Micronesia', 'Moldavia', 'Mónaco',
  'Mongolia', 'Montenegro', 'Mozambique', 'Namibia', 'Nauru', 'Nepal', 'Nicaragua', 'Níger', 'Nigeria',
  'Noruega', 'Nueva Zelanda', 'Omán', 'Países Bajos', 'Pakistán', 'Palaos', 'Panamá', 'Papúa Nueva Guinea',
  'Paraguay', 'Perú', 'Polonia', 'Portugal', 'Reino Unido', 'República Centroafricana', 'República Checa',
  'República Dominicana', 'Ruanda', 'Rumania', 'Rusia', 'Samoa', 'San Cristóbal y Nieves', 'San Marino',
  'San Vicente y las Granadinas', 'Santa Lucía', 'Santo Tomé y Príncipe', 'Senegal', 'Serbia', 'Seychelles',
  'Sierra Leona', 'Singapur', 'Siria', 'Somalia', 'Sri Lanka', 'Sudáfrica', 'Sudán', 'Sudán del Sur', 'Suecia',
  'Suiza', 'Surinam', 'Tailandia', 'Tanzania', 'Tayikistán', 'Timor Oriental', 'Togo', 'Tonga',
  'Trinidad y Tobago', 'Túnez', 'Turkmenistán', 'Turquía', 'Tuvalu', 'Ucrania', 'Uganda', 'Uruguay',
  'Uzbekistán', 'Vanuatu', 'Vaticano', 'Venezuela', 'Vietnam', 'Yemen', 'Yibuti', 'Zambia', 'Zimbabue',
];
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
  paisOrigen: 'País de origen del capital de la empresa matriz o inversionista.',
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

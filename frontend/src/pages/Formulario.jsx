import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Building2, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../services/api';

// --- CONFIGURACIÓN Y CONSTANTES ARQUITECTÓNICAS ---
const STEPS = [
  { id: 1, title: 'Datos Generales' },
  { id: 2, title: 'Producción' },
  { id: 3, title: 'Métricas ESG' },
  { id: 4, title: 'Impacto Social' },
  { id: 5, title: 'Capacitación y Rotación' }, 
  { id: 6, title: 'Revisión' }
];

const BACKGROUNDS = {
  1: '/bg-tunel.jpg',
  2: '/bg-produccion.jpg',
  3: '/bg-esg.jpg',
  4: '/bg-social.jpg',
  5: '/bg-capacitacion.jpg',
  6: '/bg-revision.jpg'
};

const METALS = [
  { key: 'oro', label: 'Oro', unit: 'oz' },
  { key: 'plata', label: 'Plata', unit: 'oz' },
  { key: 'cobre', label: 'Cobre', unit: 't' },
  { key: 'plomo', label: 'Plomo', unit: 't' },
  { key: 'zinc', label: 'Zinc', unit: 't' },
];

// Constantes Paso 3: ESG
const YEARS_ESG = ['2023', '2024', '2025', '2026'];
const ESG_METRICS = [
  { id: 'incidentes', label: 'Incidentes Ambientales', fullTitle: 'Número de incidentes ambientales notificables.', unit: 'Casos' },
  { id: 'cumplimiento', label: 'Cumplimiento Normativo', fullTitle: 'Porcentaje de cumplimiento de regulaciones ambientales.', unit: '%' },
  { id: 'agua-reciclada', label: 'Agua Reciclada', fullTitle: 'Porcentaje de uso de agua reciclada.', unit: '%' },
  { id: 'reduccion-gei', label: 'Reducción GEI', fullTitle: 'Porcentaje de reducción de emisiones de Gases de Efecto Invernadero (GEI).', unit: '%' },
  { id: 'reforestacion', label: 'Reforestación', fullTitle: 'Número de árboles sembrados en campañas de reforestación.', unit: 'Árboles' },
  { id: 'inversion', label: 'Inversión Ambiental', fullTitle: 'Monto de inversión de acciones vinculadas al medio ambiente.', unit: 'Millones de dólares' }
];

// Constantes Paso 4: Social (Empleos)
const YEARS_SOCIAL = ['2023', '2024', '2025', '2026'];
const SOCIAL_CATEGORIES = [
  { id: 'empresa', label: 'Empresa', desc: 'Personal contratado directamente por la unidad minera.' },
  { id: 'contratistas', label: 'Contratistas', desc: 'Personal subcontratado prestando servicios en la unidad.' },
  { id: 'comunidades', label: 'Comunidades', desc: 'Empleos generados para habitantes de comunidades locales.' },
  { id: 'guerrero', label: 'Guerrero', desc: 'Empleos generados para habitantes del Estado de Guerrero.' }
];

// Constantes Paso 5: Capacitación y Rotación
const YEARS_CAPACITACION = ['2023', '2024', '2025', '2026'];
const CAPACITACION_TABS = [
  { id: 'capacitacion', label: 'Capacitación en Seguridad', desc: 'Registro de horas o personal capacitado en materia de seguridad.' },
  { id: 'rotacion', label: 'Tasa de Rotación de Personal', desc: 'Porcentajes o métricas de rotación general y por género.' }
];

// Defaults para react-hook-form
const ESG_DEFAULTS = Object.fromEntries(
  ESG_METRICS.map(m => [
    m.id,
    Object.fromEntries([...YEARS_ESG.map(y => [y, '']), ['comentarios', '']])
  ])
);

const SOCIAL_DEFAULTS = Object.fromEntries(
  SOCIAL_CATEGORIES.map(cat => [
    cat.id,
    Object.fromEntries(YEARS_SOCIAL.map(y => [y, { mujeres: '', hombres: '' }]))
  ])
);

const CAPACITACION_DEFAULTS = {
  capacitacion: Object.fromEntries(YEARS_CAPACITACION.map(y => [y, { mujeres: '', hombres: '' }])),
  rotacion: Object.fromEntries(YEARS_CAPACITACION.slice(0, 3).map(y => [y, { mujeres: '', hombres: '' }]))
};

const HELP_TEXTS = {
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

// Componente Tooltip / Ayuda
function HelpBtn({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setOpen(false)}
        aria-label="Ver más información"
        className="w-4 h-4 rounded-full bg-zinc-200 text-zinc-500 text-[10px] font-bold flex items-center justify-center hover:bg-guinda hover:text-white transition-colors ml-1.5 flex-shrink-0"
      >
        ?
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-zinc-900 text-white text-xs leading-relaxed rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200">
          {text}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900" />
        </div>
      )}
    </span>
  );
}

export default function Formulario() {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeEsgTab, setActiveEsgTab] = useState(ESG_METRICS[0].id);
  const [activeSocialTab, setActiveSocialTab] = useState(SOCIAL_CATEGORIES[0].id);
  const [activeCapacitacionTab, setActiveCapacitacionTab] = useState(CAPACITACION_TABS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [loadingForm, setLoadingForm] = useState(true);
  const navigate = useNavigate();
  const [privacidadOpen, setPrivacidadOpen] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await request('/formularios/mi-formulario');
        if (cancelled) return;
        if (data && data.id) {
          setReadOnly(true);
          reset(data);
        }
      } catch {
        // sin formulario previo
      } finally {
        if (!cancelled) setLoadingForm(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { 
      produccion: {}, 
      esg: ESG_DEFAULTS, 
      social: SOCIAL_DEFAULTS,
      capacitacionData: CAPACITACION_DEFAULTS
    }
  });

  const onSubmitForm = async (data) => {
    // Navegación interna por pestañas antes de avanzar de paso principal
    if (currentStep === 3) {
      const esgIndex = ESG_METRICS.findIndex(m => m.id === activeEsgTab);
      if (esgIndex < ESG_METRICS.length - 1) {
        setActiveEsgTab(ESG_METRICS[esgIndex + 1].id);
        return;
      }
    }
    if (currentStep === 4) {
      const rowIndex = SOCIAL_CATEGORIES.findIndex(m => m.id === activeSocialTab);
      if (rowIndex < SOCIAL_CATEGORIES.length - 1) {
        setActiveSocialTab(SOCIAL_CATEGORIES[rowIndex + 1].id);
        return;
      }
    }
    if (currentStep === 5) {
      const capIndex = CAPACITACION_TABS.findIndex(m => m.id === activeCapacitacionTab);
      if (capIndex < CAPACITACION_TABS.length - 1) {
        setActiveCapacitacionTab(CAPACITACION_TABS[capIndex + 1].id);
        return;
      }
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    try {
      setIsSubmitting(true);
      await request('/formularios', { method: 'POST', body: JSON.stringify(data) });
      navigate('/ya-enviado');
    } catch (error) {
      if (error.message?.includes('ya ha enviado')) {
        setReadOnly(true);
        toast.error('Esta empresa ya había enviado su reporte.');
        const existing = await request('/formularios/mi-formulario');
        if (existing && existing.id) reset(existing);
      } else {
        toast.error(error.message || 'Error al enviar el formulario');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 3) {
      const esgIndex = ESG_METRICS.findIndex(m => m.id === activeEsgTab);
      if (esgIndex > 0) {
        setActiveEsgTab(ESG_METRICS[esgIndex - 1].id);
        return;
      }
    }
    if (currentStep === 4) {
      const rowIndex = SOCIAL_CATEGORIES.findIndex(m => m.id === activeSocialTab);
      if (rowIndex > 0) {
        setActiveSocialTab(SOCIAL_CATEGORIES[rowIndex - 1].id);
        return;
      }
    }
    if (currentStep === 5) {
      const capIndex = CAPACITACION_TABS.findIndex(m => m.id === activeCapacitacionTab);
      if (capIndex > 0) {
        setActiveCapacitacionTab(CAPACITACION_TABS[capIndex - 1].id);
        return;
      }
    }
    setCurrentStep(prev => prev - 1);
  };

  return (
    <main className="relative h-screen flex flex-col selection:bg-guinda selection:text-white transition-colors duration-500">
      
      {/* CAPA DE FONDO DINÁMICA */}
      <div 
        key={currentStep} 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat animate-in fade-in duration-1000"
        style={{ backgroundImage: `url('${BACKGROUNDS[currentStep] || BACKGROUNDS[1]}')` }}
      />
      
      {/* OVERLAY DE CONTRASTE */}
      <div className="fixed inset-0 z-10 bg-zinc-950/70 backdrop-blur-sm transition-opacity duration-700" />

      {/* CONTENEDOR PRINCIPAL FLOTANTE */}
      <div className="relative z-20 max-w-5xl mx-auto w-full flex-1 flex flex-col px-4 sm:px-6 py-4 sm:py-6 min-h-0">
        
        {/* Cabecera General */}
        <div className="text-center flex-shrink-0 pb-3 sm:pb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white drop-shadow-md">
            Reporte Estadístico Minero
          </h1>
          <p className="text-zinc-300 mt-1 font-light tracking-wide drop-shadow-sm text-sm sm:text-base">
            Completa la información correspondiente al periodo evaluado
          </p>
        </div>

        {/* Tarjeta Glass / Sólida */}
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 flex-1 flex flex-col overflow-hidden min-h-0">
          
          {/* Stepper Superior */}
          <div className="bg-zinc-50/80 backdrop-blur-xl border-b border-zinc-200 px-4 sm:px-8 py-8 overflow-x-auto transition-colors">
            <div className="flex items-center justify-between relative min-w-[700px]">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-zinc-200 z-0"></div>
              {STEPS.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center bg-transparent px-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-sm font-bold ${
                      isActive ? 'bg-guinda border-guinda text-white shadow-lg shadow-guinda/30 scale-110' : 
                      isCompleted ? 'bg-white border-guinda text-guinda' : 'bg-white border-zinc-300 text-zinc-400'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : step.id}
                    </div>
                    <span className={`text-xs font-semibold mt-4 absolute -bottom-8 w-max tracking-wide transition-colors ${
                      isActive || isCompleted ? 'text-zinc-900' : 'text-zinc-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formulario Core */}
          <form onSubmit={handleSubmit(onSubmitForm)} className="flex-1 flex flex-col bg-white relative min-h-0">
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 sm:py-8">

              {readOnly && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <EyeOff className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Reporte ya enviado</p>
                    <p className="text-xs text-amber-700 mt-0.5">Esta empresa ya ha registrado su información. Los campos están en modo solo lectura.</p>
                  </div>
                </div>
              )}

              {loadingForm ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
                </div>
              ) : (
              <fieldset disabled={readOnly} className="border-0 p-0 m-0 min-w-0">

              {/* ========================================================
                  PASO 1: DATOS GENERALES
              ======================================================== */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="border-b border-zinc-100 pb-4">
                    <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">1. Información General</h2>
                    <p className="text-sm text-zinc-500 mt-1">Identificación de la unidad y capacidades operativas.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="md:col-span-2 space-y-2 relative group">
                      <label htmlFor="empresaMatriz" className="text-sm font-medium text-zinc-700 flex items-center justify-between">
                        <span>Empresa Matriz o Empresa <HelpBtn text={HELP_TEXTS.empresaMatriz} /></span>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold bg-zinc-100 px-2 py-0.5 rounded-full">Requerido</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-guinda transition-colors duration-200" aria-hidden="true" />
                        <input 
                          id="empresaMatriz"
                          {...register('empresaMatriz', { required: 'El nombre de la empresa es obligatorio' })}
                          type="text" 
                          placeholder="Ej. Mining Inc."
                          aria-invalid={errors.empresaMatriz ? "true" : "false"}
                          className={`w-full h-12 pl-10 pr-4 bg-white rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200 text-zinc-900 placeholder:text-zinc-400 shadow-sm ${errors.empresaMatriz ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30' : 'border-zinc-300 focus:ring-guinda/20 focus:border-guinda hover:border-zinc-400'}`}
                        />
                      </div>
                      {errors.empresaMatriz && (
                        <p role="alert" className="text-xs text-red-500 font-medium flex items-center gap-1.5 mt-1.5 animate-in slide-in-from-top-1 fade-in duration-200">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.empresaMatriz.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 inline-flex items-center">Subsidiaria <HelpBtn text={HELP_TEXTS.subsidiaria} /></label>
                      <input {...register("subsidiaria")} required className="w-full h-12 px-4 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-800 placeholder:text-zinc-400" placeholder="Ej. Minera del Norte S.A." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 inline-flex items-center">Unidad Minera <HelpBtn text={HELP_TEXTS.unidadMinera} /></label>
                      <input {...register("unidadMinera")} required className="w-full h-12 px-4 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-800 placeholder:text-zinc-400" placeholder="Ej. Unidad Fresnillo" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 inline-flex items-center">Tipo de Minado <HelpBtn text={HELP_TEXTS.tipoMinado} /></label>
                      <select {...register("tipoMinado")} required className="w-full h-12 px-4 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-guinda outline-none bg-zinc-50 focus:bg-white transition-all text-zinc-700">
                        <option value="">Selecciona una opción</option>
                        <option value="Subterraneo">Subterráneo</option>
                        <option value="TajoAbierto">Tajo Abierto</option>
                        <option value="Mixto">Mixto</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 inline-flex items-center">Fecha de Inicio de Operaciones <HelpBtn text={HELP_TEXTS.fechaInicio} /></label>
                      <input type="date" {...register("fechaInicio")} required className="w-full h-12 px-4 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 inline-flex items-center">Vida Útil Estimada (Años) <HelpBtn text={HELP_TEXTS.vidaUtil} /></label>
                      <input type="number" min="0" {...register("vidaUtil")} required className="w-full h-12 px-4 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-800 placeholder:text-zinc-400" placeholder="Ej. 20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700 inline-flex items-center">Capacidad del Procesamiento (t/día) <HelpBtn text={HELP_TEXTS.capacidad} /></label>
                      <input type="number" min="0" {...register("capacidad")} required className="w-full h-12 px-4 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-800 placeholder:text-zinc-400" placeholder="Ej. 8000" />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  PASO 2: MATRIZ DE PRODUCCIÓN
              ======================================================== */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">2. Producción</h2>
                      <p className="text-sm text-zinc-500 mt-1">Volumen total extraído por año.</p>
                    </div>
                    <div className="text-xs font-medium text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 shadow-sm">
                      Deja en blanco si el metal no aplica
                    </div>
                  </div>

                  <div className="mt-6 border border-zinc-200 rounded-2xl overflow-x-auto shadow-sm">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-700">
                        <tr>
                          <th className="px-6 py-4 font-semibold border-r border-zinc-200 bg-zinc-100/80 sticky left-0 z-20 backdrop-blur-sm">Año</th>
                          {METALS.map(metal => (
                            <th key={metal.key} className="px-6 py-4 font-semibold text-right border-r border-zinc-200 last:border-0 min-w-[140px]">
                              <span className="inline-flex items-center justify-end gap-1">
                                {metal.label}
                                <HelpBtn text={HELP_TEXTS[metal.key]} />
                                <span className="text-zinc-400 font-normal ml-0.5">({metal.unit})</span>
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {YEARS_ESG.map((year) => (
                          <tr key={year} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors group">
                            <td className="px-6 py-0 border-r border-zinc-200 font-medium text-zinc-900 bg-white group-hover:bg-zinc-50/80 sticky left-0 z-10 transition-colors">
                              {year}
                            </td>
                            {METALS.map(metal => (
                              <td key={`${year}-${metal.key}`} className="p-0 border-r border-zinc-100 last:border-0 relative bg-white transition-colors">
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  aria-label={`Producción de ${metal.label} en ${year}`}
                                  {...register(`produccion.${year}.${metal.key}`)}
                                  className="w-full h-full min-h-[60px] px-6 py-3 text-right bg-transparent border-none outline-none focus:ring-2 focus:ring-guinda inset-0 z-0 focus:z-20 relative transition-all placeholder:text-zinc-300 font-medium text-zinc-800"
                                  placeholder="0.00"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================
                  PASO 3: INDICADORES ESG
              ======================================================== */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">3. Indicadores Ambientales y Sociales (ESG)</h2>
                      <p className="text-sm text-zinc-500 mt-1">Registra las métricas por categoría correspondientes al periodo evaluado.</p>
                    </div>
                    <div className="text-xs font-medium text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 shadow-sm flex-shrink-0">
                      Selecciona una categoría
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 mt-6">
                    <div className="w-full md:w-1/3 space-y-2 border-r border-zinc-100 pr-0 md:pr-6">
                      {ESG_METRICS.map(metric => {
                        const isActive = activeEsgTab === metric.id;
                        return (
                          <button
                            key={metric.id}
                            type="button"
                            onClick={() => setActiveEsgTab(metric.id)}
                            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-medium border ${
                              isActive 
                                ? 'bg-zinc-900 text-white shadow-md border-zinc-900' 
                                : 'bg-transparent text-zinc-600 hover:bg-zinc-50 border-transparent hover:border-zinc-200'
                            }`}
                          >
                            {metric.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="w-full md:w-2/3 min-h-[400px]">
                      {ESG_METRICS.map(metric => (
                        <div key={`content-${metric.id}`} className={activeEsgTab === metric.id ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                          
                          <div className="mb-8 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <h3 className="text-lg font-semibold text-zinc-900 tracking-tight flex items-start gap-2">
                              <span className="leading-tight">{metric.fullTitle}</span>
                              {HELP_TEXTS[metric.id] && <HelpBtn text={HELP_TEXTS[metric.id]} />}
                            </h3>
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-zinc-200 rounded-md text-xs font-medium text-zinc-600">
                              Unidad de medida: <span className="text-zinc-900 font-bold">{metric.unit}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                            {YEARS_ESG.map(year => (
                              <div key={`${metric.id}-${year}`} className="space-y-1.5 group">
                                <label className="text-xs font-bold text-zinc-400 tracking-wider uppercase ml-1 flex items-center justify-between">
                                  {year} {year === '2026' && <span className="text-[10px] text-guinda">*</span>}
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  {...register(`esg.${metric.id}.${year}`)}
                                  className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-guinda focus:border-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-900 placeholder:text-zinc-300 font-medium shadow-sm hover:border-zinc-300"
                                  placeholder="0.00"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="mt-8 space-y-2">
                            <label className="text-sm font-semibold text-zinc-700 tracking-tight">
                              Describe las acciones más importantes realizadas del periodo 2022-2026
                            </label>
                            <textarea
                              {...register(`esg.${metric.id}.comentarios`)}
                              rows="4"
                              className="w-full p-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-guinda focus:border-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-800 placeholder:text-zinc-400 resize-none leading-relaxed text-sm shadow-sm hover:border-zinc-300"
                              placeholder="Ingresa justificaciones, observaciones o detalles sobre las métricas de este periodo..."
                            />
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  PASO 4: IMPACTO SOCIAL Y EMPLEO
              ======================================================== */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">4. Impacto Social y Empleo</h2>
                      <p className="text-sm text-zinc-500 mt-1">Registra el personal femenino y masculino. El total de empleados se calculará de forma automática.</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 mt-6">
                    <div className="w-full md:w-1/3 space-y-2 border-r border-zinc-100 pr-0 md:pr-6">
                      {SOCIAL_CATEGORIES.map(category => {
                        const isActive = activeSocialTab === category.id;
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => setActiveSocialTab(category.id)}
                            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-medium border ${
                              isActive 
                                ? 'bg-zinc-900 text-white shadow-md border-zinc-900' 
                                : 'bg-transparent text-zinc-600 hover:bg-zinc-50 border-transparent hover:border-zinc-200'
                            }`}
                          >
                            {category.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="w-full md:w-2/3 min-h-[400px]">
                      {SOCIAL_CATEGORIES.map(category => {
                        if (activeSocialTab !== category.id) return null;

                        return (
                          <div key={`social-${category.id}`} className="animate-in fade-in slide-in-from-right-4 duration-300">
                            
                            <div className="mb-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                              <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">{category.label}</h3>
                              <p className="text-sm text-zinc-500 mt-1">{category.desc}</p>
                            </div>

                            <div className="space-y-6">
                              {YEARS_SOCIAL.map(year => {
                                return (
                                  <div key={year} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors group">
                                    <div className="flex items-center justify-between mb-4">
                                      <label className="text-sm font-bold text-zinc-900 flex items-center gap-1">
                                        {year} {year === '2026' && <span className="text-guinda">* (Proyectado)</span>}
                                      </label>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-600">Total mujeres</label>
                                        <input
                                          type="number"
                                          min="0"
                                          {...register(`social.${category.id}.${year}.mujeres`)}
                                          className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-guinda focus:border-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-900 placeholder:text-zinc-300"
                                          placeholder="0"
                                        />
                                      </div>
                                      
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-600">Total hombres</label>
                                        <input
                                          type="number"
                                          min="0"
                                          {...register(`social.${category.id}.${year}.hombres`)}
                                          className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-900 placeholder:text-zinc-300"
                                          placeholder="0"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  PASO 5: CAPACITACIÓN Y ROTACIÓN DE PERSONAL
              ======================================================== */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">5. Capacitación y Rotación de Personal</h2>
                      <p className="text-sm text-zinc-500 mt-1">Registra las horas de capacitación en seguridad y las tasas de rotación anual.</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 mt-6">
                    {/* Menú Vertical Capacitación / Rotación */}
                    <div className="w-full md:w-1/3 space-y-2 border-r border-zinc-100 pr-0 md:pr-6">
                      {CAPACITACION_TABS.map(tab => {
                        const isActive = activeCapacitacionTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveCapacitacionTab(tab.id)}
                            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-medium border ${
                              isActive 
                                ? 'bg-zinc-900 text-white shadow-md border-zinc-900' 
                                : 'bg-transparent text-zinc-600 hover:bg-zinc-50 border-transparent hover:border-zinc-200'
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Área de Captura */}
                    <div className="w-full md:w-2/3 min-h-[400px]">
                      
                      {/* PESTAÑA 1: CAPACITACIÓN */}
                      {activeCapacitacionTab === 'capacitacion' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                          <div className="mb-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">Capacitación en Seguridad</h3>
                            <p className="text-sm text-zinc-500 mt-1">Horas de capacitación. El total se calcula automáticamente.</p>
                          </div>

                          <div className="space-y-6">
                            {YEARS_CAPACITACION.map(year => {
                              return (
                                <div key={year} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors group">
                                  <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-bold text-zinc-900 flex items-center gap-1">
                                      {year} {year === '2026' && <span className="text-guinda">* (Proyectado)</span>}
                                    </label>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-semibold text-zinc-600">Total mujeres</label>
                                      <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        {...register(`capacitacionData.capacitacion.${year}.mujeres`)}
                                        className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-guinda focus:border-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-900 placeholder:text-zinc-300"
                                        placeholder="0"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-semibold text-zinc-600">Total hombres</label>
                                      <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        {...register(`capacitacionData.capacitacion.${year}.hombres`)}
                                        className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-900 placeholder:text-zinc-300"
                                        placeholder="0"
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* PESTAÑA 2: TASA DE ROTACIÓN DE PERSONAL */}
                      {activeCapacitacionTab === 'rotacion' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                          <div className="mb-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">Tasa de Rotación de Personal</h3>
                            <p className="text-sm text-zinc-500 mt-1">Registra las tasas correspondientes al periodo 2023-2025.</p>
                          </div>

                          <div className="space-y-6">
                            {['2023', '2024', '2025'].map(year => (
                              <div key={year} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors group">
                                <div className="flex items-center justify-between mb-4">
                                  <label className="text-sm font-bold text-zinc-900">{year}</label>
                                </div>

                                {/* Reestructuración a 2 columnas tras eliminar Tasa Total */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-600">Tasa mujeres (%)</label>
                                    <input
                                      type="number"
                                      step="any"
                                      min="0"
                                      max="100"
                                      {...register(`capacitacionData.rotacion.${year}.mujeres`)}
                                      className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-guinda focus:border-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-900 placeholder:text-zinc-300"
                                      placeholder="0.0%"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-600">Tasa hombres (%)</label>
                                    <input
                                      type="number"
                                      step="any"
                                      min="0"
                                      max="100"
                                      {...register(`capacitacionData.rotacion.${year}.hombres`)}
                                      className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-900 placeholder:text-zinc-300"
                                      placeholder="0.0%"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  PASO 6: REVISIÓN FINAL Y ENVÍO
              ======================================================== */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="border-b border-zinc-100 pb-4">
                    <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">6. Revisión Final</h2>
                    <p className="text-sm text-zinc-500 mt-1">Has completado todos los módulos. Verifica que la información esté lista para su envío oficial a SEFODECO.</p>
                  </div>
                  <div className="p-8 bg-zinc-50 border border-zinc-200 rounded-3xl text-center space-y-4 shadow-inner">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-200">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-medium text-zinc-900">Formulario listo para enviar</h3>
                    <p className="text-zinc-600 text-sm max-w-md mx-auto leading-relaxed">
                      Al presionar "Finalizar y Enviar Reporte", los datos serán procesados y guardados de manera segura. Asegúrate de que las métricas anuales sean correctas.
                    </p>
                  </div>
                  <label className="flex items-center justify-center gap-2.5 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={aceptaPrivacidad}
                      onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 text-guinda focus:ring-guinda"
                    />
                    <span className="text-sm text-zinc-700">
                      He leído y acepto el{' '}
                      <button
                        type="button"
                        onClick={() => setPrivacidadOpen(true)}
                        className="text-guinda underline underline-offset-2 hover:text-guinda-hover"
                      >
                        Aviso de Privacidad
                      </button>
                    </span>
                  </label>
                </div>
              )}
            </fieldset>
              )}
            </div>

            {/* Link Footer Aviso Privacidad */}
            <div className="flex-shrink-0 px-6 sm:px-10 py-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setPrivacidadOpen(true)}
                className="text-xs font-medium text-guinda hover:text-guinda-hover underline underline-offset-2 transition-colors"
              >
                Aviso de Privacidad
              </button>
            </div>

            {/* Modal de Aviso de Privacidad */}
            {privacidadOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPrivacidadOpen(false)} />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
                    <h3 className="text-lg font-semibold text-zinc-900">Aviso de Privacidad</h3>
                    <button
                      type="button"
                      onClick={() => setPrivacidadOpen(false)}
                      className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center transition-colors text-sm font-bold"
                    >
                      ×
                    </button>
                  </div>
                  <div className="px-6 py-4 overflow-y-auto text-sm text-zinc-600 leading-relaxed space-y-3 flex-1">
                    <p>En cumplimiento con la Ley Federal de Protección de Datos Personales, SEFODECO informa que los datos recabados en este reporte tienen como finalidad única la integración de la estadística minera estatal.</p>
                    <p>La información operativa, financiera y productiva proporcionada será tratada con estricta confidencialidad y se presentará públicamente únicamente mediante datos agregados y disociados, garantizando el secreto industrial y comercial de las empresas informantes.</p>
                  </div>
                  <div className="px-6 py-4 border-t border-zinc-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setPrivacidadOpen(false)}
                      className="px-4 py-2 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors"
                    >
                      Entendido, cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer / Botones de Navegación Globales */}
            <div className="flex-shrink-0 px-6 sm:px-10 py-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
                className="flex items-center px-6 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-zinc-200 shadow-sm hover:shadow rounded-xl transition-all disabled:opacity-0 disabled:cursor-default"
              >
                Anterior
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || readOnly || (currentStep === STEPS.length && !aceptaPrivacidad)}
                className="flex items-center px-8 py-3.5 bg-guinda text-white text-sm font-semibold tracking-wide rounded-xl hover:bg-[#72112e] transition-all active:scale-[0.98] shadow-[0_4px_14px_rgba(138,21,56,0.39)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {readOnly ? 'Reporte ya enviado' : currentStep === STEPS.length ? (
                  isSubmitting ? (
                    <>Enviando... <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div></>
                  ) : 'Finalizar y Enviar Reporte'
                ) : (
                  'Siguiente Paso'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
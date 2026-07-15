import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../services/api';

// --- CONFIGURACIÓN Y CONSTANTES ARQUITECTÓNICAS ---
const STEPS = [
  { id: 1, title: 'Datos Generales' },
  { id: 2, title: 'Producción' },
  { id: 3, title: 'Métricas ESG' },
  { id: 4, title: 'Revisión' }
];

const BACKGROUNDS = {
  1: '/bg-tunel.jpg',
  2: '/bg-produccion.jpg',
  3: '/bg-esg.jpg',
  4: '/bg-revision.jpg'
};

const YEARS = ['2021', '2022', '2023', '2024', '2025', '2026'];

const METALS = [
  { key: 'oro', label: 'Oro', unit: 'oz' },
  { key: 'plata', label: 'Plata', unit: 'oz' },
  { key: 'cobre', label: 'Cobre', unit: 't' },
  { key: 'plomo', label: 'Plomo', unit: 't' },
  { key: 'zinc', label: 'Zinc', unit: 't' },
];

const ESG_METRICS = [
  { id: 'consumo-agua', label: 'Consumo de Agua', unit: 'm³ anuales' },
  { id: 'co2', label: 'Emisiones CO2', unit: 'Ton. equivalentes' },
  { id: 'energia', label: 'Energía', unit: 'MWh' },
  { id: 'accidentes', label: 'Accidentes', unit: 'Incidentes' },
  { id: 'inversion-social', label: 'Inversión Social', unit: 'Pesos (MXN)' },
  { id: 'plantas', label: 'Reforestación', unit: 'Árboles plantados' }
];

const ESG_DEFAULTS = Object.fromEntries(
  ESG_METRICS.map(m => [
    m.id,
    Object.fromEntries([...YEARS.map(y => [y, '']), ['comentarios', '']])
  ])
);

const HELP_TEXTS = {
  empresaMatriz: 'Nombre del grupo corporativo o empresa matriz a la que pertenece la unidad minera.',
  subsidiaria: 'Razón social o nombre legal de la empresa subsidiaria.',
  unidadMinera: 'Nombre oficial de la unidad minera o del complejo minero.',
  tipoMinado: 'Método de extracción principal utilizado en la operación minera.',
  fechaInicio: 'Fecha en que iniciaron oficialmente las operaciones de la unidad.',
  vidaUtil: 'Estimación de la vida útil restante de la mina, expresada en años.',
  capacidad: 'Capacidad instalada de procesamiento de mineral en toneladas por día.',
  oro: 'Volumen de oro producido en onzas troy (oz).',
  plata: 'Volumen de plata producido en onzas troy (oz).',
  cobre: 'Volumen de cobre producido en toneladas (t).',
  plomo: 'Volumen de plomo producido en toneladas (t).',
  zinc: 'Volumen de zinc producido en toneladas (t).',
  'consumo-agua': 'Volumen total de agua consumida en metros cúbicos (m³) anuales, incluyendo recirculación.',
  co2: 'Emisiones totales de CO₂ equivalente generadas por la operación en el año.',
  energia: 'Consumo total de energía expresado en megawatts-hora (MWh).',
  accidentes: 'Número total de incidentes y accidentes laborales reportados en el año.',
  'inversion-social': 'Monto total invertido en programas y proyectos de desarrollo social comunitario.',
  plantas: 'Número total de árboles plantados en programas de reforestación y restauración.',
};

function HelpBtn({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setOpen(false)}
        className="w-4 h-4 rounded-full bg-zinc-200 text-zinc-500 text-[10px] font-bold flex items-center justify-center hover:bg-guinda hover:text-white transition-colors ml-1.5 flex-shrink-0"
      >
        ?
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-zinc-900 text-white text-xs leading-relaxed rounded-lg shadow-lg z-50">
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [privacidadOpen, setPrivacidadOpen] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { produccion: {}, esg: ESG_DEFAULTS }
  });

  const onSubmitForm = async (data) => {
    if (currentStep === 3) {
      const esgIndex = ESG_METRICS.findIndex(m => m.id === activeEsgTab);
      if (esgIndex < ESG_METRICS.length - 1) {
        setActiveEsgTab(ESG_METRICS[esgIndex + 1].id);
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
      toast.error(error.message || 'Error al enviar el formulario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative h-screen flex flex-col selection:bg-guinda selection:text-white transition-colors duration-500">
      
      {/* 1. CAPA DE FONDO DINÁMICA (Crossfade) */}
      <div 
        key={currentStep} 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat animate-in fade-in duration-1000"
        style={{ backgroundImage: `url('${BACKGROUNDS[currentStep] || BACKGROUNDS[1]}')` }} 
      />
      
      {/* 2. OVERLAY DE CONTRASTE */}
      <div className="fixed inset-0 z-10 bg-zinc-950/70 backdrop-blur-sm transition-opacity duration-700" />

      {/* 3. CONTENEDOR PRINCIPAL FLOTANTE */}
      <div className="relative z-20 max-w-5xl mx-auto w-full flex-1 flex flex-col px-4 sm:px-6 py-4 sm:py-6 min-h-0">
        
        {/* Cabecera General */}
        <div className="text-center flex-shrink-0 pb-3 sm:pb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white drop-shadow-md">
            Reporte Estadístico Minero
          </h1>
          <p className="text-zinc-300 mt-1 font-light tracking-wide drop-shadow-sm text-sm sm:text-base">
            Completa la información correspondiente al periodo 2021-2026
          </p>
        </div>

        {/* Tarjeta Glass/Sólida */}
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 flex-1 flex flex-col overflow-hidden min-h-0">
          
          {/* Stepper Superior */}
          <div className="bg-zinc-50/80 backdrop-blur-xl border-b border-zinc-200 px-4 sm:px-8 py-8 overflow-x-auto transition-colors">
            <div className="flex items-center justify-between relative min-w-[500px]">
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
              
              {/* ========================================================
                  PASO 1: DATOS GENERALES (100% COMPLETO)
              ======================================================== */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="border-b border-zinc-100 pb-4">
                    <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">1. Información General</h2>
                    <p className="text-sm text-zinc-500 mt-1">Identificación de la unidad y capacidades operativas.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-zinc-700 inline-flex items-center">Empresa Matriz <HelpBtn text={HELP_TEXTS.empresaMatriz} /></label>
                      <input {...register("empresaMatriz")} required className="w-full h-12 px-4 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-800 placeholder:text-zinc-400" placeholder="Ej. Grupo México S.A.B. de C.V." />
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
                      <label className="text-sm font-medium text-zinc-700 inline-flex items-center">Capacidad Instalada (ton/día) <HelpBtn text={HELP_TEXTS.capacidad} /></label>
                      <input type="number" min="0" {...register("capacidad")} required className="w-full h-12 px-4 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-800 placeholder:text-zinc-400" placeholder="Ej. 8000" />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  PASO 2: MATRIZ DE PRODUCCIÓN (100% COMPLETO)
              ======================================================== */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">2. Matriz de Producción</h2>
                      <p className="text-sm text-zinc-500 mt-1">Captura el volumen total extraído por año.</p>
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
                        {YEARS.map((year) => (
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
                  PASO 3: INDICADORES ESG (100% COMPLETO)
              ======================================================== */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">3. Indicadores Ambientales y Sociales (ESG)</h2>
                      <p className="text-sm text-zinc-500 mt-1">Registra las métricas por categoría. Puedes usar el campo de comentarios para justificar variaciones.</p>
                    </div>
                    <div className="text-xs font-medium text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 shadow-sm">
                      Selecciona una categoría
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 mt-6">
                    {/* Menú de Pestañas Verticales (Tabs) */}
                    <div className="w-full md:w-1/3 space-y-2 border-r border-zinc-100 pr-0 md:pr-6">
                      {ESG_METRICS.map(metric => {
                        const isActive = activeEsgTab === metric.id;
                        return (
                          <button
                            key={metric.id}
                            type="button"
                            onClick={() => setActiveEsgTab(metric.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                              isActive ? 'bg-zinc-900 text-white shadow-md' : 'bg-transparent text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {metric.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Área de Captura de la Pestaña Activa */}
                    <div className="w-full md:w-2/3 min-h-[350px]">
                      {ESG_METRICS.map(metric => (
                        <div key={`content-${metric.id}`} className={activeEsgTab === metric.id ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                          
                          <div className="mb-6">
                            <h3 className="text-xl font-semibold text-zinc-900 tracking-tight inline-flex items-center">
                              {metric.label}
                              <HelpBtn text={HELP_TEXTS[metric.id]} />
                            </h3>
                            <p className="text-sm text-zinc-500 font-medium mt-1">Unidad de medida: <span className="text-zinc-800">{metric.unit}</span></p>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {YEARS.map(year => (
                              <div key={`${metric.id}-${year}`} className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-500 tracking-wider uppercase ml-1">{year}</label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  {...register(`esg.${metric.id}.${year}`)}
                                  className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-guinda focus:border-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-800 placeholder:text-zinc-300 font-medium shadow-sm"
                                  placeholder="0.00"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="mt-6 space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Comentarios o justificaciones (Opcional)</label>
                            <textarea
                              {...register(`esg.${metric.id}.comentarios`)}
                              rows="3"
                              className="w-full p-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-guinda focus:border-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-800 placeholder:text-zinc-400 resize-none leading-relaxed text-sm shadow-sm"
                              placeholder={`Agrega observaciones sobre el ${metric.label.toLowerCase()} si es necesario...`}
                            />
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  PASO 4: REVISIÓN Y ENVÍO (100% COMPLETO)
              ======================================================== */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="border-b border-zinc-100 pb-4">
                    <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">4. Revisión Final</h2>
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
            </div>{/* fin scroll-area */}

            {/* Aviso de Privacidad */}
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
                <div className="absolute inset-0 bg-black/60" onClick={() => setPrivacidadOpen(false)} />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
                    <h3 className="text-lg font-semibold text-zinc-900">Aviso de Privacidad</h3>
                    <button
                      type="button"
                      onClick={() => setPrivacidadOpen(false)}
                      className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center transition-colors text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="px-6 py-4 overflow-y-auto text-sm text-zinc-600 leading-relaxed space-y-3 flex-1">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
                    <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</p>
                    <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.</p>
                  </div>
                  <div className="px-6 py-4 border-t border-zinc-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setPrivacidadOpen(false)}
                      className="px-4 py-2 bg-zinc-100 text-zinc-700 text-sm font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer / Botones de Navegación Globales */}
            <div className="flex-shrink-0 px-6 sm:px-10 py-4 border-t border-zinc-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 3) {
                    const esgIndex = ESG_METRICS.findIndex(m => m.id === activeEsgTab);
                    if (esgIndex > 0) {
                      setActiveEsgTab(ESG_METRICS[esgIndex - 1].id);
                      return;
                    }
                  }
                  setCurrentStep(prev => prev - 1);
                }}
                disabled={currentStep === 1 || isSubmitting}
                className="flex items-center px-6 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all disabled:opacity-0 disabled:cursor-default"
              >
                Anterior
              </button>

              <button
                type="submit"
                disabled={isSubmitting || (currentStep === STEPS.length && !aceptaPrivacidad)}
                className="flex items-center px-8 py-3.5 bg-guinda text-white text-sm font-semibold tracking-wide rounded-xl hover:bg-guinda-hover transition-all active:scale-[0.98] shadow-[0_4px_14px_rgba(138,21,56,0.39)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {currentStep === STEPS.length ? (
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
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Building2, EyeOff, Download, FileText, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../services/api';
import {
  STEPS,
  BACKGROUNDS,
  METALS,
  UNIT_MAP,
  YEARS_ESG,
  ESG_METRICS,
  YEARS_SOCIAL,
  SOCIAL_CATEGORIES,
  YEARS_CAPACITACION,
  YEARS_ROTACION,
  CAPACITACION_TABS,
  ESG_DEFAULTS,
  SOCIAL_DEFAULTS,
  CAPACITACION_DEFAULTS,
  HELP_TEXTS,
  PAISES,
  esPorcentajeESG,
} from '../config/formulario';

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
  const DRAFT_KEY = 'formulario_borrador';
  const [currentStep, setCurrentStep] = useState(1);
  const [activeSocialTab, setActiveSocialTab] = useState(SOCIAL_CATEGORIES[0].id);
  const [activeCapacitacionTab, setActiveCapacitacionTab] = useState(CAPACITACION_TABS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [formId, setFormId] = useState(null);
  const [loadingForm, setLoadingForm] = useState(true);
  const navigate = useNavigate();
  const formScrollRef = useRef(null);
  const [privacidadOpen, setPrivacidadOpen] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await request('/formularios/mi-formulario');
        if (cancelled) return;
        if (data && data.id) {
          setFormId(data.id);
          setReadOnly(true);
          reset(data);
        }
      } catch {
        try {
          const draft = localStorage.getItem(DRAFT_KEY);
          if (draft) reset(JSON.parse(draft));
        } catch { /* borrador corrupto */ }
      } finally {
        if (!cancelled) setLoadingForm(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (formScrollRef.current) {
      formScrollRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  useEffect(() => {
    Object.values(BACKGROUNDS).forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const { register, handleSubmit, watch, getValues, reset, formState: { errors } } = useForm({
    defaultValues: { 
      produccion: {}, 
      esg: ESG_DEFAULTS, 
      social: SOCIAL_DEFAULTS,
      capacitacionData: CAPACITACION_DEFAULTS
    }
  });

  const socialData = watch('social');
  const capData = watch('capacitacionData');

  useEffect(() => {
    if (readOnly || loadingForm) return;
    const subscription = watch((values) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [watch, readOnly, loadingForm]);

  function fixArrays(val) {
    if (Array.isArray(val)) return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, fixArrays(v)]));
    if (val && typeof val === 'object') return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, fixArrays(v)]));
    return val;
  }

  const onSubmitForm = async (rawData) => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    try {
      setIsSubmitting(true);
      const data = fixArrays(rawData);
      if (formId) {
        await request(`/formularios/${formId}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await request('/formularios', { method: 'POST', body: JSON.stringify(data) });
      }
      localStorage.removeItem(DRAFT_KEY);
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

  const handleSaveFile = () => {
    const data = getValues();
    const step = currentStep;
    let csv = '';
    let filename = '';

    if (step === 1) {
      csv = 'Campo,Valor\n' + [
        ['Empresa Matriz', data.empresaMatriz],
        ['País de Origen del Capital', data.paisOrigen],
        ['Subsidiaria', data.subsidiaria],
        ['Unidad Minera', data.unidadMinera],
        ['Tipo de Minado', data.tipoMinado],
        ['Fecha de Inicio', data.fechaInicio],
        ['Vida Util (Años)', data.vidaUtil],
        ['Capacidad (t/día)', data.capacidad],
      ].map(r => r.map(v => `"${v || ''}"`).join(',')).join('\n');
      filename = 'Datos_Generales.csv';
    } else if (step === 2) {
      const rows = [['Año', 'Oro (Oz)', 'Plata (Oz)', 'Cobre (t)', 'Plomo (t)', 'Zinc (t)']];
      YEARS_ESG.forEach(year => {
        const prod = data.produccion?.[year] || {};
        rows.push([year, ...METALS.map(m => prod[m.key] ? `${prod[m.key]}${UNIT_MAP[m.key]}` : '')]);
      });
      csv = rows.map(r => r.join(',')).join('\n');
      filename = 'Produccion.csv';
    } else if (step === 3) {
      const rows = [['Concepto', '2023', '2024', '2025', '2026', 'Acciones 2022-2026']];
      ESG_METRICS.forEach(m => {
        const esg = data.esg?.[m.id] || {};
        rows.push([m.fullTitle,
          esg['2023'] ? `${esg['2023']}${UNIT_MAP[m.id] || ''}` : '',
          esg['2024'] ? `${esg['2024']}${UNIT_MAP[m.id] || ''}` : '',
          esg['2025'] ? `${esg['2025']}${UNIT_MAP[m.id] || ''}` : '',
          esg['2026'] ? `${esg['2026']}${UNIT_MAP[m.id] || ''}` : '',
          esg.comentarios || ''
        ]);
      });
      csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
      filename = 'Indicadores_ESG.csv';
    } else if (step === 4) {
      const rows = [['Categoria', 'Año', 'Mujeres', '% Mujeres', 'Hombres', '% Hombres', 'Total']];
      SOCIAL_CATEGORIES.forEach(cat => {
        YEARS_SOCIAL.forEach(year => {
          const s = data.social?.[cat.id]?.[year] || {};
          const mujeres = Number(s.mujeres) || 0;
          const hombres = Number(s.hombres) || 0;
          const total = mujeres + hombres;
          const pctM = total > 0 ? ((mujeres / total) * 100).toFixed(1) : '0.0';
          const pctH = total > 0 ? ((hombres / total) * 100).toFixed(1) : '0.0';
          rows.push([cat.label, year, String(mujeres), `${pctM}%`, String(hombres), `${pctH}%`, String(total)]);
        });
      });
      csv = rows.map(r => r.join(',')).join('\n');
      filename = 'Impacto_Social.csv';
    } else if (step === 5) {
      const rowsCap = [];
      rowsCap.push('Capacitacion en Seguridad (Horas)');
      rowsCap.push(['Año', 'Mujeres', 'Hombres', 'Total'].join(','));
      YEARS_CAPACITACION.forEach(year => {
        const c = data.capacitacionData?.capacitacion?.[year] || {};
        const m = Number(c.mujeres) || 0;
        const h = Number(c.hombres) || 0;
        const t = m + h;
        rowsCap.push([year, c.mujeres ? `${c.mujeres} hrs` : '0', c.hombres ? `${c.hombres} hrs` : '0', t > 0 ? `${t} hrs` : '0'].join(','));
      });
      rowsCap.push('');
      rowsCap.push('Tasa de Rotacion de Personal (%)');
      rowsCap.push(['Año', 'Mujeres', 'Hombres', 'Total'].join(','));
      YEARS_ROTACION.forEach(year => {
        const r = data.capacitacionData?.rotacion?.[year] || {};
        const mRot = Number(r.mujeres) || 0;
        const hRot = Number(r.hombres) || 0;
        const tRot = mRot > 0 || hRot > 0 ? ((mRot + hRot) / 2).toFixed(1) : '0.0';
        rowsCap.push([year, r.mujeres ? `${r.mujeres}%` : '0%', r.hombres ? `${r.hombres}%` : '0%', `${tRot}%`].join(','));
      });
      csv = rowsCap.join('\n');
      filename = 'Capacitacion_Rotacion.csv';
    } else {
      return;
    }

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Archivo guardado: ${filename}`);
  };

  const handlePrint = () => {
    const data = getValues();
    const step = currentStep;
    const stepTitle = STEPS[step - 1]?.title || '';
    let content = step === 1 ? '' : `<h2 style="font-size:18px;margin-bottom:16px;color:#8A1538;">${stepTitle}</h2>`;

    if (step === 1) {
      content += `<h2 style="font-size:20px;margin-bottom:16px;color:#333;border-bottom:2px solid #8A1538;padding-bottom:8px;">DATOS GENERALES</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 8px;border:1px solid #ccc;font-weight:600;width:40%;background:#fafafa;">Empresa Matriz</td><td style="padding:6px 8px;border:1px solid #ccc;">${data.empresaMatriz || ''}</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #ccc;font-weight:600;background:#fafafa;">País de Origen del Capital</td><td style="padding:6px 8px;border:1px solid #ccc;">${data.paisOrigen || ''}</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #ccc;font-weight:600;background:#fafafa;">Subsidiaria</td><td style="padding:6px 8px;border:1px solid #ccc;">${data.subsidiaria || ''}</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #ccc;font-weight:600;background:#fafafa;">Unidad Minera</td><td style="padding:6px 8px;border:1px solid #ccc;">${data.unidadMinera || ''}</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #ccc;font-weight:600;background:#fafafa;">Tipo de Minado</td><td style="padding:6px 8px;border:1px solid #ccc;">${data.tipoMinado || ''}</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #ccc;font-weight:600;background:#fafafa;">Fecha de Inicio</td><td style="padding:6px 8px;border:1px solid #ccc;">${data.fechaInicio || ''}</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #ccc;font-weight:600;background:#fafafa;">Vida Util (Años)</td><td style="padding:6px 8px;border:1px solid #ccc;">${data.vidaUtil || ''}</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #ccc;font-weight:600;background:#fafafa;">Capacidad (t/dia)</td><td style="padding:6px 8px;border:1px solid #ccc;">${data.capacidad || ''}</td></tr>
      </table>`;
    } else if (step === 2) {
      content += `<table style="width:100%;border-collapse:collapse;">
        <tr><th style="text-align:left;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Año</th>
        ${METALS.map(m => `<th style="text-align:right;padding:8px;border:1px solid #ccc;background:#f5f5f5;">${m.label}</th>`).join('')}</tr>`;
      YEARS_ESG.forEach(year => {
        const prod = data.produccion?.[year] || {};
        content += `<tr><td style="padding:8px;border:1px solid #ccc;font-weight:600;">${year}</td>
          ${METALS.map(m => `<td style="text-align:right;padding:8px;border:1px solid #ccc;">${prod[m.key] ? `${prod[m.key]}${UNIT_MAP[m.key]}` : '0'}</td>`).join('')}</tr>`;
      });
      content += `</table>`;
    } else if (step === 3) {
      content += `<table style="width:100%;border-collapse:collapse;">
        <tr><th style="text-align:left;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Concepto</th>
        ${YEARS_ESG.map(y => `<th style="text-align:center;padding:8px;border:1px solid #ccc;background:#f5f5f5;">${y}</th>`).join('')}
        <th style="text-align:left;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Acciones</th></tr>`;
      ESG_METRICS.forEach(m => {
        const esg = data.esg?.[m.id] || {};
        content += `<tr><td style="padding:8px;border:1px solid #ccc;font-weight:600;">${m.fullTitle}</td>
          ${YEARS_ESG.map(y => `<td style="text-align:center;padding:8px;border:1px solid #ccc;">${esg[y] ? `${esg[y]}${UNIT_MAP[m.id] || ''}` : ''}</td>`).join('')}
          <td style="padding:8px;border:1px solid #ccc;">${esg.comentarios || ''}</td></tr>`;
      });
      content += `</table>`;
    } else if (step === 4) {
      content += `<table style="width:100%;border-collapse:collapse;">
        <tr><th style="text-align:left;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Categoria</th>
        <th style="text-align:left;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Año</th>
        <th style="text-align:right;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Mujeres</th>
        <th style="text-align:right;padding:8px;border:1px solid #ccc;background:#f5f5f5;">% Mujeres</th>
        <th style="text-align:right;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Hombres</th>
        <th style="text-align:right;padding:8px;border:1px solid #ccc;background:#f5f5f5;">% Hombres</th>
        <th style="text-align:right;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Total</th></tr>`;
      SOCIAL_CATEGORIES.forEach(cat => {
        YEARS_SOCIAL.forEach(year => {
          const s = data.social?.[cat.id]?.[year] || {};
          const mujeres = Number(s.mujeres) || 0;
          const hombres = Number(s.hombres) || 0;
          const total = mujeres + hombres;
          const pctM = total > 0 ? ((mujeres / total) * 100).toFixed(1) : '0.0';
          const pctH = total > 0 ? ((hombres / total) * 100).toFixed(1) : '0.0';
          content += `<tr><td style="padding:8px;border:1px solid #ccc;">${cat.label}</td>
            <td style="padding:8px;border:1px solid #ccc;">${year}</td>
            <td style="text-align:right;padding:8px;border:1px solid #ccc;">${mujeres}</td>
            <td style="text-align:right;padding:8px;border:1px solid #ccc;">${pctM}%</td>
            <td style="text-align:right;padding:8px;border:1px solid #ccc;">${hombres}</td>
            <td style="text-align:right;padding:8px;border:1px solid #ccc;">${pctH}%</td>
            <td style="text-align:right;padding:8px;border:1px solid #ccc;font-weight:600;">${total}</td></tr>`;
        });
      });
      content += `</table>`;
    } else if (step === 5) {
      content += `<h3 style="font-size:14px;margin:12px 0 8px;">Capacitacion en Seguridad (Horas)</h3>
        <table style="width:100%;border-collapse:collapse;">
        <tr><th style="text-align:left;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Año</th>
        <th style="text-align:right;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Mujeres</th>
        <th style="text-align:right;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Hombres</th>
        <th style="text-align:right;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Total</th></tr>`;
      YEARS_CAPACITACION.forEach(year => {
        const c = data.capacitacionData?.capacitacion?.[year] || {};
        const m = Number(c.mujeres) || 0;
        const h = Number(c.hombres) || 0;
        const t = m + h;
        content += `<tr><td style="padding:8px;border:1px solid #ccc;font-weight:600;">${year}</td>
          <td style="text-align:right;padding:8px;border:1px solid #ccc;">${c.mujeres ? `${c.mujeres} hrs` : '0'}</td>
          <td style="text-align:right;padding:8px;border:1px solid #ccc;">${c.hombres ? `${c.hombres} hrs` : '0'}</td>
          <td style="text-align:right;padding:8px;border:1px solid #ccc;font-weight:600;">${t > 0 ? `${t} hrs` : '0'}</td></tr>`;
      });
      content += `</table>`;
      content += `<h3 style="font-size:14px;margin:12px 0 8px;">Tasa de Rotacion de Personal (%)</h3>
        <table style="width:100%;border-collapse:collapse;">
        <tr><th style="text-align:left;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Año</th>
        <th style="text-align:right;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Mujeres</th>
        <th style="text-align:right;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Hombres</th>
        <th style="text-align:right;padding:8px;border:1px solid #ccc;background:#f5f5f5;">Total</th></tr>`;
      YEARS_ROTACION.forEach(year => {
        const r = data.capacitacionData?.rotacion?.[year] || {};
        const mRot = Number(r.mujeres) || 0;
        const hRot = Number(r.hombres) || 0;
        const tRot = mRot > 0 || hRot > 0 ? ((mRot + hRot) / 2).toFixed(1) : '0.0';
        content += `<tr><td style="padding:8px;border:1px solid #ccc;font-weight:600;">${year}</td>
          <td style="text-align:right;padding:8px;border:1px solid #ccc;">${r.mujeres ? `${r.mujeres}%` : '0%'}</td>
          <td style="text-align:right;padding:8px;border:1px solid #ccc;">${r.hombres ? `${r.hombres}%` : '0%'}</td>
          <td style="text-align:right;padding:8px;border:1px solid #ccc;font-weight:600;">${tRot}%</td></tr>`;
      });
      content += `</table>`;
    }

    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html><head><title>${stepTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; color: #000; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { padding: 6px 8px; border: 1px solid #999; text-align: left; font-size: 11px; }
        th { background: #eee; font-weight: 700; }
        h2 { color: #8A1538; margin-bottom: 12px; font-size: 16px; }
        h3 { margin: 16px 0 8px; font-size: 13px; color: #333; }
        @media print { body { padding: 0; } }
      </style></head><body>

      ${content}
      <p style="text-align:center;margin-top:24px;font-size:10px;color:#999;">Generado el ${new Date().toLocaleDateString('es-MX')}</p>
      </body></html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 300);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleLogout = () => {
    if (!readOnly) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(getValues()));
      } catch { /* sin espacio */ }
    }
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    toast.success('Progreso guardado. Sesión cerrada.');
    navigate('/');
  };

  return (
    <main className="relative h-screen flex flex-col selection:bg-guinda selection:text-white">
      
      {/* CAPA DE FONDO DINÁMICA */}
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${BACKGROUNDS[currentStep] || BACKGROUNDS[1]}')` }}
      />
      
      {/* OVERLAY DE CONTRASTE */}
      <div className="fixed inset-0 z-10 bg-zinc-950/70" />

      {/* BOTÓN SALIR - ESQUINA INFERIOR IZQUIERDA DE LA PANTALLA */}
      <button
        type="button"
        onClick={handleLogout}
        title="Cerrar sesión y guardar progreso"
        className="fixed bottom-5 left-5 z-30 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 backdrop-blur-md transition-all active:scale-95"
      >
        <LogOut className="w-4 h-4" />
        Salir
      </button>

      {/* CONTENEDOR PRINCIPAL FLOTANTE */}
      <div className="relative z-20 max-w-4xl mx-auto w-full flex-1 flex flex-col px-2 sm:px-4 py-2 sm:py-4 min-h-0">
        
        {/* Tarjeta Glass / Sólida */}
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 flex-1 flex flex-col overflow-hidden min-h-0">
          
          {/* Stepper Superior */}
          <div className="bg-zinc-50/50 border-b border-zinc-200 px-4 sm:px-8 py-5">
            <div className="flex items-start justify-between relative gap-2 sm:gap-4 flex-wrap">
              <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-zinc-200 z-0"></div>
              {STEPS.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center bg-transparent px-1 sm:px-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all duration-150 text-[11px] sm:text-xs font-bold ${
                      isActive ? 'bg-guinda border-guinda text-white' : 
                      isCompleted ? 'bg-white border-guinda text-guinda' : 'bg-white border-zinc-300 text-zinc-400'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : step.id}
                    </div>
                    <span className={`text-[9px] sm:text-[10px] font-semibold mt-2 text-center leading-tight ${
                      isActive || isCompleted ? 'text-zinc-700' : 'text-zinc-400'
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
            <div ref={formScrollRef} className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 sm:py-8">

              {readOnly && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <EyeOff className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900">Reporte ya enviado</p>
                    <p className="text-xs text-amber-700 mt-0.5">Esta empresa ya ha registrado su información. Los campos están en modo solo lectura.</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const data = await request('/formularios/mi-formulario');
                        if (data && data.id) reset(data);
                      } catch {}
                      setReadOnly(false);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-all active:scale-95 shrink-0"
                  >
                    Editar
                  </button>
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
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-200">
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

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-zinc-700 inline-flex items-center">País de Origen del Capital <HelpBtn text={HELP_TEXTS.paisOrigen} /></label>
                      <select {...register("paisOrigen")} className="w-full h-12 px-4 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-guinda outline-none bg-zinc-50 focus:bg-white transition-all text-zinc-700">
                        <option value="">Selecciona el país de origen</option>
                        {PAISES.map((pais) => (
                          <option key={pais} value={pais}>{pais}</option>
                        ))}
                      </select>
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
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4 shrink-0">
                    <div>
                      <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">2. Producción</h2>
                      <p className="text-sm text-zinc-500 mt-1">Volumen total extraído por año.</p>
                    </div>
                    <div className="text-xs font-medium text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 shadow-sm">
                      Deja en blanco si el metal no aplica
                    </div>
                  </div>

                  <div className="border border-zinc-200 rounded-2xl shadow-sm">
                    <div>
                      <table className="w-full text-base text-left">
                        <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-700">
                          <tr>
                            <th className="px-4 py-4 sm:px-5 sm:py-5 font-semibold border-r border-zinc-200 bg-zinc-100/80 sticky left-0 z-20 backdrop-blur-sm">Año</th>
                            {METALS.map(metal => (
                              <th key={metal.key} className="px-3 sm:px-4 py-4 sm:py-5 font-semibold text-right border-r border-zinc-200 last:border-0">
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
                              <td className="px-4 py-0 border-r border-zinc-200 font-semibold text-zinc-900 bg-white group-hover:bg-zinc-50/80 sticky left-0 z-10 transition-colors text-sm sm:text-base">
                                <div className="min-h-[60px] sm:min-h-[64px] flex items-center">{year}{year === '2026' && <span className="text-guinda ml-0.5">*</span>}</div>
                              </td>
                              {METALS.map(metal => (
                                <td key={`${year}-${metal.key}`} className="p-0 border-r border-zinc-100 last:border-0 relative bg-white">
                                  <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    aria-label={`Producción de ${metal.label} en ${year}`}
                                    {...register(`produccion.${year}.${metal.key}`)}
                                    className="w-full min-h-[60px] sm:min-h-[64px] px-3 py-3 text-right bg-transparent border-none outline-none focus:ring-2 focus:ring-guinda inset-0 focus:z-10 relative transition-all placeholder:text-zinc-300 font-semibold text-zinc-900 text-sm sm:text-base"
                                    placeholder="0"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-900">
                    <span className="text-guinda">*</span> Proyectado
                  </div>
                </div>
              )}

              {/* ========================================================
                  PASO 3: INDICADORES ESG
              ======================================================== */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">3. Indicadores Ambientales y Sociales (ESG)</h2>
                      <p className="text-sm text-zinc-500 mt-1">Registra las métricas por año y describe las acciones realizadas.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {ESG_METRICS.map((metric) => {
                      const esPorcentaje = esPorcentajeESG(metric.id)
                      const esEntero = metric.id === 'incidentes' || metric.id === 'reforestacion'
                      const ejemplos = {
                        incidentes: { '2023': 'Ej: 2 casos', '2024': 'Ej: 1 caso', '2025': 'Ej: 0 casos', '2026': 'Ej: 0 casos' },
                        cumplimiento: { '2023': 'Ej: 85%', '2024': 'Ej: 90%', '2025': 'Ej: 95%', '2026': 'Ej: 98%' },
                        'agua-reciclada': { '2023': 'Ej: 30%', '2024': 'Ej: 40%', '2025': 'Ej: 50%', '2026': 'Ej: 60%' },
                        'reduccion-gei': { '2023': 'Ej: 10%', '2024': 'Ej: 15%', '2025': 'Ej: 20%', '2026': 'Ej: 25%' },
                        reforestacion: { '2023': 'Ej: 500 árboles', '2024': 'Ej: 800 árboles', '2025': 'Ej: 1000 árboles', '2026': 'Ej: 1200 árboles' },
                        inversion: { '2023': 'Ej: 1.5 mdd', '2024': 'Ej: 2.0 mdd', '2025': 'Ej: 2.5 mdd', '2026': 'Ej: 3.0 mdd' },
                      }
                      return (
                        <div key={metric.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                          <div className="p-4 bg-zinc-50 border-b border-zinc-100">
                            <h3 className="text-sm font-semibold text-zinc-900">{metric.fullTitle}</h3>
                            <span className="text-xs text-zinc-500">Unidad: {metric.unit}</span>
                          </div>
                          <div className="p-4 space-y-3">
                            {YEARS_ESG.map(year => (
                              <div key={year} className="flex items-center gap-3">
                                <label className="text-xs font-medium text-zinc-600 w-16 shrink-0">{year}</label>
                                <input
                                  type="number"
                                  step={esEntero ? '1' : 'any'}
                                  min="0"
                                  max={esPorcentaje ? '100' : undefined}
                                  onInput={(e) => {
                                    if (esPorcentaje && Number(e.target.value) > 100) {
                                      e.target.value = 100;
                                    }
                                  }}
                                  {...register(`esg.${metric.id}.${year}`, {
                                    setValueAs: (v) => {
                                      if (v === '' || v === undefined || v === null) return '';
                                      const n = Number(v);
                                      if (isNaN(n)) return '';
                                      if (esPorcentaje) return String(Math.min(n, 100));
                                      if (esEntero) return String(Math.floor(n));
                                      return String(n);
                                    }
                                  })}
                                  className="flex-1 h-10 px-3 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-guinda focus:border-guinda outline-none transition-all bg-white text-zinc-900 text-center text-sm"
                                  placeholder={ejemplos[metric.id]?.[year] || '0'}
                                />
                              </div>
                            ))}
                            <div className="pt-2">
                              <label className="text-xs font-medium text-zinc-600 mb-1 block">Acciones más importantes realizadas del periodo 2022-2026</label>
                              <textarea
                                {...register(`esg.${metric.id}.comentarios`)}
                                rows={2}
                                className="w-full p-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-guinda focus:border-guinda outline-none transition-all bg-white text-zinc-800 placeholder:text-zinc-400 resize-none text-xs"
                                placeholder="Ej: Se implementaron programas de reducción de emisiones y reciclaje de agua."
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================
                  PASO 4: IMPACTO SOCIAL Y EMPLEO
              ======================================================== */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">4. Impacto Social y Empleo</h2>
                      <p className="text-sm text-zinc-500 mt-1">Registra el personal femenino y masculino. El total de empleados se calculará de forma automática.</p>
                    </div>
                  </div>

                  <div className="space-y-10">
                    {SOCIAL_CATEGORIES.map(category => (
                      <div key={`social-${category.id}`} className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                          <h3 className="text-sm font-bold text-zinc-900 mb-1">{category.label}</h3>
                          <p className="text-sm text-zinc-600">{category.desc}</p>
                        </div>
                        <div className="space-y-6">
                          {YEARS_SOCIAL.map(year => {
                            const yearData = socialData?.[category.id]?.[year] || {};
                            const mujeres = Number(yearData.mujeres) || 0;
                            const hombres = Number(yearData.hombres) || 0;
                            const total = mujeres + hombres;
                            const pctM = total > 0 ? ((mujeres / total) * 100).toFixed(1) : '0.0';
                            const pctH = total > 0 ? ((hombres / total) * 100).toFixed(1) : '0.0';
                            return (
                              <div key={year} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors group">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-bold text-zinc-900 flex items-center gap-1">
                                      {year} {year === '2026' && <span className="text-guinda">* (Proyectado)</span>}
                                    </label>
                                  </div>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-600">Mujeres</label>
                                    <input
                                      type="number"
                                      step="1"
                                      min="0"
                                      {...register(`social.${category.id}.${year}.mujeres`, {
                                        setValueAs: (v) => v === '' || v === undefined || v === null ? '' : String(Math.floor(Number(v)) || '')
                                      })}
                                      className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-guinda focus:border-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-900 placeholder:text-zinc-300"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-600">Hombres</label>
                                    <input
                                      type="number"
                                      step="1"
                                      min="0"
                                      {...register(`social.${category.id}.${year}.hombres`, {
                                        setValueAs: (v) => v === '' || v === undefined || v === null ? '' : String(Math.floor(Number(v)) || '')
                                      })}
                                      className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-900 placeholder:text-zinc-300"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-600">Total</label>
                                    <input
                                      type="text"
                                      value={total > 0 ? String(total) : ''}
                                      disabled
                                      className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-900 font-semibold text-sm cursor-not-allowed"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-600">% Mujeres</label>
                                    <input
                                      type="text"
                                      value={total > 0 ? `${pctM}%` : ''}
                                      disabled
                                      className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-700 text-sm cursor-not-allowed"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-600">% Hombres</label>
                                    <input
                                      type="text"
                                      value={total > 0 ? `${pctH}%` : ''}
                                      disabled
                                      className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-700 text-sm cursor-not-allowed"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================
                  PASO 5: CAPACITACIÓN Y ROTACIÓN DE PERSONAL
              ======================================================== */}
              {currentStep === 5 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">5. Capacitación y Rotación de Personal</h2>
                      <p className="text-sm text-zinc-500 mt-1">Registra las horas de capacitación en seguridad y las tasas de rotación anual.</p>
                    </div>
                  </div>

{/* CAPACITACIÓN EN SEGURIDAD */}
                  <div className="space-y-6">
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">Capacitación en Seguridad</h3>
                      <p className="text-sm text-zinc-500 mt-1">Horas de capacitación. El total se calcula automáticamente.</p>
                    </div>

                    <div className="space-y-6">
                      {YEARS_CAPACITACION.map(year => {
                        const capYear = capData?.capacitacion?.[year] || {};
                        const mCap = Number(capYear.mujeres) || 0;
                        const hCap = Number(capYear.hombres) || 0;
                        const totalCap = mCap + hCap;
                        return (
                          <div key={year} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <label className="text-sm font-bold text-zinc-900 flex items-center gap-1">
                                {year} {year === '2026' && <span className="text-guinda">* (Proyectado)</span>}
                              </label>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-600">Mujeres (hrs)</label>
                                <input type="number" step="1" min="0" {...register(`capacitacionData.capacitacion.${year}.mujeres`, { setValueAs: (v) => v === '' || v === undefined || v === null ? '' : String(Math.floor(Number(v)) || '') })} className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-900" placeholder="0" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-600">Hombres (hrs)</label>
                                <input type="number" step="1" min="0" {...register(`capacitacionData.capacitacion.${year}.hombres`, { setValueAs: (v) => v === '' || v === undefined || v === null ? '' : String(Math.floor(Number(v)) || '') })} className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-900" placeholder="0" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-600">Total (hrs)</label>
                                <input type="text" value={totalCap > 0 ? `${totalCap} hrs` : ''} disabled className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-900 font-semibold text-sm cursor-not-allowed" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* TASA DE ROTACIÓN DE PERSONAL */}
                  <div className="space-y-6">
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">Tasa de Rotación de Personal</h3>
                      <p className="text-sm text-zinc-500 mt-1">Registra las tasas. La tasa total se calcula automáticamente.</p>
                    </div>

                    <div className="space-y-6">
                      {YEARS_ROTACION.map(year => {
                        const rotYear = capData?.rotacion?.[year] || {};
                        const mRot = Number(rotYear.mujeres) || 0;
                        const hRot = Number(rotYear.hombres) || 0;
                        const totalRot = mRot > 0 || hRot > 0 ? ((mRot + hRot) / 2).toFixed(1) : '';
                        return (
                          <div key={year} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <label className="text-sm font-bold text-zinc-900">{year}</label>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-600">Mujeres (%)</label>
                                <input type="number" step="any" min="0" max="100" {...register(`capacitacionData.rotacion.${year}.mujeres`, { setValueAs: (v) => { if (v === '' || v === undefined || v === null) return ''; const n = Number(v); return isNaN(n) ? '' : String(Math.min(n, 100)); } })} className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-guinda outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-900" placeholder="0.0" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-600">Hombres (%)</label>
                                <input type="number" step="any" min="0" max="100" {...register(`capacitacionData.rotacion.${year}.hombres`, { setValueAs: (v) => { if (v === '' || v === undefined || v === null) return ''; const n = Number(v); return isNaN(n) ? '' : String(Math.min(n, 100)); } })} className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-900" placeholder="0.0" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-600">Total (%)</label>
                                <input type="text" value={totalRot !== '' ? `${totalRot}%` : ''} disabled className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-900 font-semibold text-sm cursor-not-allowed" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
                    {/* ========================================================
                  PASO 6: REVISIÓN FINAL Y ENVÍO
              ======================================================== */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
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
            <div className="flex-shrink-0 px-4 sm:px-8 py-3 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isSubmitting}
                  className="flex items-center px-4 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-zinc-200 shadow-sm hover:shadow rounded-xl transition-all disabled:opacity-0 disabled:cursor-default"
                >
                  Anterior
                </button>
              </div>

              <div className="flex items-center gap-2">
                {currentStep < STEPS.length && (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveFile}
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-xl transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4 mr-1.5" /> Guardar Archivo
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-zinc-700 hover:text-white bg-zinc-100 hover:bg-zinc-700 border border-zinc-200 hover:border-zinc-700 rounded-xl transition-all active:scale-95"
                    >
                      <FileText className="w-4 h-4 mr-1.5" /> Imprimir
                    </button>
                  </>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || readOnly || (currentStep === STEPS.length && !aceptaPrivacidad)}
                  className="flex items-center px-6 py-2.5 bg-guinda text-white text-sm font-semibold tracking-wide rounded-xl hover:bg-[#72112e] transition-all active:scale-[0.98] shadow-[0_4px_14px_rgba(138,21,56,0.39)] disabled:opacity-70 disabled:cursor-not-allowed"
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
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { Printer, FileSpreadsheet, EyeOff, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { request, API_URL } from '../../services/api';
import {
  METALS,
  UNIT_MAP,
  YEARS_ESG,
  ESG_METRICS,
  YEARS_SOCIAL,
  SOCIAL_CATEGORIES,
  YEARS_CAPACITACION,
  YEARS_ROTACION,
  esPorcentajeESG,
} from '../../config/formulario';

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const esc = (v) => String(v ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const COLORES_EMPRESA = [
  'bg-red-600', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-600', 'bg-cyan-500',
  'bg-blue-600', 'bg-purple-600', 'bg-pink-500', 'bg-stone-600', 'bg-teal-600', 'bg-rose-600',
];

const HEX_EMPRESA = [
  '#dc2626', '#f97316', '#eab308', '#84cc16', '#16a34a', '#06b6d4',
  '#2563eb', '#7c3aed', '#ec4899', '#8b5a2b', '#0d9488', '#d61f69',
];

function colorEmpresa(nombre) {
  let h = 0;
  const s = String(nombre || '');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % COLORES_EMPRESA.length;
}

function Distintivo({ nombre, className }) {
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${COLORES_EMPRESA[colorEmpresa(nombre)]} ${className || ''}`} aria-hidden="true" />
  );
}

function agregarTotales(formas) {
  const res = { produccion: {}, esg: {}, social: {}, capacitacionData: { capacitacion: {}, rotacion: {} } };

  YEARS_ESG.forEach((y) => {
    res.produccion[y] = {};
    METALS.forEach((m) => { res.produccion[y][m.key] = ''; });
  });

  ESG_METRICS.forEach((met) => {
    res.esg[met.id] = { comentarios: '' };
    YEARS_ESG.forEach((y) => { res.esg[met.id][y] = ''; });
  });

  SOCIAL_CATEGORIES.forEach((cat) => {
    res.social[cat.id] = {};
    YEARS_SOCIAL.forEach((y) => { res.social[cat.id][y] = { mujeres: 0, hombres: 0 }; });
  });

  YEARS_CAPACITACION.forEach((y) => { res.capacitacionData.capacitacion[y] = { mujeres: 0, hombres: 0 }; });
  YEARS_ROTACION.forEach((y) => { res.capacitacionData.rotacion[y] = { mujeres: [], hombres: [] }; });

  formas.forEach((f) => {
    YEARS_ESG.forEach((y) => {
      const p = f.produccion?.[y] || {};
      METALS.forEach((m) => {
        const acc = num(res.produccion[y][m.key]) + num(p[m.key]);
        res.produccion[y][m.key] = acc ? String(+acc.toFixed(6)) : '';
      });
    });

    SOCIAL_CATEGORIES.forEach((cat) => {
      YEARS_SOCIAL.forEach((y) => {
        const s = f.social?.[cat.id]?.[y] || {};
        res.social[cat.id][y].mujeres += num(s.mujeres);
        res.social[cat.id][y].hombres += num(s.hombres);
      });
    });

    YEARS_CAPACITACION.forEach((y) => {
      const c = f.capacitacionData?.capacitacion?.[y] || {};
      res.capacitacionData.capacitacion[y].mujeres += num(c.mujeres);
      res.capacitacionData.capacitacion[y].hombres += num(c.hombres);
    });

    YEARS_ROTACION.forEach((y) => {
      const r = f.capacitacionData?.rotacion?.[y] || {};
      if (r.mujeres !== undefined && r.mujeres !== null && r.mujeres !== '') {
        res.capacitacionData.rotacion[y].mujeres.push(num(r.mujeres));
      }
      if (r.hombres !== undefined && r.hombres !== null && r.hombres !== '') {
        res.capacitacionData.rotacion[y].hombres.push(num(r.hombres));
      }
    });
  });

  ESG_METRICS.forEach((met) => {
    const porc = esPorcentajeESG(met.id);
    const comentarios = [];
    YEARS_ESG.forEach((y) => {
      if (porc) {
        const vals = formas
          .map((f) => f.esg?.[met.id]?.[y])
          .filter((v) => v !== undefined && v !== null && v !== '')
          .map(num);
        res.esg[met.id][y] = vals.length ? String(+((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))) : '';
      } else {
        const acc = formas.reduce((a, f) => a + num(f.esg?.[met.id]?.[y]), 0);
        res.esg[met.id][y] = acc ? String(+acc.toFixed(2)) : '';
      }
    });
    const lista = [];
    formas.forEach((f) => {
      const txt = f.esg?.[met.id]?.comentarios;
      if (txt && String(txt).trim()) {
        const nombre = f.empresa || f.username;
        lista.push({ nombre, texto: txt });
        comentarios.push(`${nombre}: ${txt}`);
      }
    });
    res.esg[met.id].comentarios = comentarios.join('\n');
    res.esg[met.id].comentariosLista = lista;
  });

  YEARS_ROTACION.forEach((y) => {
    const avg = (arr) => (arr.length ? String(+((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))) : '');
    res.capacitacionData.rotacion[y] = {
      mujeres: avg(res.capacitacionData.rotacion[y].mujeres),
      hombres: avg(res.capacitacionData.rotacion[y].hombres),
    };
  });

  return res;
}

function Valor({ value, className }) {
  return (
    <div className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 text-sm flex items-center ${className || ''}`}>
      <span className="break-words whitespace-pre-wrap">{value || '—'}</span>
    </div>
  );
}

function Leyenda({ tipo }) {
  return (
    <span className={`shrink-0 text-xs font-bold uppercase tracking-wider ${
      tipo === 'acumulado' ? 'text-blue-700' : 'text-emerald-700'
    }`}>
      {tipo === 'acumulado' ? 'Acumulado' : 'Promedio'}
    </span>
  );
}

function Seccion({ numero, titulo, subtitulo, leyenda, children }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">{numero}. {titulo}</h2>
          {subtitulo && <p className="text-sm text-zinc-500 mt-1">{subtitulo}</p>}
        </div>
        {leyenda && <Leyenda tipo={leyenda} />}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function DatosGenerales({ data, esAgregado, companias, formas }) {
  const campos = [
    ['Empresa Matriz', 'empresaMatriz'],
    ['País de Origen del Capital', 'paisOrigen'],
    ['Subsidiaria', 'subsidiaria'],
    ['Unidad Minera', 'unidadMinera'],
    ['Tipo de Minado', 'tipoMinado'],
    ['Fecha de Inicio', 'fechaInicio'],
    ['Vida Útil (Años)', 'vidaUtil'],
    ['Capacidad (t/día)', 'capacidad'],
  ];
  return (
    <Seccion numero="1" titulo="Información General" subtitulo="Identificación de la unidad y capacidades operativas.">
      {esAgregado && companias.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Empresas incluidas ({companias.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {companias.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 border border-zinc-200 rounded-full px-3 py-1">
                <Distintivo nombre={c} />
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
      {esAgregado ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {formas.map((f) => {
            const nombre = f.empresa || f.username;
            return (
              <div key={f.id || f.username} className="rounded-2xl border border-zinc-200 overflow-hidden">
                <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-100 flex items-center gap-2">
                  <Distintivo nombre={nombre} className="w-3 h-3" />
                  <h3 className="text-sm font-semibold text-zinc-900 truncate">{nombre}</h3>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {campos.map(([label, key]) => (
                    <div key={label} className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">{label}</label>
                      <Valor value={f[key]} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campos.map(([label, key]) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">{label}</label>
              <Valor value={data[key]} />
            </div>
          ))}
        </div>
      )}
    </Seccion>
  );
}

function Produccion({ data, esAgregado }) {
  return (
    <Seccion numero="2" titulo="Producción" subtitulo="Volumen total extraído por año." leyenda={esAgregado ? 'acumulado' : undefined}>
      <div className="border border-zinc-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-zinc-700">Año</th>
              {METALS.map((m) => (
                <th key={m.key} scope="col" className="px-4 py-3 font-semibold text-right text-zinc-700">
                  {m.label} <span className="text-zinc-500 font-normal">({m.unit})</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {YEARS_ESG.map((y) => (
              <tr key={y} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-semibold text-zinc-900">
                  {y}{y === '2026' && <span className="text-guinda ml-0.5">*</span>}
                </td>
                {METALS.map((m) => {
                  const v = data.produccion?.[y]?.[m.key];
                  return (
                    <td key={m.key} className="px-4 py-3 text-right text-zinc-800">
                      {v ? `${v}${UNIT_MAP[m.key]}` : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-zinc-900 mt-3"><span className="text-guinda">*</span> Proyectado</div>
    </Seccion>
  );
}

function ESGSeccion({ data, esAgregado }) {
  return (
    <Seccion numero="3" titulo="Indicadores Ambientales, Sociales y de Gobernanza (ESG)" subtitulo="Métricas por año y acciones realizadas.">
      <div className="space-y-4">
        {ESG_METRICS.map((met) => {
          const esg = data.esg?.[met.id] || {};
          return (
            <div key={met.id} className="rounded-2xl border border-zinc-200 overflow-hidden">
              <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-100">
                <h3 className="text-base font-semibold text-black">{met.fullTitle}</h3>
              </div>
              <div className="border-t border-zinc-200 overflow-x-auto">
                <table className="w-full text-base border-collapse">
                  <thead className="bg-zinc-50">
                    <tr>
                      {YEARS_ESG.map((y) => (
                        <th scope="col" key={y} className="px-4 py-3 text-center font-semibold text-black border border-zinc-300">
                          {y}{y === '2026' && <span className="text-guinda ml-0.5">*</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {YEARS_ESG.map((y) => (
                        <td key={y} className="px-4 py-3 text-center text-black font-semibold border border-zinc-300">
                          {esg[y] ? `${esg[y]}${UNIT_MAP[met.id] || ''}` : '—'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="border-t border-zinc-200">
                <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-100">
                  <h3 className="text-base font-semibold text-black">Acciones más importantes realizadas del periodo 2023-2026</h3>
                </div>
                <div className="p-5">
                  <div className="border border-zinc-300 rounded-xl overflow-hidden">
                    <table className="w-full text-base border-collapse">
                      <thead className="bg-zinc-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left font-semibold text-black border border-zinc-300 w-48">Empresa</th>
                          <th scope="col" className="px-4 py-3 text-left font-semibold text-black border border-zinc-300">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(esAgregado && esg.comentariosLista && esg.comentariosLista.length > 0
                          ? esg.comentariosLista
                          : esg.comentarios
                            ? [{ nombre: data?.empresa || data?.username || 'Empresa', texto: esg.comentarios }]
                            : []
                        ).filter((i) => i.texto && String(i.texto).trim()).map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-left text-black font-medium border border-zinc-300">
                              <span className="inline-flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full inline-block ${COLORES_EMPRESA[colorEmpresa(item.nombre)]}`} />
                                {item.nombre}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-left text-black border border-zinc-300 break-words whitespace-pre-wrap">
                              {item.texto}
                            </td>
                          </tr>
                        ))}
                        {(esAgregado && esg.comentariosLista && esg.comentariosLista.length > 0
                          ? esg.comentariosLista
                          : esg.comentarios
                            ? [{ nombre: data?.empresa || data?.username || 'Empresa', texto: esg.comentarios }]
                            : []
                        ).filter((i) => i.texto && String(i.texto).trim()).length === 0 && (
                          <tr>
                            <td colSpan={2} className="px-4 py-3 text-center text-black border border-zinc-300">—</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Seccion>
  );
}

function SocialSeccion({ data, esAgregado }) {
  return (
    <Seccion numero="4" titulo="Impacto Social y Empleo" subtitulo="Personal femenino y masculino por categoría." leyenda={esAgregado ? 'acumulado' : undefined}>
      <div className="space-y-8">
        {SOCIAL_CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <div className="mb-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900 mb-1">{cat.label}</h3>
              <p className="text-sm text-zinc-600">{cat.desc}</p>
            </div>
            <div className="border border-zinc-200 rounded-2xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-700">Año</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-zinc-700">Mujeres</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-zinc-700">Hombres</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-zinc-700">Total</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-zinc-700">% Mujeres</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-zinc-700">% Hombres</th>
                  </tr>
                </thead>
                <tbody>
                  {YEARS_SOCIAL.map((y) => {
                    const s = data.social?.[cat.id]?.[y] || {};
                    const m = num(s.mujeres);
                    const h = num(s.hombres);
                    const t = m + h;
                    const pM = t > 0 ? ((m / t) * 100).toFixed(1) : '0.0';
                    const pH = t > 0 ? ((h / t) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={y} className="border-t border-zinc-100">
                        <td className="px-4 py-3 font-semibold text-zinc-900">
                          {y}{y === '2026' && <span className="text-guinda ml-0.5">*</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-800">{m || '—'}</td>
                        <td className="px-4 py-3 text-right text-zinc-800">{h || '—'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-zinc-900">{t || '—'}</td>
                        <td className="px-4 py-3 text-right text-zinc-600">{t > 0 ? `${pM}%` : '—'}</td>
                        <td className="px-4 py-3 text-right text-zinc-600">{t > 0 ? `${pH}%` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </Seccion>
  );
}

function CapacitacionSeccion({ data, esAgregado }) {
  const cap = data.capacitacionData?.capacitacion || {};
  const rot = data.capacitacionData?.rotacion || {};
  return (
    <Seccion numero="5" titulo="Capacitación y Rotación de Personal" subtitulo="Horas de capacitación en seguridad y tasas de rotación anual.">
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-semibold text-zinc-900">Capacitación en Seguridad (Horas)</h3>
            {esAgregado && <Leyenda tipo="acumulado" />}
          </div>
          <div className="border border-zinc-200 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700">Año</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-zinc-700">Mujeres</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-zinc-700">Hombres</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-zinc-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {YEARS_CAPACITACION.map((y) => {
                  const c = cap[y] || {};
                  const m = num(c.mujeres);
                  const h = num(c.hombres);
                  const t = m + h;
                  return (
                    <tr key={y} className="border-t border-zinc-100">
                      <td className="px-4 py-3 font-semibold text-zinc-900">
                        {y}{y === '2026' && <span className="text-guinda ml-0.5">*</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-800">{m ? `${m} hrs` : '—'}</td>
                      <td className="px-4 py-3 text-right text-zinc-800">{h ? `${h} hrs` : '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-zinc-900">{t ? `${t} hrs` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-semibold text-zinc-900">Tasa de Rotación de Personal (%)</h3>
            {esAgregado && <Leyenda tipo="promedio" />}
          </div>
          <div className="border border-zinc-200 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700">Año</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-zinc-700">Mujeres</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-zinc-700">Hombres</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-zinc-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {YEARS_ROTACION.map((y) => {
                  const r = rot[y] || {};
                  const m = num(r.mujeres);
                  const h = num(r.hombres);
                  const t = m > 0 || h > 0 ? ((m + h) / 2).toFixed(1) : '';
                  return (
                    <tr key={y} className="border-t border-zinc-100">
                      <td className="px-4 py-3 font-semibold text-zinc-900">{y}</td>
                      <td className="px-4 py-3 text-right text-zinc-800">{m ? `${m}%` : '—'}</td>
                      <td className="px-4 py-3 text-right text-zinc-800">{h ? `${h}%` : '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-zinc-900">{t !== '' ? `${t}%` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Seccion>
  );
}

function generarHTMLInforme(data, titulo, esAgregado, companias, formas) {
  const th = 'text-align:left;padding:6px 8px;border:1px solid #ccc;background:#eee;font-weight:700;';
  const thR = `text-align:right;padding:6px 8px;border:1px solid #ccc;background:#eee;font-weight:700;`;
  const td = 'padding:6px 8px;border:1px solid #ccc;';
  const tdR = 'text-align:right;padding:6px 8px;border:1px solid #ccc;';
  const tdL = 'padding:6px 8px;border:1px solid #ccc;font-weight:600;';
  const badge = (tipo) => `<span style="float:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${tipo === 'acumulado' ? '#1d4ed8' : '#047857'};">${tipo === 'acumulado' ? 'Acumulado' : 'Promedio'}</span>`;

  let content = `<h1 style="font-size:20px;color:#8A1538;margin:0 0 4px;">SEFODECO — Informe Minero Estatal</h1>
    <p style="margin:0 0 4px;font-size:13px;color:#333;">Empresa(s): <strong>${esc(titulo)}</strong></p>`;
  if (esAgregado && companias.length) {
    content += `<p style="margin:0 0 16px;font-size:12px;color:#555;">Comprende ${companias.length} reporte(s): ${esc(companias.join(', '))}</p>`;
  } else {
    content += `<p style="margin:0 0 16px;font-size:12px;color:#555;">&nbsp;</p>`;
  }

  content += `<h2 style="font-size:15px;color:#8A1538;margin:18px 0 8px;">1. Información General</h2>`;
  const camposGeneral = [
    ['Empresa Matriz', 'empresaMatriz'],
    ['País de Origen del Capital', 'paisOrigen'],
    ['Subsidiaria', 'subsidiaria'],
    ['Unidad Minera', 'unidadMinera'],
    ['Tipo de Minado', 'tipoMinado'],
    ['Fecha de Inicio', 'fechaInicio'],
    ['Vida Útil (Años)', 'vidaUtil'],
    ['Capacidad (t/día)', 'capacidad'],
  ];
  if (esAgregado && formas.length) {
    formas.forEach((f) => {
      const nombre = f.empresa || f.username;
      content += `<h3 style="font-size:13px;color:#333;margin:12px 0 6px;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${HEX_EMPRESA[colorEmpresa(nombre)]};margin-right:6px;"></span>${esc(nombre)}</h3>
        <table style="width:100%;border-collapse:collapse;">
          ${camposGeneral.map(([label, key]) => `<tr><td style="${tdL}width:40%;background:#fafafa;">${label}</td><td style="${td}">${esc(f[key])}</td></tr>`).join('')}
        </table>`;
    });
  } else {
    content += `<table style="width:100%;border-collapse:collapse;">
      ${camposGeneral.map(([label, key]) => `<tr><td style="${tdL}width:40%;background:#fafafa;">${label}</td><td style="${td}">${esc(data[key])}</td></tr>`).join('')}
    </table>`;
  }

  content += `<h2 style="font-size:15px;color:#8A1538;margin:18px 0 8px;overflow:hidden;">2. Producción${esAgregado ? badge('acumulado') : ''}</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><th style="${th}">Año</th>${METALS.map((m) => `<th style="${thR}">${m.label}</th>`).join('')}</tr>`;
  YEARS_ESG.forEach((y) => {
    const p = data.produccion?.[y] || {};
    content += `<tr><td style="${tdL}">${y}</td>${METALS.map((m) => `<td style="${tdR}">${p[m.key] ? `${esc(p[m.key])}${UNIT_MAP[m.key]}` : ''}</td>`).join('')}</tr>`;
  });
  content += `</table>`;

  content += `<h2 style="font-size:15px;color:#8A1538;margin:18px 0 8px;">3. Indicadores Ambientales, Sociales y de Gobernanza (ESG)</h2>`;
  ESG_METRICS.forEach((met) => {
    const esg = data.esg?.[met.id] || {};
    content += `<h3 style="font-size:13px;color:#000;margin:12px 0 6px;">${esc(met.fullTitle)}</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr>${YEARS_ESG.map((y) => `<th style="text-align:center;padding:6px 8px;border:1px solid #999;background:#eee;font-weight:700;">${y}${y === '2026' ? '*' : ''}</th>`).join('')}</tr>
        <tr>${YEARS_ESG.map((y) => `<td style="text-align:center;padding:6px 8px;border:1px solid #999;font-weight:600;">${esg[y] ? `${esc(esg[y])}${UNIT_MAP[met.id] || ''}` : ''}</td>`).join('')}</tr>
      </table>`;
    const lista = esAgregado && esg.comentariosLista && esg.comentariosLista.length > 0
      ? esg.comentariosLista
      : esg.comentarios
        ? [{ nombre: data?.empresa || data?.username || 'Empresa', texto: esg.comentarios }]
        : [];
    const filas = lista.filter((i) => i.texto && String(i.texto).trim());
    content += `<h3 style="font-size:13px;color:#000;margin:14px 0 6px;">Acciones más importantes realizadas del periodo 2023-2026</h3>`;
    if (filas.length) {
      content += `<table style="width:100%;border-collapse:collapse;">
        <tr><th style="${th}width:30%;">Empresa</th><th style="${th}">Acciones</th></tr>
        ${filas.map((item) => `<tr><td style="${tdL}"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${HEX_EMPRESA[colorEmpresa(item.nombre)]};margin-right:5px;"></span>${esc(item.nombre)}</td><td style="${td}">${esc(item.texto)}</td></tr>`).join('')}
      </table>`;
    }
  });

  content += `<h2 style="font-size:15px;color:#8A1538;margin:18px 0 8px;">4. Impacto Social y Empleo${esAgregado ? badge('acumulado') : ''}</h2>`;
  SOCIAL_CATEGORIES.forEach((cat) => {
    content += `<h3 style="font-size:13px;color:#333;margin:12px 0 6px;">${cat.label}</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><th style="${th}">Año</th><th style="${thR}">Mujeres</th><th style="${thR}">Hombres</th><th style="${thR}">Total</th><th style="${thR}">% Mujeres</th><th style="${thR}">% Hombres</th></tr>`;
    YEARS_SOCIAL.forEach((y) => {
      const s = data.social?.[cat.id]?.[y] || {};
      const m = num(s.mujeres);
      const h = num(s.hombres);
      const t = m + h;
      const pM = t > 0 ? ((m / t) * 100).toFixed(1) : '0.0';
      const pH = t > 0 ? ((h / t) * 100).toFixed(1) : '0.0';
      content += `<tr><td style="${tdL}">${y}</td><td style="${tdR}">${m || ''}</td><td style="${tdR}">${h || ''}</td><td style="${tdR}">${t || ''}</td><td style="${tdR}">${t > 0 ? `${pM}%` : ''}</td><td style="${tdR}">${t > 0 ? `${pH}%` : ''}</td></tr>`;
    });
    content += `</table>`;
  });

  const cap = data.capacitacionData?.capacitacion || {};
  const rot = data.capacitacionData?.rotacion || {};
  content += `<h2 style="font-size:15px;color:#8A1538;margin:18px 0 8px;">5. Capacitación y Rotación de Personal</h2>
    <h3 style="font-size:13px;color:#333;margin:12px 0 6px;">Capacitación en Seguridad (Horas)${esAgregado ? badge('acumulado') : ''}</h3>
    <table style="width:100%;border-collapse:collapse;">
      <tr><th style="${th}">Año</th><th style="${thR}">Mujeres</th><th style="${thR}">Hombres</th><th style="${thR}">Total</th></tr>`;
  YEARS_CAPACITACION.forEach((y) => {
    const c = cap[y] || {};
    const m = num(c.mujeres);
    const h = num(c.hombres);
    const t = m + h;
    content += `<tr><td style="${tdL}">${y}</td><td style="${tdR}">${m ? `${m} hrs` : ''}</td><td style="${tdR}">${h ? `${h} hrs` : ''}</td><td style="${tdR}">${t ? `${t} hrs` : ''}</td></tr>`;
  });
  content += `</table>
    <h3 style="font-size:13px;color:#333;margin:12px 0 6px;">Tasa de Rotación de Personal (%)${esAgregado ? badge('promedio') : ''}</h3>
    <table style="width:100%;border-collapse:collapse;">
      <tr><th style="${th}">Año</th><th style="${thR}">Mujeres</th><th style="${thR}">Hombres</th><th style="${thR}">Total</th></tr>`;
  YEARS_ROTACION.forEach((y) => {
    const r = rot[y] || {};
    const m = num(r.mujeres);
    const h = num(r.hombres);
    const t = m > 0 || h > 0 ? ((m + h) / 2).toFixed(1) : '';
    content += `<tr><td style="${tdL}">${y}</td><td style="${tdR}">${m ? `${m}%` : ''}</td><td style="${tdR}">${h ? `${h}%` : ''}</td><td style="${tdR}">${t !== '' ? `${t}%` : ''}</td></tr>`;
  });
  content += `</table>`;

  content += `<p style="text-align:center;margin-top:24px;font-size:10px;color:#999;">Documento generado por la Secretaría de Fomento y Desarrollo Económico el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>`;

  return `<!DOCTYPE html><html><head><title>Informe ${titulo}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; color: #000; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th, td { padding: 6px 8px; border: 1px solid #999; text-align: left; font-size: 11px; }
      th { background: #eee; font-weight: 700; }
      h2 { color: #8A1538; margin: 18px 0 8px; font-size: 15px; }
      h3 { margin: 12px 0 6px; font-size: 13px; color: #333; }
      @media print { body { padding: 0; } }
    </style></head><body>${content}</body></html>`;
}

export default function AdminFormularios() {
  const [formas, setFormas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccion, setSeleccion] = useState('todas');

  useEffect(() => {
    (async () => {
      try {
        const [f, u] = await Promise.all([request('/formularios'), request('/usuarios')]);
        setFormas(f);
        setEmpresas(u.sort((a, b) => (a.empresa || '').localeCompare(b.empresa || '')));
      } catch (error) {
        toast.error(error.message || 'Error al cargar los reportes');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formasFiltradas = useMemo(() => {
    if (seleccion === 'todas') return formas;
    return formas.filter((f) => f.username === seleccion);
  }, [seleccion, formas]);

  const esAgregado = seleccion === 'todas';

  const data = useMemo(() => {
    if (esAgregado) return agregarTotales(formasFiltradas);
    return formasFiltradas[0] || null;
  }, [esAgregado, formasFiltradas]);

  const companiasIncluidas = useMemo(() => {
    return [...new Set(formasFiltradas.map((f) => f.empresa || f.username).filter(Boolean))].sort();
  }, [formasFiltradas]);

  const titulo = esAgregado
    ? 'Todas las empresas'
    : (empresas.find((e) => e.username === seleccion)?.empresa || seleccion);

  const handleImprimir = () => {
    if (!data) return;
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(generarHTMLInforme(data, titulo, esAgregado, companiasIncluidas, formasFiltradas));
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 300);
  };

  const handleExcel = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_URL}/formularios/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al exportar');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="(.+)"/);
      link.download = match ? match[1] : `Reportes_Mineria_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Reportes descargados correctamente');
    } catch {
      toast.error('Error al descargar los reportes');
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-guinda rounded-full animate-spin" />
        <p className="text-zinc-500 font-medium text-sm">Cargando reportes de las empresas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">Reportes de Empresas</h1>
        <p className="text-sm text-zinc-500 mt-1">Respuestas tal como fueron enviadas en el formulario. Selecciona una empresa o consulta los totales agregados.</p>
      </header>

      {/* Barra de selección y acciones */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 bg-[#FAFAFA]/95 backdrop-blur border-b border-zinc-200">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <select
              value={seleccion}
              onChange={(e) => setSeleccion(e.target.value)}
              aria-label="Seleccionar empresa"
              className="w-full h-11 pl-4 pr-10 rounded-xl border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda transition text-sm text-zinc-800 appearance-none cursor-pointer shadow-sm"
            >
              <option value="todas">Todas las empresas (totales agregados)</option>
              {empresas.map((u) => (
                <option key={u.username} value={u.username}>{u.empresa}</option>
              ))}
            </select>
            <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">▼</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleImprimir}
              disabled={!data}
              className="h-11 px-4 bg-zinc-900 hover:bg-black text-white rounded-xl text-sm font-medium transition shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Imprimir el informe completo"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Informe</span>
            </button>
            <button
              onClick={handleExcel}
              className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition shadow-sm flex items-center justify-center gap-2 active:scale-95"
              title="Descargar reportes en Excel (una hoja por sección)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Descargar Excel</span>
            </button>
          </div>
        </div>
      </div>

      {formasFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-16 text-center">
          <EyeOff className="w-12 h-12 text-zinc-300 mx-auto mb-3" strokeWidth={1.2} />
          <p className="text-sm font-medium text-zinc-600">
            {esAgregado
              ? 'Aún no hay reportes enviados por las empresas.'
              : `${titulo} aún no ha enviado su reporte.`}
          </p>
        </div>
      ) : (
        <>
          <div className={`rounded-2xl border px-5 py-3.5 text-sm flex items-center gap-2.5 ${esAgregado ? 'bg-guinda/5 border-guinda/20 text-guinda' : 'bg-zinc-100 border-zinc-200 text-zinc-700'}`}>
            <Users className="w-4 h-4" />
            <span>
              {esAgregado
                ? `Mostrando totales agregados de ${formasFiltradas.length} reporte(s) de ${companiasIncluidas.length} empresa(s).`
                : `Reporte de ${titulo}`}
            </span>
          </div>

          <div className="space-y-8">
            <DatosGenerales data={data} esAgregado={esAgregado} companias={companiasIncluidas} formas={formasFiltradas} />
            <Produccion data={data} esAgregado={esAgregado} />
            <ESGSeccion data={data} esAgregado={esAgregado} />
            <SocialSeccion data={data} esAgregado={esAgregado} />
            <CapacitacionSeccion data={data} esAgregado={esAgregado} />
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Building2, FileText, Clock, TrendingUp, CheckCircle2, Download } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';
import { request, API_URL } from '../../services/api';

const COMPANY_COLORS = [
  '#8A1538', '#C09A5B', '#2563EB', '#16A34A', '#DC2626',
  '#D97706', '#7C3AED', '#0891B2', '#DB2777', '#65A30D',
  '#0D9488', '#9333EA', '#EA580C', '#4F46E5', '#0284C7',
];

const ESG_CONFIG = [
  { key: 'incidentes', label: 'Incidentes Ambientales', unit: 'Casos' },
  { key: 'cumplimiento', label: 'Cumplimiento Normativo', unit: '%' },
  { key: 'agua-reciclada', label: 'Agua Reciclada', unit: '%' },
  { key: 'reduccion-gei', label: 'Reducción GEI', unit: '%' },
  { key: 'reforestacion', label: 'Reforestación', unit: 'Árboles' },
  { key: 'inversion', label: 'Inversión Ambiental', unit: 'Millones USD' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await request('/estadisticas');
      setStats(data);
    } catch (error) {
      toast.error('Error al cargar las métricas del servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-guinda rounded-full animate-spin" />
        <p className="text-zinc-500 font-medium text-sm">Sincronizando base de datos minera...</p>
      </div>
    );
  }

  const complianceRate = stats ? Math.round((stats.completados / stats.totalUsuarios) * 100) : 0;

  const handleDownloadReportes = async () => {
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
      link.download = match ? match[1] : `Reportes_Mineria_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Reportes descargados correctamente');
    } catch {
      toast.error('Error al descargar los reportes');
    }
  };
  const isHealthy = complianceRate >= 80;
  const companias = stats?.companias ?? [];

  function tendenciaLabel(val) {
    if (val > 0) return `+${val}%`;
    if (val < 0) return `${val}%`;
    return '0%';
  }

  function tendenciaColor(val) {
    if (val > 0) return 'text-emerald-600';
    if (val < 0) return 'text-red-600';
    return 'text-zinc-500';
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">Dashboard General</h1>
          <p className="text-sm text-zinc-500 mt-1">Visión estatal del sector minero y cumplimiento normativo.</p>
        </div>
        <button
          onClick={handleDownloadReportes}
          className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 shrink-0"
          title="Descargar todos los reportes en Excel"
        >
          <Download className="w-4 h-4" />
          <span>Descargar Reportes</span>
        </button>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard title="Total Empresas" value={stats?.totalUsuarios} icon={Building2} />
        <KpiCard title="Reportes Recibidos" value={stats?.completados} icon={FileText} />
        <KpiCard title="Pendientes" value={stats?.pendientes} icon={Clock} />
        <KpiCard title="Cumplimiento" value={`${complianceRate}%`} icon={TrendingUp} highlight={!isHealthy} />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {(['oro', 'plata', 'cobre', 'plomo', 'zinc']).map((metal) => (
          <div key={metal} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{metal}</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{stats?.totalesMetal?.[metal]?.toLocaleString() ?? '-'}</p>
            <p className={`text-xs font-semibold mt-0.5 ${tendenciaColor(stats?.tendencias?.[metal])}`}>
              {tendenciaLabel(stats?.tendencias?.[metal])}
            </p>
          </div>
        ))}
      </section>

      {(['oro', 'plata']).map((metal) => (
        <ChartCard
          key={metal}
          title={`Producción de ${metal.charAt(0).toUpperCase() + metal.slice(1)}`}
          subtitle={metal === 'oro' ? 'Onzas por empresa' : 'Onzas por empresa'}
          data={stats?.produccionEmpresas?.[metal]}
          companias={companias}
          unit="Oz"
        />
      ))}

      {(['cobre', 'plomo', 'zinc']).map((metal) => (
        <ChartCard
          key={metal}
          title={`Producción de ${metal.charAt(0).toUpperCase() + metal.slice(1)}`}
          subtitle="Toneladas por empresa"
          data={stats?.produccionEmpresas?.[metal]}
          companias={companias}
          unit="t"
        />
      ))}

      {ESG_CONFIG.map((esg) => (
        <ChartCard
          key={esg.key}
          title={esg.label}
          subtitle={`${esg.unit} por empresa`}
          data={stats?.esgEmpresas?.[esg.key]}
          companias={companias}
          unit={esg.unit}
        />
      ))}

      <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-zinc-200">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">Últimas Recepciones</h3>
          <p className="text-sm text-zinc-500">Registro de envíos recibidos.</p>
        </div>
        <div className="space-y-4">
          {stats?.empresas?.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No hay reportes recientes.</p>
            </div>
          ) : (
            stats?.empresas?.map((empresa, idx) => (
              <article key={idx} className="flex items-start gap-4 p-3 hover:bg-zinc-50 rounded-xl transition-colors group">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-guinda transition-colors">{empresa.empresa}</h4>
                  <time className="text-xs text-zinc-500 mt-1 block">
                    {new Date(empresa.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                  </time>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

    </div>
  );
}

function KpiCard({ title, value, icon: Icon, highlight }) {
  const isPositive = !highlight;
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-zinc-500">{title}</h3>
        <div className={`p-2.5 rounded-xl ${isPositive ? 'bg-guinda/10' : 'bg-amber-100'}`}>
          <Icon className={`w-5 h-5 ${isPositive ? 'text-guinda' : 'text-amber-600'}`} />
        </div>
      </div>
      <span className={`text-3xl font-bold tracking-tight ${isPositive ? 'text-zinc-900' : 'text-amber-600'}`}>{value ?? '-'}</span>
    </div>
  );
}

function ChartCard({ title, subtitle, data, companias, unit }) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-zinc-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">{title}</h3>
        <p className="text-sm text-zinc-500">{subtitle}</p>
      </div>
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E4E4E7" />
                <XAxis dataKey="año" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E4E4E7', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                  labelStyle={{ color: '#71717A', marginBottom: '4px', fontSize: '12px' }}
                  formatter={(value, name) => [`${value?.toLocaleString() ?? '0'} ${unit}`, name]}
                />
                {companias.map((empresa, idx) => (
                  <Line
                    key={empresa}
                    type="linear"
                    dataKey={empresa}
                    stroke={COMPANY_COLORS[idx % COMPANY_COLORS.length]}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: COMPANY_COLORS[idx % COMPANY_COLORS.length], strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="w-48 flex-shrink-0 border-l border-zinc-100 pl-6">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Empresas</p>
          <div className="space-y-2.5">
            {companias.map((empresa, idx) => (
              <div key={empresa} className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COMPANY_COLORS[idx % COMPANY_COLORS.length] }}
                />
                <span className="text-sm font-medium text-zinc-700 truncate">{empresa}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

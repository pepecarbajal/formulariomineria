import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trash2, UserPlus, Building2, UserCircle, KeyRound, Search, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../services/api';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [eliminarUser, setEliminarUser] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const data = await request('/usuarios');
      setUsuarios(data);
    } catch (error) {
      toast.error('Error al cargar la lista de usuarios');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await request('/usuarios', { method: 'POST', body: JSON.stringify(data) });
      await fetchUsuarios();
      toast.success('Empresa registrada con éxito');
      reset();
    } catch (error) {
      toast.error(error.message || 'Error al registrar la empresa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (username) => {
    setEliminarUser(username);
  };

  const confirmarDelete = async () => {
    if (!eliminarUser) return;
    try {
      await request(`/usuarios/${eliminarUser}`, { method: 'DELETE' });
      await fetchUsuarios();
      toast.success('Acceso revocado');
    } catch (error) {
      toast.error('Error al eliminar');
    } finally {
      setEliminarUser(null);
    }
  };

  const filteredUsers = usuarios.filter(u => 
    u.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // NUEVA FUNCIÓN: Exportar a Excel
  const handleExportExcel = () => {
    if (filteredUsers.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    // Cabeceras del Excel
    const headers = ['ID', 'Razón Social', 'Nombre de Usuario'];
    
    // Mapeo de datos respetando comas internas y saltos de línea
    const csvRows = filteredUsers.map(user => {
      return `"${user.id || ''}","${user.empresa}","${user.username}"`;
    });

    // Unir cabeceras y datos
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Blob con BOM (\uFEFF) para forzar la lectura correcta de acentos en Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Creación y ejecución de enlace fantasma
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Directorio_Empresas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Archivo Excel generado correctamente');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Gestión de Accesos</h1>
        <p className="text-sm text-zinc-500 mt-1">Crea, administra y exporta las credenciales de las entidades reguladas.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* PANEL IZQUIERDO: FORMULARIO */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 sticky top-24">
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
            <div className="p-2 bg-[#8A1538]/10 text-[#8A1538] rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Alta de Empresa</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="empresa-nueva" className="text-sm font-semibold text-zinc-700">Razón Social</label>
              <div className="relative group">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-[#8A1538] transition-colors" />
                <input 
                  id="empresa-nueva"
                  autoComplete="organization"
                  {...register('empresa')} required
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-300 focus:border-[#8A1538] focus:ring-4 focus:ring-[#8A1538]/10 outline-none transition text-sm bg-zinc-50 focus:bg-white"
                  placeholder="Ej. Minera Media Luna"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="username-nuevo" className="text-sm font-semibold text-zinc-700">Nombre de Usuario</label>
              <div className="relative group">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-[#8A1538] transition-colors" />
                <input 
                  id="username-nuevo"
                  autoComplete="off"
                  {...register('username')} required
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-300 focus:border-[#8A1538] focus:ring-4 focus:ring-[#8A1538]/10 outline-none transition text-sm bg-zinc-50 focus:bg-white"
                  placeholder="Identificador único"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="password-nuevo" className="text-sm font-semibold text-zinc-700">Contraseña Temporal</label>
              <div className="relative group">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-[#8A1538] transition-colors" />
                <input 
                  id="password-nuevo"
                  type="password" autoComplete="new-password" {...register('password')} required
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-300 focus:border-[#8A1538] focus:ring-4 focus:ring-[#8A1538]/10 outline-none transition text-sm bg-zinc-50 focus:bg-white"
                  placeholder="Generar clave segura"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-11 mt-2 bg-[#8A1538] hover:bg-[#6b102b] text-white rounded-xl text-sm font-semibold transition active:scale-[0.98] shadow-md shadow-[#8A1538]/20 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Registrando...' : 'Generar Credenciales'}
            </button>
          </form>
        </div>

        {/* PANEL DERECHO: TABLA DE USUARIOS */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col min-h-[500px]">
          
          {/* Header de la Tabla con Buscador y Botón Excel */}
          <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
            <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Directorio Activo</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Buscador */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                <input
                  id="buscar-empresa"
                  type="text"
                  aria-label="Buscar empresa o usuario"
                  placeholder="Buscar empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-zinc-200 focus:border-[#8A1538] focus:ring-4 focus:ring-[#8A1538]/10 outline-none transition text-sm bg-white shadow-sm"
                />
              </div>
              
              {/* Botón Exportar Excel */}
              <button
                onClick={handleExportExcel}
                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 w-full sm:w-auto"
                title="Descargar directorio en formato Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Cuerpo de la Tabla */}
          <div className="flex-1 overflow-x-auto">
            {loadingData ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-2 border-zinc-200 border-t-[#8A1538] rounded-full animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-zinc-500">
                <Building2 className="w-12 h-12 mb-3 text-zinc-200" strokeWidth={1} />
                <p className="text-sm font-medium text-zinc-500">No se encontraron empresas registradas.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-zinc-500 uppercase font-bold tracking-wider bg-zinc-50/80 border-b border-zinc-100">
                  <tr>
                    <th scope="col" className="px-6 py-4">Razón Social</th>
                    <th scope="col" className="px-6 py-4">Usuario de Acceso</th>
                    <th scope="col" className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-zinc-900">
                        {user.empresa}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-600 font-mono text-xs bg-zinc-100 border border-zinc-200 rounded-md px-2.5 py-1">
                          {user.username}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(user.username)}
                          className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          title="Revocar Acceso"
                          aria-label={`Eliminar a ${user.empresa}`}
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {eliminarUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEliminarUser(null)} />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="eliminar-titulo"
            aria-describedby="eliminar-desc"
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
              <h3 id="eliminar-titulo" className="text-lg font-semibold text-zinc-900">Revocar acceso</h3>
              <button
                type="button"
                onClick={() => setEliminarUser(null)}
                aria-label="Cancelar"
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center transition text-sm font-bold"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 text-sm text-zinc-600 leading-relaxed" id="eliminar-desc">
              ¿Seguro de eliminar el acceso para <strong className="text-zinc-900">{eliminarUser}</strong>? Esta acción no se puede deshacer.
            </div>
            <div className="px-6 py-4 border-t border-zinc-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEliminarUser(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition"
              >
                Sí, revocar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
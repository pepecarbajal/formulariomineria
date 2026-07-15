import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trash2, UserPlus, Building2, UserCircle, KeyRound, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../services/api';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const handleDelete = async (username) => {
    if (!window.confirm(`¿Estás seguro de eliminar el acceso para ${username}?`)) return;
    
    try {
      await request(`/usuarios/${username}`, { method: 'DELETE' });
      await fetchUsuarios();
      toast.success('Acceso revocado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  // Lógica del buscador
  const filteredUsers = usuarios.filter(u => 
    u.empresa.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <header>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">Gestión de Accesos</h1>
        <p className="text-sm text-zinc-500 mt-1">Crea y administra las credenciales de las entidades reguladas.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* ========================================================
            PANEL IZQUIERDO: FORMULARIO DE CREACIÓN
        ======================================================== */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 sticky top-24">
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Alta de Empresa</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-zinc-700">Razón Social</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  {...register('empresa')} required
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                  placeholder="Ej. Minera Media Luna"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Nombre de Usuario</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  {...register('username')} required
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                  placeholder="Identificador único"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Contraseña Temporal</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" {...register('password')} required
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                  placeholder="Generar clave segura"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all active:scale-[0.98] shadow-md shadow-emerald-600/20 disabled:opacity-70 mt-2"
            >
              {isSubmitting ? 'Registrando...' : 'Generar Credenciales'}
            </button>
          </form>
        </div>

        {/* ========================================================
            PANEL DERECHO: TABLA DE USUARIOS
        ======================================================== */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col min-h-[500px]">
          
          {/* Header de la Tabla con Buscador */}
          <div className="p-4 sm:p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
            <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Directorio Activo</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar empresa o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all text-sm bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Cuerpo de la Tabla */}
          <div className="flex-1 overflow-x-auto">
            {loadingData ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-zinc-400">
                <Building2 className="w-12 h-12 mb-3 text-zinc-200" />
                <p className="text-sm">No se encontraron empresas registradas.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-zinc-500 uppercase font-semibold bg-zinc-50/80 border-b border-zinc-100">
                  <tr>
                    <th className="px-6 py-4">Razón Social</th>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-zinc-900">
                        {user.empresa}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 font-mono text-xs bg-zinc-50 rounded px-2 py-1 ml-6 inline-block mt-3 border border-zinc-200">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(user.username)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Revocar Acceso"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../services/api';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      setLoading(true);
      const data = await request('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('role', 'admin');
      
      toast.success('Sesión iniciada correctamente');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error('Credenciales de administrador inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen overflow-hidden selection:bg-guinda selection:text-white">
      
      {/* CAPA DE FONDO */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-in fade-in duration-1000 scale-105"
        style={{ backgroundImage: `url('/bg-admin.jpg')` }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/90 via-black/60 to-black/90" />

      {/* HEADER UNIFICADO (Logos a la izquierda) */}
      <header className="absolute top-0 left-0 w-full px-6 md:px-12 py-8 z-30 flex items-center justify-between">
        <div className="flex items-center gap-5 md:gap-8">
          <img 
            src="/1.png" 
            alt="Gobierno del Estado de Guerrero" 
            className="h-12 sm:h-16 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 duration-300" 
          />
          <div className="w-px h-10 bg-white/20 hidden sm:block"></div>
          <img 
            src="/2.jpg" 
            alt="SEFODECO" 
            className="h-12 sm:h-16 object-contain rounded-md drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 duration-300" 
          />
        </div>

        <div className="hidden lg:block text-right">
          <h1 className="text-white/90 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase drop-shadow-md">
            Plataforma Estadística Minera
          </h1>
        </div>
      </header>

      {/* TARJETA DE LOGIN CENTRAL */}
      <div className="relative z-20 w-full max-w-[420px] px-4 mt-32 md:mt-0">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-10 rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 fade-in duration-700">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-white/5 border border-white/20 rounded-2xl flex items-center justify-center shadow-lg mb-4 backdrop-blur-sm">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white drop-shadow-sm">Acceso Administrativo</h2>
            <p className="text-sm text-zinc-300 mt-2 font-light">Portal exclusivo para administradores</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-200 tracking-wide">Correo</label>
              <input 
                id="email" name="email" type="email" required 
                defaultValue="mineria.sefodeco@guerrero.gob.mx"
                className="w-full h-12 px-4 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all bg-white/5 text-white placeholder:text-white/40 shadow-inner"
                placeholder="ejemplo@guerrero.gob.mx"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-200 tracking-wide">Contraseña</label>
              <input 
                id="password" name="password" type="password" required 
                defaultValue="admin123"
                className="w-full h-12 px-4 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all bg-white/5 text-white placeholder:text-white/40 shadow-inner"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full h-12 mt-4 bg-zinc-900 hover:bg-black text-white rounded-xl font-medium tracking-wide transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center border border-zinc-700 shadow-[0_0_20px_rgba(0,0,0,0.4)]"
            >
              {loading ? <Spinner /> : 'Ingresar al panel'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
            <Link to="/" className="inline-flex items-center text-xs font-medium text-zinc-400 hover:text-white tracking-wide transition-colors group">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> 
              ¿Eres un usuario? Volver
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
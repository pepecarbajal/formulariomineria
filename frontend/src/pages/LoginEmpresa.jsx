import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { request } from '../services/api';

export default function LoginEmpresa() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
      setLoading(true);
      const data = await request('/auth/empresa/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('username', data.username);
      sessionStorage.setItem('role', 'empresa');

      navigate('/formulario');
    } catch (err) {
      toast.error('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen overflow-hidden selection:bg-guinda selection:text-white">
      
      {/* 1. CAPA DE FONDO E IMAGEN */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-in fade-in duration-1000"
        style={{ backgroundImage: `url('/bg-mineria.png')` }}
      />
      
      {/* 2. OVERLAY DE CONTRASTE */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

      {/* 3. HEADER ULTRA MINIMALISTA (Logos Flotantes) */}
      <header className="absolute top-0 w-full px-6 md:px-12 py-8 z-30 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
        
        {/* Izquierda: Logo Transformando Guerrero */}
        <div className="flex-1 flex justify-center md:justify-start">
          <img 
            src="/1.png" 
            alt="Gobierno del Estado de Guerrero" 
            className="h-16 sm:h-20 md:h-24 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)] transition-transform hover:scale-105 duration-300" 
          />
        </div>

        {/* Centro: Título */}
        <div className="flex-[2] text-center w-full">
          <h1 className="text-white text-lg sm:text-xl font-medium tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-relaxed">
            Información Estadística del Sector Minero <br className="hidden lg:block" /> 
            <span className="font-light">del Estado de Guerrero</span>
          </h1>
        </div>

        {/* Derecha: Logo SEFODECO */}
        <div className="flex-1 flex justify-center md:justify-end">
          <img 
            src="/2.jpg" 
            alt="SEFODECO" 
            className="h-16 sm:h-20 md:h-24 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)] transition-transform hover:scale-105 duration-300" 
          />
        </div>
      </header>

      {/* 4. TARJETA DE LOGIN CENTRAL (Efecto Glassmorphism Puro) */}
      <div className="relative z-20 w-full max-w-[420px] px-4 mt-40 md:mt-0">
        
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 sm:p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] animate-in slide-in-from-bottom-8 fade-in duration-700">
          
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-white drop-shadow-sm">Iniciar sesión</h2>
            <p className="text-sm text-zinc-300 mt-2 font-light">Ingresa tus credenciales para acceder</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-zinc-200 tracking-wide">Usuario</label>
              <input 
                id="username" 
                name="username" 
                type="text" 
                required 
                className="w-full h-12 px-4 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-guinda transition-all bg-white/5 text-white placeholder:text-white/40 shadow-inner"
                placeholder="Ej. minera01"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-200 tracking-wide">Contraseña</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="w-full h-12 px-4 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-guinda transition-all bg-white/5 text-white placeholder:text-white/40 shadow-inner"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 mt-4 bg-guinda hover:bg-guinda-hover text-white rounded-xl font-medium tracking-wide transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center border border-guinda/50 shadow-[0_0_20px_rgba(138,21,56,0.4)]"
            >
              {loading ? <Spinner /> : 'Ingresar al sistema'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <Link to="/admin/login" className="text-xs font-medium text-zinc-400 hover:text-white tracking-wide transition-colors">
              ¿Eres administrador? Ingresa aquí
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
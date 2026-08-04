import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import LoginLayout from '../components/LoginLayout';

export default function LoginEmpresa() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const formData = new FormData(e.target);
    const username = formData.get('email');
    const password = formData.get('password');

    try {
      setLoading(true);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_URL}/auth/empresa/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error('Credenciales inválidas');

      const data = await res.json();

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('role', 'user');
      
      toast.success('Sesión iniciada correctamente');
      navigate('/formulario');
    } catch (err) {
      if (err.name === 'AbortError') {
        toast.error('El servidor no responde. Verifica que el backend esté corriendo.');
      } else {
        toast.error('Credenciales inválidas. Verifica tus datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayout>


      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-zinc-200 tracking-wide">Usuario</label>
          <input 
            id="email" name="email" type="text" required 
            className="w-full h-12 px-4 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-guinda transition-all bg-white/5 text-white placeholder:text-white/40 shadow-inner"
            placeholder="Identificador de la empresa"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-zinc-200 tracking-wide">Contraseña</label>
          <div className="relative">
            <input 
              id="password" name="password" type={showPassword ? 'text' : 'password'} required 
              className="w-full h-12 pl-4 pr-12 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-guinda transition-all bg-white/5 text-white placeholder:text-white/40 shadow-inner"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full h-12 mt-4 bg-guinda hover:bg-[#72112e] text-white rounded-xl font-medium tracking-wide transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_20px_rgba(138,21,56,0.4)]"
        >
          {loading ? <Spinner /> : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
        <Link to="/admin/login" className="inline-flex items-center text-xs font-medium text-zinc-400 hover:text-white tracking-wide transition-colors group">
          ¿Eres administrador? Acceso interno 
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </LoginLayout>
  );
}

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

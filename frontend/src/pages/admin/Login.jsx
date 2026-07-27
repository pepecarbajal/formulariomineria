import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import LoginLayout from '../../components/LoginLayout';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      setLoading(true);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await res.json();

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
    <LoginLayout>
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-zinc-200 tracking-wide">Correo</label>
          <input 
            id="email" name="email" type="email" required 
            className="w-full h-12 px-4 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all bg-white/5 text-white placeholder:text-white/40 shadow-inner"
            placeholder="ejemplo@guerrero.gob.mx"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-zinc-200 tracking-wide">Contraseña</label>
          <input 
            id="password" name="password" type="password" required 
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
    </LoginLayout>
  );
}

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Menu, X, ShieldCheck } from 'lucide-react';

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/admin/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Gestión de Usuarios', path: '/admin/usuarios', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans selection:bg-guinda selection:text-white text-zinc-900">
      
      {/* =========================================
          SIDEBAR DESKTOP (Oculto en móviles)
      ========================================= */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-zinc-200 fixed h-full z-20">
        <header className="p-6 border-b border-zinc-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-guinda rounded-xl flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900">SEFODECO</h2>
            <p className="text-xs text-zinc-500 font-medium">Portal Administrativo</p>
          </div>
        </header>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" aria-label="Navegación principal">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-guinda/10 text-guinda' 
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-guinda' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button 
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* =========================================
          ÁREA PRINCIPAL Y HEADER MÓVIL
      ========================================= */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        
        {/* Header Móvil */}
        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-zinc-200 h-16 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-guinda rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 tracking-tight">SEFODECO</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            aria-expanded={isMobileMenuOpen}
            aria-label="Abrir menú de navegación"
            className="p-2 text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors active:scale-95"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Menú Móvil (Overlay) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-20 bg-white pt-16 flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">
            <nav className="p-4 space-y-2 flex-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl font-medium text-base transition-colors ${
                      isActive ? 'bg-guinda/10 text-guinda' : 'text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <link.icon className={`w-5 h-5 ${isActive ? 'text-guinda' : 'text-zinc-400'}`} /> 
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            <button 
              onClick={handleLogout} 
              className="m-6 p-4 flex justify-center items-center gap-2 bg-red-50 text-red-600 rounded-xl font-medium active:scale-95 transition-transform"
            >
              <LogOut className="w-5 h-5" /> Cerrar Sesión
            </button>
          </div>
        )}

        {/* =========================================
            CONTENIDO DINÁMICO (Outlet)
        ========================================= */}
        <main className="flex-1 p-4 sm:p-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
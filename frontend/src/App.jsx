import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Páginas de Empresa
import LoginEmpresa from './pages/LoginEmpresa';
import Formulario from './pages/Formulario';
import YaEnviado from './pages/YaEnviado';

// Páginas de Admin
import AdminLogin from './pages/admin/Login';
import AdminLayout from './components/layout/AdminLayout';
import AdminUsuarios from './pages/admin/Usuarios';
import AdminFormularios from './pages/admin/Formularios';

// Componente Wrapper para proteger rutas
const PrivateRoute = ({ children, requireAdmin = false }) => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  if (!token) {
    return <Navigate to={requireAdmin ? "/admin/login" : "/"} replace />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      {/* Configuración global de notificaciones (Toasts) estilo Vercel */}
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#09090B',
            border: '1px solid #E4E4E7',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500'
          }
        }} 
      />
      
      <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans antialiased selection:bg-guinda selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-guinda focus:text-white focus:rounded-xl focus:text-sm focus:font-semibold focus:shadow-lg"
        >
          Saltar al contenido principal
        </a>
        <Routes>
          {/* ==============================
              RUTAS B2B (EMPRESA MINERA)
          ============================== */}
          <Route path="/" element={<LoginEmpresa />} />
          <Route path="/ya-enviado" element={<YaEnviado />} />
          <Route 
            path="/formulario" 
            element={
              <PrivateRoute requireAdmin={false}>
                <Formulario />
              </PrivateRoute>
            } 
          />

          {/* ==============================
              RUTAS BACKOFFICE (ADMIN)
          ============================== */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route element={<AdminLayout />}>
            <Route 
              path="/admin/usuarios" 
              element={
                <PrivateRoute requireAdmin={true}>
                  <AdminUsuarios />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/formularios" 
              element={
                <PrivateRoute requireAdmin={true}>
                  <AdminFormularios />
                </PrivateRoute>
              } 
            />
          </Route>

          {/* Ruta Catch-All (404) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
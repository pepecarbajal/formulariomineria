import { Link } from 'react-router-dom';

export default function YaEnviado() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 text-2xl">✓</div>
      <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Formulario Recibido</h1>
      <p className="text-zinc-500 mb-8">Tus métricas han sido enviadas correctamente a SEFODECO.</p>
      <Link to="/" className="px-4 py-2 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors">
        Volver al inicio
      </Link>
    </div>
  );
}
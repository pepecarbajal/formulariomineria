import { useState, useEffect } from 'react';

const CAROUSEL_IMAGES = [
  '/carrusel1.jpg',
  '/carrusel2.jpg',
  '/carrusel3.jpg',
];

export default function LoginLayout({ children }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return undefined;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main id="main-content" tabIndex={-1} className="relative flex min-h-screen overflow-hidden selection:bg-guinda selection:text-white">
      <h1 className="sr-only">SEFODECO — Acceso al Formulario de Empresas Mineras</h1>
      {/* LEFT SIDE - Carousel */}
      <div className="relative flex-1 hidden lg:block overflow-hidden" aria-hidden="true">
        {CAROUSEL_IMAGES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[800ms]"
            style={{
              backgroundImage: `url('${src}')`,
              opacity: i === index ? 1 : 0,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/60" />
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="relative w-full lg:w-[480px] xl:w-[520px] flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-10">
        {/* HEADER */}
        <header className="absolute top-0 left-0 right-0 px-6 md:px-8 py-6 flex items-center justify-center">
          <div className="flex items-center gap-4">
            <img src="/1.png" width={692} height={263} alt="Gobierno del Estado de Guerrero" className="h-14 sm:h-16 object-contain drop-shadow-lg" />
            <div className="w-px h-10 bg-white/20" />
            <img src="/2.png" width={2400} height={626} alt="SEFODECO" className="h-14 sm:h-16 w-auto object-contain drop-shadow-lg" />
          </div>

        </header>

        {/* FORM CARD */}
        <div className="w-full max-w-[400px] mt-16">
          {children}
        </div>
      </div>
    </main>
  );
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores institucionales
        guinda: { 
          DEFAULT: '#8A1538', 
          hover: '#72112e' 
        },
        dorado: { 
          DEFAULT: '#C09A5B' 
        },
        // Colores de sistema y fondos (Estética limpia)
        background: '#FAFAFA',
        surface: '#FFFFFF',
      },
      fontFamily: { 
        sans: ['Inter', 'sans-serif'] 
      },
    },
  },
  plugins: [],
}
// src/services/api.js

// Arquitectura Escalable: Consumo dinámico de variables de entorno
// Si VITE_API_URL existe, usa Render. Si falla, usa localhost como respaldo.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function request(path, options = {}) {
  const token = sessionStorage.getItem('token'); 
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}), 
  };

  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      if (response.status === 401) {
        sessionStorage.clear(); 
        window.location.href = '/'; 
      }
      
      const err = await response.json().catch(() => ({ error: 'Error de red con el servidor' }));
      throw new Error(err.error || err.message || 'Ocurrió un error inesperado');
    }
    
    return await response.json();
    
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Fallo de conexión. El servidor podría estar inactivo o reiniciándose.');
    }
    throw error;
  }
}
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
        const role = sessionStorage.getItem('role');
        sessionStorage.clear();
        window.location.href = role === 'admin' ? '/admin/login' : '/';
        throw new Error('Sesión expirada. Inicia sesión nuevamente.');
      }
      
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Ocurrió un error inesperado');
    }
    
    return await response.json();
    
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Error de conexión con el servidor. Verifica tu conexión e intenta de nuevo.');
    }
    throw error;
  }
}
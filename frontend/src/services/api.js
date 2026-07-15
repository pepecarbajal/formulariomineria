const API_URL = `${import.meta.env.VITE_API_URL}/api`

export async function request(path, options = {}) {
  const token = sessionStorage.getItem('token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.clear();
      window.location.href = '/'; 
    }
    const err = await response.json().catch(() => ({ error: 'Error de conexión' }));
    const mensaje = err.detalles 
      ? err.detalles.map(d => `${d.campo}: ${d.mensaje}`).join(', ')
      : err.error
    throw new Error(mensaje || 'Ocurrió un error inesperado');
  }
  
  return response.json();
}
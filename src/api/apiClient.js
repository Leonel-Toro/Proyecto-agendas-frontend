const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Cliente API con manejo automático de cookies y refresh de tokens
 * @param {string} endpoint - El endpoint a llamar (ej: /api/auth/login)
 * @param {RequestInit} options - Opciones de fetch
 * @returns {Promise<any>} - Respuesta JSON del servidor
 */
export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // ¡IMPORTANTE para enviar cookies!
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Si es 401, intentar refresh
  if (response.status === 401) {
    const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      // Reintentar la petición original
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!retryResponse.ok) {
        throw new Error('Session expired');
      }

      return retryResponse.json();
    } else {
      // Refresh falló, sesión expirada
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
    throw new Error(error.message || 'Error en la petición');
  }

  return response.json();
}

/**
 * Petición GET
 */
export function apiGet(endpoint) {
  return apiFetch(endpoint, { method: 'GET' });
}

/**
 * Petición POST
 */
export function apiPost(endpoint, body) {
  return apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Petición PUT
 */
export function apiPut(endpoint, body) {
  return apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Petición DELETE
 */
export function apiDelete(endpoint) {
  return apiFetch(endpoint, { method: 'DELETE' });
}

export default apiFetch;

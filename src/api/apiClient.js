const API_URL = import.meta.env.VITE_URL_BACKEND || 'http://localhost:8080';

// Endpoints que NO deben intentar refresh automático
const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
];

/**
 * Verifica si el endpoint es de autenticación (no debe hacer refresh)
 */
function isAuthEndpoint(endpoint) {
  return AUTH_ENDPOINTS.some(authPath => endpoint.includes(authPath));
}

/**
 * Cliente API con manejo automático de cookies y refresh de tokens
 * @param {string} endpoint - El endpoint a llamar (ej: /auth/login)
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

  // Si es 401 y NO es un endpoint de auth, intentar refresh
  if (response.status === 401 && !isAuthEndpoint(endpoint)) {
    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
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

  // Para endpoints de auth o respuestas no-401, manejar normalmente
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

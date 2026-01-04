const API_URL = import.meta.env.VITE_URL_BACKEND || 'http://localhost:8080';

// Claves para localStorage
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

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
 * Obtener el token de acceso almacenado
 */
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Obtener el refresh token almacenado
 */
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Guardar tokens en localStorage
 */
export function saveTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Limpiar tokens de localStorage
 */
export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Construir headers con Authorization
 */
function buildHeaders(customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Cliente API con manejo automático de tokens y refresh
 * Compatible con Safari/iOS (no depende de cookies cross-site)
 * @param {string} endpoint - El endpoint a llamar (ej: /auth/login)
 * @param {RequestInit} options - Opciones de fetch
 * @returns {Promise<any>} - Respuesta JSON del servidor
 */
export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Mantener por compatibilidad con cookies si el backend las usa
    headers: buildHeaders(options.headers),
  });

  // Guardar tokens si vienen en la respuesta (para login/register/refresh)
  const handleTokensFromResponse = async (res) => {
    const data = await res.clone().json().catch(() => ({}));
    if (data.accessToken) saveTokens(data.accessToken, data.refreshToken);
    return data;
  };

  // Si es 401 y NO es un endpoint de auth, intentar refresh
  if (response.status === 401 && !isAuthEndpoint(endpoint)) {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      clearTokens();
      throw new Error('Session expired');
    }

    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResponse.ok) {
      // Guardar nuevos tokens
      await handleTokensFromResponse(refreshResponse);
      
      // Reintentar la petición original con el nuevo token
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: buildHeaders(options.headers),
      });

      if (!retryResponse.ok) {
        clearTokens();
        throw new Error('Session expired');
      }

      return retryResponse.json();
    } else {
      // Refresh falló, sesión expirada
      clearTokens();
      throw new Error('Session expired');
    }
  }

  // Para endpoints de auth o respuestas no-401, manejar normalmente
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
    throw new Error(error.message || 'Error en la petición');
  }

  // Guardar tokens automáticamente si vienen en respuestas de auth
  if (isAuthEndpoint(endpoint) && endpoint !== '/auth/logout') {
    return handleTokensFromResponse(response);
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

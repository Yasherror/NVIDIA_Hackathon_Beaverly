export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function formatErrorDetail(details, status) {
  if (!details) return `HTTP error! status: ${status}`;
  const detail = details.detail !== undefined ? details.detail : details.message;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map(item => {
      if (typeof item === 'string') return item;
      if (item && item.msg) {
        const field = Array.isArray(item.loc) ? item.loc.slice(-1)[0] : '';
        return field ? `${field}: ${item.msg}` : item.msg;
      }
      return JSON.stringify(item);
    }).join('; ');
  }
  if (typeof detail === 'object' && detail !== null) {
    return JSON.stringify(detail);
  }
  return `HTTP error! status: ${status}`;
}

function getAuthHeaders(extraHeaders = {}) {
  const userKey = (typeof window !== 'undefined' && localStorage.getItem('nebius_user_api_key')) || '';
  return {
    ...(userKey ? { 'X-Nebius-Api-Key': userKey } : {}),
    ...extraHeaders
  };
}

export const apiClient = {
  // GET helper
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(formatErrorDetail(details, response.status));
      }
      return await response.json();
    } catch (error) {
      console.error(`API GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  // POST helper
  async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(formatErrorDetail(details, response.status));
      }
      return await response.json();
    } catch (error) {
      console.error(`API POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  async patch(endpoint, data = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(formatErrorDetail(details, response.status));
    }
    return await response.json();
  },

  async put(endpoint, data = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(formatErrorDetail(details, response.status));
    }
    return await response.json();
  },

  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(formatErrorDetail(details, response.status));
    }
    return await response.json();
  }
};

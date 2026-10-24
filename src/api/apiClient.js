const API_BASE_URL = 'http://localhost:8000/api'; // FastAPI Backend

export const apiClient = {
  // GET helper
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.detail || `HTTP error! status: ${response.status}`);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.detail || `HTTP error! status: ${response.status}`);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }
};

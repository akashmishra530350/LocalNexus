const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('civicpulse_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => apiRequest('/api/auth/me'),
  getDemoCredentials: () => apiRequest('/api/auth/demo-credentials'),

  // Complaints
  getComplaints: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'All') {
        searchParams.append(k, v);
      }
    });
    const qs = searchParams.toString();
    return apiRequest(`/api/complaints${qs ? `?${qs}` : ''}`);
  },
  getComplaintDetail: (id) => apiRequest(`/api/complaints/${id}`),
  createComplaint: (data) => apiRequest('/api/complaints', { method: 'POST', body: JSON.stringify(data) }),
  upvoteComplaint: (id) => apiRequest(`/api/complaints/${id}/upvote`, { method: 'POST' }),
  predictCategory: (title, description) => apiRequest('/api/complaints/predict', { 
    method: 'POST', 
    body: JSON.stringify({ title, description }) 
  }),
  checkDuplicates: (data) => apiRequest('/api/complaints/check-duplicates', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateStatus: (id, data) => apiRequest(`/api/complaints/${id}/status`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  mergeComplaint: (id, primaryId, notes) => apiRequest(`/api/complaints/${id}/merge`, {
    method: 'POST',
    body: JSON.stringify({ primary_complaint_id: primaryId, notes })
  }),

  // Analytics & Hotspots
  getAnalyticsOverview: () => apiRequest('/api/analytics/overview'),
  getHotspots: () => apiRequest('/api/analytics/hotspots')
};

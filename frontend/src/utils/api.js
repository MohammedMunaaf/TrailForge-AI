const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiFetch = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `API Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return response.json();
};

export const authAPI = {
  register: (name, email, password) => 
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email, password) => 
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const tripAPI = {
  getTrips: () => apiFetch('/trips'),
  createTrip: (tripData) => 
    apiFetch('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    }),
  updateTrip: (id, updateData) => 
    apiFetch(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),
  deleteTrip: (id) => 
    apiFetch(`/trips/${id}`, {
      method: 'DELETE',
    }),
  regenerateDay: (id, dayNumber, instructions) => 
    apiFetch(`/trips/${id}/regenerate-day`, {
      method: 'POST',
      body: JSON.stringify({ dayNumber, instructions }),
    }),
};

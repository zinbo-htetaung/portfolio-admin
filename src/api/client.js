const BASE = import.meta.env.VITE_API_URL || 'https://api.zinbohtetaung.com';

function getToken() {
  return localStorage.getItem('admin_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

export const api = {
  login: (password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),

  // Profile / Hero / About
  getProfile: () => request('/api/admin/profile'),
  updateProfile: (data) => request('/api/admin/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getHero: () => request('/api/admin/hero'),
  updateHero: (data) => request('/api/admin/hero', { method: 'PUT', body: JSON.stringify(data) }),
  getAbout: () => request('/api/admin/about'),
  updateAbout: (data) => request('/api/admin/about', { method: 'PUT', body: JSON.stringify(data) }),

  // Education
  getEducation: () => request('/api/admin/education'),
  createEducation: (data) => request('/api/admin/education', { method: 'POST', body: JSON.stringify(data) }),
  updateEducation: (id, data) => request(`/api/admin/education/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEducation: (id) => request(`/api/admin/education/${id}`, { method: 'DELETE' }),

  // Experience
  getExperiences: () => request('/api/admin/experiences'),
  createExperience: (data) => request('/api/admin/experiences', { method: 'POST', body: JSON.stringify(data) }),
  updateExperience: (id, data) => request(`/api/admin/experiences/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExperience: (id) => request(`/api/admin/experiences/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: () => request('/api/admin/projects'),
  createProject: (data) => request('/api/admin/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/api/admin/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/api/admin/projects/${id}`, { method: 'DELETE' }),

  // Skills
  getSkillPills: () => request('/api/admin/skills/pills'),
  createSkillPill: (data) => request('/api/admin/skills/pills', { method: 'POST', body: JSON.stringify(data) }),
  updateSkillPill: (id, data) => request(`/api/admin/skills/pills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSkillPill: (id) => request(`/api/admin/skills/pills/${id}`, { method: 'DELETE' }),

  getSkillLanguages: () => request('/api/admin/skills/languages'),
  createSkillLanguage: (data) => request('/api/admin/skills/languages', { method: 'POST', body: JSON.stringify(data) }),
  updateSkillLanguage: (id, data) => request(`/api/admin/skills/languages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSkillLanguage: (id) => request(`/api/admin/skills/languages/${id}`, { method: 'DELETE' }),
};

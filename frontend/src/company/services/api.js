const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('formalize_token');

const headers = () => ({
    'Content-Type': 'application/json',
    ...(getToken() && { Authorization: `Bearer ${getToken()}` })
});

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
};

// Auth
export const register = (email, password, name) =>
    fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password, name })
    }).then(handleResponse);

export const login = (email, password) =>
    fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password })
    }).then(handleResponse);

export const getMe = () =>
    fetch(`${API_BASE}/auth/me`, { headers: headers() }).then(handleResponse);

// Organization
export const createOrg = (name) =>
    fetch(`${API_BASE}/org`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ name })
    }).then(handleResponse);

export const getOrg = () =>
    fetch(`${API_BASE}/org`, { headers: headers() })
        .then(handleResponse)
        .then(data => data.org);

export const inviteMember = (email) =>
    fetch(`${API_BASE}/org/invite`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email })
    }).then(handleResponse);

export const joinOrg = (token) =>
    fetch(`${API_BASE}/org/join`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ token })
    }).then(handleResponse);

export const updateMemberRole = (userId, role) =>
    fetch(`${API_BASE}/org/members/${userId}/role`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ role })
    }).then(handleResponse);

export const removeMember = (userId) =>
    fetch(`${API_BASE}/org/members/${userId}`, {
        method: 'DELETE',
        headers: headers()
    }).then(handleResponse);

// Slangs
export const getSlangs = () =>
    fetch(`${API_BASE}/slangs`, { headers: headers() }).then(handleResponse);

export const getSlangsPrompt = () =>
    fetch(`${API_BASE}/slangs/prompt`, { headers: headers() }).then(handleResponse);

export const addPersonalSlang = (slang, meaning) =>
    fetch(`${API_BASE}/slangs/personal`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ slang, meaning })
    }).then(handleResponse);

export const deletePersonalSlang = (id) =>
    fetch(`${API_BASE}/slangs/personal/${id}`, {
        method: 'DELETE',
        headers: headers()
    }).then(handleResponse);

export const getOrgSlangs = () =>
    fetch(`${API_BASE}/slangs/org`, { headers: headers() })
        .then(handleResponse)
        .then(data => data.slangs || []);

export const addOrgSlang = (slang, meaning) =>
    fetch(`${API_BASE}/slangs/org`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ slang, meaning })
    }).then(handleResponse);

export const approveOrgSlang = (id) =>
    fetch(`${API_BASE}/slangs/org/${id}/approve`, {
        method: 'PATCH',
        headers: headers()
    }).then(handleResponse);

export const deleteOrgSlang = (id) =>
    fetch(`${API_BASE}/slangs/org/${id}`, {
        method: 'DELETE',
        headers: headers()
    }).then(handleResponse);

// Templates
export const getTemplates = () =>
    fetch(`${API_BASE}/templates`, { headers: headers() })
        .then(handleResponse)
        .then(data => data.templates || []);

export const createTemplate = ({ name, content, channel }) =>
    fetch(`${API_BASE}/templates`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ name, content, channel })
    }).then(handleResponse)
        .then(data => data.template);

export const updateTemplate = (id, data) =>
    fetch(`${API_BASE}/templates/${id}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify(data)
    }).then(handleResponse);

export const deleteTemplate = (id) =>
    fetch(`${API_BASE}/templates/${id}`, {
        method: 'DELETE',
        headers: headers()
    }).then(handleResponse);

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ai_journal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('ai_journal_token', token);
  } else {
    localStorage.removeItem('ai_journal_token');
  }
}

export async function getGoogleAuthUrl() {
  const { data } = await api.get('/auth/google/start');
  return data.url;
}

export async function getGithubAuthUrl() {
  const { data } = await api.get('/auth/github/start');
  return data.url;
}

export async function register(email, password) {
  const { data } = await api.post('/auth/register', { email, password });
  return data;
}

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function createJournal(payload) {
  const { data } = await api.post('/journal', payload);
  return data;
}

export async function getEntries() {
  const { data } = await api.get('/journal');
  return data;
}

export async function deleteJournal(id) {
  const { data } = await api.delete(`/journal/${id}`);
  return data;
}

export async function analyzeText(text) {
  const { data } = await api.post('/journal/analyze', { text });
  return data;
}

export async function getInsights() {
  const { data } = await api.get('/journal/insights');
  return data;
}

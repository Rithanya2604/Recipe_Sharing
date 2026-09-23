/* ==========================================================================
   api.js — talks to the Node.js/Express + MongoDB backend and manages the
   auth token + session in Local Storage. Loaded before every other script.
   ========================================================================== */
const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('yummyshare_token');
}
function setToken(token) {
  localStorage.setItem('yummyshare_token', token);
}
function clearToken() {
  localStorage.removeItem('yummyshare_token');
}

function getSession() {
  try { return JSON.parse(localStorage.getItem('yummyshare_session')); }
  catch (e) { return null; }
}
function setSession(user) {
  localStorage.setItem('yummyshare_session', JSON.stringify({
    id: user.id, name: user.name, email: user.email, at: Date.now()
  }));
}

/* Thin fetch wrapper: adds the JSON content-type + auth header, parses the
   JSON body, and throws an Error (with .status/.data attached) on failure
   so callers can branch on the HTTP status code. */
async function apiRequest(path, options = {}) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, Object.assign({}, options, { headers }));

  let data = null;
  try { data = await res.json(); } catch (e) { /* empty body */ }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

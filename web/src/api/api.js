// api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'https://goalstake-mvp.onrender.com/api' });

// Include token automatically if saved in localStorage
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const signup = (payload) => API.post('/auth/signup', payload).then(r => r.data);
export const login = (payload) => API.post('/auth/login', payload).then(r => r.data);
export const getCurrentChallenges = () => API.get('/challenges/current').then(r => r.data);
export const joinChallenge = (id, userId) => API.post(`/challenges/${id}/join`, {}, { headers: { 'x-user-id': userId } }).then(r => r.data);
export const savePredictions = (id, userId, predictions) => API.post(`/challenges/${id}/predictions`, { predictions }, { headers: { 'x-user-id': userId } }).then(r => r.data);
export const saveScorelines = (id, userId, predictions) => API.post(`/challenges/${id}/scoreline`, { predictions }, { headers: { 'x-user-id': userId } }).then(r => r.data);
export const saveFantasy = (id, userId, players) => API.post(`/challenges/${id}/fantasy`, { players }, { headers: { 'x-user-id': userId } }).then(r => r.data);
export const deposit = (payload) => API.post('/payments/deposit', payload).then(r => r.data);
export const withdraw = (payload) => API.post('/payments/withdraw', payload).then(r => r.data);
export const leaderboard = (id) => API.get(`/challenges/${id}/leaderboard`).then(r => r.data);

// ✅ Add this new function
export const getProfile = () => API.get('/auth/profile').then(r => r.data);

export default API;
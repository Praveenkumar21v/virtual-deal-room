import axios from 'axios';
import { Deal, User } from './types';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const register = (email: string, password: string, role: string) =>
  api.post('/auth/register', { email, password, role });

export const logout = () => api.post('/auth/logout');

export const getMe = () => api.get('/auth/me');
export const getSellers = () => api.get('/users/sellers');

export const getDeals = () => api.get('/deals');
export const createDeal = (deal: Partial<Deal> & { seller: string | User }) =>
  api.post('/deals', deal);
export const getDeal = (id: string) => api.get(`/deals/${id}`);
export const updateDeal = (id: string, data: Partial<Deal>) => api.put(`/deals/${id}`, data);

export const getMessages = (dealId: string) => api.get(`/chat/${dealId}`);
export const sendMessage = (dealId: string, content: string) =>
  api.post(`/chat/${dealId}`, { content });
export const markMessageRead = (dealId: string, messageId: string) =>
  api.put(`/chat/${dealId}/mark/${messageId}`);

export const checkOnlineStatus = (dealId: string) =>
  api.get(`/chat/${dealId}/online`);

export const uploadDocument = (dealId: string, formData: FormData) =>
  api.post(`/documents/${dealId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getDocuments = (dealId: string) => api.get(`/documents/${dealId}`);

export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id: string) => api.put(`/notifications/${id}`);

export const createPaymentIntent = (dealId: string) => api.post(`/payments/${dealId}/intent`);
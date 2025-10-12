import axios from 'axios';
import type { KPI } from "../../models/dashboard/KPI";
import type { Order } from "../../models/dashboard/Order";
import type { UserSummary } from "../../models/dashboard/UserSummary";
import type { ActivityItem } from "../../models/dashboard/ActivityItem";

const API_BASE = import.meta.env.VITE_BASE_URL + '/api/dashboard';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const api = axios.create({
  baseURL: API_BASE,
  headers: getAuthHeader(),
});

// We return the `data` property from the response for convenience

export const fetchDashboardKPIs = async (): Promise<KPI[]> => {
  const response = await api.get('/kpis');
  return response.data;
};

export const fetchRecentOrders = async (): Promise<Order[]> => {
  const response = await api.get('/recent-orders');
  return response.data;
};

export const fetchRecentUsers = async (): Promise<UserSummary[]> => {
  const response = await api.get('/recent-users');
  return response.data;
};

export const fetchActivity = async (): Promise<ActivityItem[]> => {
  const response = await api.get('/activities');
  return response.data;
};

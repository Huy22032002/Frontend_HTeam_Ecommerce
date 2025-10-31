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

// We return the `data` property from the response for convenience

export const fetchDashboardKPIs = async (): Promise<KPI[]> => {
  const response = await axios.get(`${API_BASE}/kpis`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const fetchRecentOrders = async (): Promise<Order[]> => {
  const response = await axios.get(`${API_BASE}/recent-orders`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const fetchRecentUsers = async (): Promise<UserSummary[]> => {
  const response = await axios.get(`${API_BASE}/recent-users`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const fetchActivity = async (): Promise<ActivityItem[]> => {
  const response = await axios.get(`${API_BASE}/activities`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

import axios from 'axios';
import type { PagedResponse } from '../../models/PagedResponse';

const API_BASE_URL = import.meta.env.VITE_BASE_URL +'/api'; //momo1


export interface ActivityLog {
  id: string;
  userType: 'CUSTOMER' | 'ADMIN';
  userId: number;
  userName: string;
  actionType: string;
  description: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILED';
  details?: string;
  createdAt: string;
}

export interface ActivityLogFilter {
  userType?: 'CUSTOMER' | 'ADMIN';
  actionType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export const ActivityLogApi = {
  /**
   * Get all activity logs with optional filters
   */
  getAllActivityLogs: async (
    page: number = 0,
    size: number = 20,
    userType?: string,
    actionType?: string,
    startDate?: string,
    endDate?: string
  ): Promise<PagedResponse<ActivityLog>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (userType) params.append('userType', userType);
    if (actionType) params.append('actionType', actionType);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get(
      `${API_BASE_URL}/activity-logs?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get activity logs by user type
   */
  getActivityLogsByUserType: async (
    userType: 'CUSTOMER' | 'ADMIN',
    page: number = 0,
    size: number = 20
  ): Promise<PagedResponse<ActivityLog>> => {
    const response = await axios.get(
      `${API_BASE_URL}/activity-logs/by-type/${userType}`,
      {
        params: { page, size }
      }
    );
    return response.data;
  },

  /**
   * Get activity logs by action type
   */
  getActivityLogsByActionType: async (
    actionType: string,
    page: number = 0,
    size: number = 20
  ): Promise<PagedResponse<ActivityLog>> => {
    const response = await axios.get(
      `${API_BASE_URL}/activity-logs/by-action/${actionType}`,
      {
        params: { page, size }
      }
    );
    return response.data;
  },

  /**
   * Get activity logs for a specific user
   */
  getActivityLogsByUserId: async (
    userId: number,
    page: number = 0,
    size: number = 20
  ): Promise<PagedResponse<ActivityLog>> => {
    const response = await axios.get(
      `${API_BASE_URL}/activity-logs/by-user/${userId}`,
      {
        params: { page, size }
      }
    );
    return response.data;
  },

  /**
   * Get activity logs for a specific entity
   */
  getActivityLogsByEntityId: async (entityId: string): Promise<ActivityLog[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/activity-logs/by-entity/${entityId}`
    );
    return response.data;
  },

  /**
   * Create activity log
   */
  createActivityLog: async (log: Partial<ActivityLog>): Promise<ActivityLog> => {
    const response = await axios.post(`${API_BASE_URL}/activity-logs`, log);
    return response.data;
  },

  /**
   * Export activity logs to Excel
   */
  exportToExcel: (filters: ActivityLogFilter) => {
    const params = new URLSearchParams();
    if (filters.userType) params.append('userType', filters.userType);
    if (filters.actionType) params.append('actionType', filters.actionType);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    return axios.get(`${API_BASE_URL}/activity-logs/export/excel?${params.toString()}`, {
      responseType: 'blob',
    });
  }
};

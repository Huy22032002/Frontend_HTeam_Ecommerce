import { useEffect, useState } from 'react';
import { ActivityLogApi, type ActivityLog } from '../api/activity/ActivityLogApi';

export interface UseActivityLogOptions {
  page?: number;
  size?: number;
  userType?: 'CUSTOMER' | 'ADMIN';
  actionType?: string;
  startDate?: string;
  endDate?: string;
}

export const useActivityLog = (options?: UseActivityLogOptions) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    page: options?.page || 0,
    size: options?.size || 20,
    userType: options?.userType || undefined,
    actionType: options?.actionType || undefined,
    startDate: options?.startDate || undefined,
    endDate: options?.endDate || undefined,
  });

  useEffect(() => {
    fetchActivityLogs();
  }, [filters.page, filters.size, filters.userType, filters.actionType, filters.startDate, filters.endDate]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call API with all filter parameters
      const data = await ActivityLogApi.getAllActivityLogs(
        filters.page,
        filters.size,
        filters.userType,
        filters.actionType,
        filters.startDate,
        filters.endDate
      );

      setLogs(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error loading activity logs';
      setError(errorMsg);
      console.error('Error loading activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update filters
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  return {
    logs,
    total,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    refetch: fetchActivityLogs,
  };
};

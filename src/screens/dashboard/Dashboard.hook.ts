import { useEffect, useState } from "react";
import { fetchDashboardKPIs, fetchRecentOrders, fetchRecentUsers, fetchActivity } from "../../api/dashboard/DashboardApi";
import type { KPI } from "../../models/dashboard/KPI";
import type { Order } from "../../models/dashboard/Order";
import type { UserSummary } from "../../models/dashboard/UserSummary";
import type { ActivityItem } from "../../models/dashboard/ActivityItem";

export const useDashboard = () => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard KPIs only on mount
  const loadKPIs = async () => {
    try {
      setLoading(true);
      setError(null);
      const kpiRes = await fetchDashboardKPIs();
      setKpis(kpiRes);
    } catch (e: any) {
      setError(e?.message || "Failed to load KPIs");
    } finally {
      setLoading(false);
    }
  };

  // Load other data when needed (lazy loading)
  const loadOtherData = async () => {
    try {
      const [orderRes, userRes, actRes] = await Promise.all([
        fetchRecentOrders(),
        fetchRecentUsers(),
        fetchActivity(),
      ]);
      setOrders(orderRes);
      setUsers(userRes);
      setActivities(actRes);
    } catch (e: any) {
      console.error("Failed to load dashboard data:", e);
    }
  };

  // Reload all data
  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const [kpiRes, orderRes, userRes, actRes] = await Promise.all([
        fetchDashboardKPIs(),
        fetchRecentOrders(),
        fetchRecentUsers(),
        fetchActivity(),
      ]);
      setKpis(kpiRes);
      setOrders(orderRes);
      setUsers(userRes);
      setActivities(actRes);
    } catch (e: any) {
      setError(e?.message || "Failed to reload dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKPIs();
    // Load other data after a short delay (lazy loading)
    const timer = setTimeout(() => {
      loadOtherData();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return { kpis, orders, users, activities, loading, error, reload };
};

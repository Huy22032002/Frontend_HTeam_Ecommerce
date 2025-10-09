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

  const load = async () => {
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
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { kpis, orders, users, activities, loading, error, reload: load };
};

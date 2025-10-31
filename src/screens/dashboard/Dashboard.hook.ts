import { useEffect, useState, useRef } from "react";
import { fetchDashboardKPIs, fetchRecentOrders, fetchRecentUsers, fetchActivity } from "../../api/dashboard/DashboardApi";
import type { KPI } from "../../models/dashboard/KPI";
import type { Order } from "../../models/dashboard/Order";
import type { UserSummary } from "../../models/dashboard/UserSummary";
import type { ActivityItem } from "../../models/dashboard/ActivityItem";

// Add timeout to API calls to prevent infinite loading
const withTimeout = (promise: Promise<any>, timeoutMs: number = 8000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
};

export const useDashboard = () => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to prevent double-loading in StrictMode
  const hasLoadedRef = useRef(false);

  // Load dashboard data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📊 Loading dashboard data...");
      
      // Load KPIs first (critical path)
      const kpiRes = await withTimeout(fetchDashboardKPIs(), 8000);
      console.log("✅ KPIs loaded:", kpiRes.length, "items");
      setKpis(kpiRes);
      
      // Then load other data in parallel
      try {
        const [orderRes, userRes, actRes] = await Promise.all([
          withTimeout(fetchRecentOrders(), 8000).catch(e => {
            console.warn("⚠️ Orders failed:", e.message);
            return [];
          }),
          withTimeout(fetchRecentUsers(), 8000).catch(e => {
            console.warn("⚠️ Users failed:", e.message);
            return [];
          }),
          withTimeout(fetchActivity(), 8000).catch(e => {
            console.warn("⚠️ Activities failed:", e.message);
            return [];
          }),
        ]);
        
        console.log("✅ Dashboard data loaded - Orders:", orderRes.length, "Users:", userRes.length, "Activities:", actRes.length);
        setOrders(orderRes || []);
        setUsers(userRes || []);
        setActivities(actRes || []);
      } catch (e: any) {
        console.warn("⚠️ Some dashboard data failed to load:", e.message);
        // Still continue even if secondary data fails
      }
    } catch (e: any) {
      console.error("❌ Error loading dashboard:", e);
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Reload all data
  const reload = async () => {
    hasLoadedRef.current = false;
    await loadData();
  };

  useEffect(() => {
    // Prevent double-loading in React StrictMode (development only)
    if (hasLoadedRef.current) {
      console.log("🔄 Skipping duplicate load due to StrictMode");
      return;
    }
    hasLoadedRef.current = true;
    
    loadData();
  }, []);

  return { kpis, orders, users, activities, loading, error, reload };
};


import { useEffect, useState, useRef } from "react";
import {
  DashboardApi,
  type DashboardKPIDTO,
  type RecentOrderDTO,
  type NewCustomerDTO,
  type MonthlyRevenueDTO,
} from "../../api/dashboard/DashboardApi";

const withTimeout = (promise: Promise<any>, timeoutMs: number = 8000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Request timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
};

export const useDashboard = () => {
  const [kpis, setKpis] = useState<DashboardKPIDTO[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrderDTO[]>([]);
  const [newCustomers, setNewCustomers] = useState<NewCustomerDTO[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueDTO[]>([]);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📊 Loading dashboard data...");

      // Load KPIs (critical path)
      const kpiRes = await withTimeout(DashboardApi.getKPIs(), 8000);
      console.log("✅ KPIs loaded:", kpiRes.data.length, "items");
      setKpis(kpiRes.data || []);

      // Load other data in parallel
      try {
        const [ordersRes, customersRes, revenueRes, statusRes] =
          await Promise.all([
            withTimeout(DashboardApi.getRecentOrders(), 8000).catch((e) => {
              console.warn("⚠️ Orders failed:", e.message);
              return { data: [] };
            }),
            withTimeout(DashboardApi.getNewCustomers(), 8000).catch((e) => {
              console.warn("⚠️ Customers failed:", e.message);
              return { data: [] };
            }),
            withTimeout(DashboardApi.getMonthlyRevenue(), 8000).catch((e) => {
              console.warn("⚠️ Monthly revenue failed:", e.message);
              return { data: [] };
            }),
            withTimeout(DashboardApi.getOrderStatusDistribution(), 8000).catch(
              (e) => {
                console.warn("⚠️ Status distribution failed:", e.message);
                return { data: {} };
              }
            ),
          ]);

        console.log("✅ Dashboard data loaded");
        setRecentOrders(ordersRes.data || []);
        setNewCustomers(customersRes.data || []);
        setMonthlyRevenue(revenueRes.data || []);
        setOrderStatusDistribution(statusRes.data || {});
      } catch (e: any) {
        console.warn("⚠️ Some dashboard data failed:", e.message);
      }
    } catch (e: any) {
      console.error("❌ Error loading dashboard:", e);
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const reload = async () => {
    hasLoadedRef.current = false;
    await loadData();
  };

  useEffect(() => {
    if (hasLoadedRef.current) {
      console.log("🔄 Skipping duplicate load due to StrictMode");
      return;
    }
    hasLoadedRef.current = true;
    loadData();
  }, []);

  return {
    kpis,
    recentOrders,
    newCustomers,
    monthlyRevenue,
    orderStatusDistribution,
    loading,
    error,
    reload,
  };
};

import type { KPI } from "../../models/dashboard/KPI";
import type { Order } from "../../models/dashboard/Order";
import type { UserSummary } from "../../models/dashboard/UserSummary";
import type { ActivityItem } from "../../models/dashboard/ActivityItem";

// Simulate network latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchDashboardKPIs = async (): Promise<KPI[]> => {
  await delay(300);
  return [
    { id: 'revenue', title: 'Revenue', value: 125430, change: '+12%', icon: '💰' },
    { id: 'orders', title: 'Orders', value: 3421, change: '+5%', icon: '🛒' },
    { id: 'customers', title: 'Customers', value: 1820, change: '+8%', icon: '👥' },
    { id: 'conversion', title: 'Conversion', value: 3.4, change: '+0.4%', icon: '📈' },
  ];
};

export const fetchRecentOrders = async (): Promise<Order[]> => {
  await delay(400);
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `ORD-${1000 + i}`,
    customerName: `Customer ${i + 1}`,
    total: Math.random() * 500 + 20,
    status: i % 2 === 0 ? 'PAID' : 'PENDING',
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));
};

export const fetchRecentUsers = async (): Promise<UserSummary[]> => {
  await delay(350);
  return Array.from({ length: 5 }).map((_, i) => ({
    id: `USR-${200 + i}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@mail.com`,
    createdAt: new Date(Date.now() - i * 43200000).toISOString(),
  }));
};

export const fetchActivity = async (): Promise<ActivityItem[]> => {
  await delay(250);
  return Array.from({ length: 8 }).map((_, i) => ({
    id: `ACT-${i}`,
    message: `Activity message #${i + 1}`,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));
};

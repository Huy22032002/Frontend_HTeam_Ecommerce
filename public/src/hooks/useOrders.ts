import { useEffect, useState, useCallback } from 'react';
import type { Order } from '../models/dashboard/Order';
import { OrderApi, type OrderFilters } from '../api/order/OrderApi';
import { debounce } from 'lodash';

export function useOrders(initialFilters: OrderFilters = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [filters, setFilters] = useState<OrderFilters>(initialFilters);
  const [prevSearchFilter, setPrevSearchFilter] = useState<string>('');

  // Debounced fetch function
  const fetchOrders = useCallback(debounce((currentFilters: OrderFilters) => {
    setLoading(true);
    console.log('Fetching orders with filters:', currentFilters);
    OrderApi.getAll(currentFilters)
      .then(res => {
        console.log('Response data:', res.data);
        if (res.data && res.data.content) {
          setOrders(res.data.content);
          setTotal(res.data.totalElements || 0);
        } else if (Array.isArray(res.data)) {
          setOrders(res.data);
          setTotal(res.data.length);
        } else {
          setOrders([]);
          setTotal(0);
        }
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, 500), []); // 500ms debounce delay

  useEffect(() => {
    // Check if any filter changed (excluding page/size for now)
    const currentSearchKey = `${filters.search}|${filters.status}|${filters.startDate}|${filters.endDate}|${filters.minAmount}|${filters.maxAmount}`;
    
    // If search filters changed (not pagination), reset to page 0
    if (currentSearchKey !== prevSearchFilter) {
      setPrevSearchFilter(currentSearchKey);
      // Reset to page 0 when filters change
      const filtersWithPage0 = { ...filters, page: 0 };
      fetchOrders(filtersWithPage0);
    } else {
      // Just pagination change
      fetchOrders(filters);
    }
  }, [filters, fetchOrders, prevSearchFilter]);

  return { orders, total, loading, error, filters, setFilters };
}

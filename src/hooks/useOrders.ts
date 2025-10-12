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

  // Debounced fetch function
  const fetchOrders = useCallback(debounce((currentFilters: OrderFilters) => {
    setLoading(true);
    OrderApi.getAll(currentFilters)
      .then(res => {
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
      .catch(setError)
      .finally(() => setLoading(false));
  }, 300), []); // 300ms debounce delay

  useEffect(() => {
    fetchOrders(filters);
  }, [filters, fetchOrders]);

  return { orders, total, loading, error, filters, setFilters };
}

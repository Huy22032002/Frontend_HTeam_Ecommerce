import { useEffect, useState, useCallback } from 'react';
import type { PaymentReadableDTO } from '../models/payments/Payment';
import { PaymentApi, type PaymentFilters } from '../api/payment/PaymentApi';

export function usePayments(initialFilters: PaymentFilters = {}) {
  const [payments, setPayments] = useState<PaymentReadableDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [filters, setFilters] = useState<PaymentFilters>(initialFilters);

  const fetchPayments = useCallback((currentFilters: PaymentFilters) => {
    setLoading(true);
    PaymentApi.getAll(currentFilters)
      .then(res => {
        if (res.data && res.data.content) {
          setPayments(res.data.content);
          setTotal(res.data.totalElements || 0);
        } else if (Array.isArray(res.data)) {
          setPayments(res.data);
          setTotal(res.data.length);
        } else {
          setPayments([]);
          setTotal(0);
        }
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPayments(filters);
  }, [filters, fetchPayments]);

  return { payments, total, loading, error, filters, setFilters };
}

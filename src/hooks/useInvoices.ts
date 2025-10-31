import { useEffect, useState, useCallback } from 'react';
import type { InvoiceReadableDTO } from '../models/invoices/Invoice';
import { InvoiceApi, type InvoiceFilters } from '../api/invoice/InvoiceApi';

export function useInvoices(initialFilters: InvoiceFilters = {}) {
  const [invoices, setInvoices] = useState<InvoiceReadableDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [filters, setFilters] = useState<InvoiceFilters>(initialFilters);

  const fetchInvoices = useCallback((currentFilters: InvoiceFilters) => {
    setLoading(true);
    InvoiceApi.getAll(currentFilters)
      .then(res => {
        if (res.data && res.data.content) {
          setInvoices(res.data.content);
          setTotal(res.data.totalElements || 0);
        } else if (Array.isArray(res.data)) {
          setInvoices(res.data);
          setTotal(res.data.length);
        } else {
          setInvoices([]);
          setTotal(0);
        }
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchInvoices(filters);
  }, [filters, fetchInvoices]);

  return { invoices, total, loading, error, filters, setFilters };
}

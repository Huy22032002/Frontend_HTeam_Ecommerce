import { useEffect, useState, useRef } from 'react';
import { CustomerAdminApi } from '../api/customer/CustomerAdminApi';

export interface Customer {
  id: number;
  username: string;
  name?: string;
  email?: string;
  emailAddress?: string;
  phone?: string;
  address?: string;
  blocked?: boolean;
  [key: string]: any;
}

export const useCustomers = (page = 0, size = 20) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Prevent double load in StrictMode
  const hasLoadedRef = useRef(false);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await CustomerAdminApi.getAll(page, size);
      
      if (response.data?.content) {
        setCustomers(response.data.content);
        setTotalElements(response.data.totalElements || 0);
        setTotalPages(response.data.totalPages || 0);
      } else if (Array.isArray(response.data)) {
        setCustomers(response.data);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch customers';
      setError(msg);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadCustomers();
  }, [page, size]);

  const reload = () => {
    hasLoadedRef.current = false;
    loadCustomers();
  };

  const refetch = () => {
    loadCustomers();
  };

  return { customers, loading, error, reload, refetch, totalElements, totalPages };
};

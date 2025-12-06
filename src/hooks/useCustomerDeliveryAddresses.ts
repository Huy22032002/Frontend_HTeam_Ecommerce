import { useEffect, useState } from 'react';
import { CustomerDeliveryApi } from '../api/customer/CustomerDeliveryApi';
import type { ReadableCustomerDelivery } from '../models/customer/ReadablerCustomerDelivery';

export interface CustomerDeliveryAddressState {
  deliveryAddresses: ReadableCustomerDelivery[];
  loading: boolean;
  error: string | null;
}

export const useCustomerDeliveryAddresses = (customerId: number | undefined) => {
  const [state, setState] = useState<CustomerDeliveryAddressState>({
    deliveryAddresses: [],
    loading: false,
    error: null,
  });

  const fetchDeliveryAddresses = async () => {
    if (!customerId) {
      setState({
        deliveryAddresses: [],
        loading: false,
        error: null,
      });
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await CustomerDeliveryApi.getList(customerId);
      setState({
        deliveryAddresses: response.data || [],
        loading: false,
        error: null,
      });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Lỗi tải danh sách địa chỉ';
      setState({
        deliveryAddresses: [],
        loading: false,
        error: errorMessage,
      });
      console.error('Failed to fetch delivery addresses:', err);
    }
  };

  useEffect(() => {
    fetchDeliveryAddresses();
  }, [customerId]);

  const refresh = () => {
    fetchDeliveryAddresses();
  };

  return {
    ...state,
    refresh,
  };
};

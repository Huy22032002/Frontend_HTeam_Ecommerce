import { useEffect, useState } from "react";
import { NotificationApi } from "../api/notification/NotificationApi";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const useNotifications = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const customerId = useSelector(
    (state: RootState) => state.customerAuth.customer?.id
  );

  const getUnreadCustomerNotifications = async () => {
    if (!customerId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await NotificationApi.getUnreadCustomerNotification(
        customerId
      );
      if (data) {
        return data;
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAllByCustomerId = async () => {
    if (!customerId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await NotificationApi.getAllByCustomer(customerId);
      if (data) {
        return data;
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    if (!customerId) return;

    setLoading(true);
    setError(null);
    try {
      await NotificationApi.markAsRead(customerId, id);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUnreadCustomerNotifications();
  }, [customerId]);

  return {
    error,
    loading,
    getAllByCustomerId,
    getUnreadCustomerNotifications,
    markAsRead,
  };
};

export default useNotifications;

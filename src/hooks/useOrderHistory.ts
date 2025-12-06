import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { OrderApi } from "../api/order/OrderApi";
import type { OrderReadableDTO } from "../models/orders/Order";

interface UseOrderHistoryResult {
  orders: OrderReadableDTO[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  page: number;
  setPage: (page: number) => void;
}

export const useOrderHistory = (): UseOrderHistoryResult => {
  const [orders, setOrders] = useState<OrderReadableDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  // Get customer from Redux
  const customer = useSelector(
    (state: RootState) => state.customerAuth?.customer
  );

  const fetchOrderHistory = async () => {
    if (!customer?.id) {
      setError("Vui lòng đăng nhập để xem lịch sử đơn hàng");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await OrderApi.getByCustomerId(
        customer.id.toString(),
        page,
        PAGE_SIZE
      );

      if (response.status === 200) {
        // Backend trả về Page object, lấy danh sách từ content
        const data = response.data?.content || response.data || [];
        setOrders(data);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải lịch sử đơn hàng";
      setError(errorMessage);
      console.error("Fetch order history error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, [customer?.id, page]);

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrderHistory,
    page,
    setPage,
  };
};

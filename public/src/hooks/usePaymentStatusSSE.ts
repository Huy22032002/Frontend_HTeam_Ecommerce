import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook để subscribe vào payment status updates từ SSE
 * - Backend timeout: 5 phút (300s)
 * - Nếu hết hạn → hiển thị thông báo hủy thanh toán
 * - Nếu thành công → redirect tự động
 */
export const usePaymentStatusSSE = (orderId: number | null | undefined, enabled: boolean = true) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!orderId || !enabled) return;

    const apiUrl = import.meta.env.VITE_BASE_URL;
    const eventSource = new EventSource(
      `${apiUrl}/api/public/payment/status/subscribe?orderId=${orderId}`
    );
    eventSourceRef.current = eventSource;

    console.log(`📡 SSE: Đang chờ thanh toán cho đơn hàng ${orderId}`);

    // Set timeout 5 phút 30 giây (để có buffer trước khi backend timeout)
    // Nếu không nhận được response trong thời gian này → hủy
    timeoutRef.current = setTimeout(() => {
      console.warn(`⏱️ SSE timeout cho đơn ${orderId} - Thanh toán hết hạn`);
      eventSource.close();
      alert("❌ Thanh toán hết hạn (5 phút). Vui lòng thử lại.");
      navigate(`/customer/checkout`, { replace: true });
    }, 5 * 60 * 1000 + 30 * 1000); // 5.5 phút

    // Handle payment success event
    eventSource.addEventListener("payment-success", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("🎉 Thanh toán thành công:", data);
        
        // Hủy timeout vì đã nhận được response
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        eventSource.close();
        
        alert("✅ Thanh toán thành công!");
        navigate(`/customer/orders-history`, { replace: true });
      } catch (error) {
        console.error("❌ Lỗi parse payment success event:", error);
      }
    });

    // Handle payment failure event
    eventSource.addEventListener("payment-failure", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.error("❌ Thanh toán thất bại:", data);
        
        // Hủy timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        eventSource.close();
        
        alert(`❌ Thanh toán thất bại: ${data.reason || 'Lỗi không xác định'}`);
        navigate(`/customer/checkout`, { replace: true });
      } catch (error) {
        console.error("❌ Lỗi parse payment failure event:", error);
      }
    });

    // Handle connection error
    eventSource.addEventListener("error", () => {
      console.error("❌ Mất kết nối SSE");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      eventSource.close();
      alert("❌ Mất kết nối. Vui lòng kiểm tra lại thanh toán.");
    });

    // Cleanup
    return () => {
      console.log(`📡 SSE: Đóng kết nối cho đơn ${orderId}`);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      eventSource.close();
    };
  }, [orderId, enabled, navigate]);
};

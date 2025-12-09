import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook để subscribe vào payment status updates từ SSE
 * Khi thanh toán thành công, sẽ tự động redirect
 */
export const usePaymentStatusSSE = (orderId: number | null | undefined, enabled: boolean = true) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId || !enabled) return;

    const eventSource = new EventSource(
      `/api/public/payment/status/subscribe?orderId=${orderId}`
    );

    console.log(`📡 SSE: Subscribing to payment status for order ${orderId}`);

    // Handle connected event
    eventSource.addEventListener("connected", () => {
      console.log("✅ Connected to payment status stream for order:", orderId);
    });

    // Handle payment success event
    eventSource.addEventListener("payment-success", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("🎉 Payment success detected:", data);
        
        // Đóng connection
        eventSource.close();
        
        // Hiển thị thông báo và redirect
        alert("✅ Thanh toán thành công!");
        navigate(`/customer/orders-history`, { replace: true });
      } catch (error) {
        console.error("Error parsing payment success event:", error);
      }
    });

    // Handle payment failure event
    eventSource.addEventListener("payment-failure", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.error("❌ Payment failed:", data);
        
        // Đóng connection
        eventSource.close();
        
        // Hiển thị thông báo
        alert(`❌ Thanh toán thất bại: ${data.reason}`);
      } catch (error) {
        console.error("Error parsing payment failure event:", error);
      }
    });

    // Handle error
    eventSource.addEventListener("error", () => {
      console.error("❌ SSE connection error");
      eventSource.close();
    });

    // Cleanup
    return () => {
      console.log(`📡 SSE: Closing connection for order ${orderId}`);
      eventSource.close();
    };
  }, [orderId, enabled, navigate]);
};

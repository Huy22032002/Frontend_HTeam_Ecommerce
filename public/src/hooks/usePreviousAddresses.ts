import { useEffect, useState } from 'react';
import { OrderApi } from '../api/order/OrderApi';

export interface PreviousAddress {
  id: string; // orderId as unique ID
  fullName: string;
  phoneNumber: string;
  shippingAddress: string;
  createdAt: string;
}

export const usePreviousAddresses = (customerId: string | undefined) => {
  const [addresses, setAddresses] = useState<PreviousAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) return;

    const fetchAddresses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Lấy lịch sử đơn hàng (page 0, size 50 để lấy nhiều)
        const response = await OrderApi.getByCustomerId(customerId, 0, 50);
        
        if (response.data && Array.isArray(response.data.content)) {
          // Extract unique addresses từ orders
          const addressMap = new Map<string, PreviousAddress>();
          
          response.data.content.forEach((order: any) => {
            // Try to extract phoneNumber from different possible locations
            const phoneNumber = 
              order.receiverPhoneNumber || 
              order.delivery?.phoneNumber || 
              order.phone || 
              '';
            
            const address: PreviousAddress = {
              id: String(order.id),
              fullName: order.customerName || '',
              phoneNumber: phoneNumber,
              shippingAddress: order.shippingAddress || '',
              createdAt: order.createdAt || new Date().toISOString(),
            };
            
            // Key dựa trên địa chỉ để tránh duplicate
            const key = `${address.phoneNumber}|${address.shippingAddress}`;
            
            // Chỉ thêm nếu chưa có hoặc order mới hơn
            if (!addressMap.has(key)) {
              addressMap.set(key, address);
            }
          });
          
          // Convert Map thành Array và sắp xếp theo thời gian mới nhất
          const uniqueAddresses = Array.from(addressMap.values());
          setAddresses(uniqueAddresses);
        }
      } catch (err: any) {
        console.error('Failed to fetch previous addresses:', err);
        setError(err?.message || 'Không thể tải lịch sử địa chỉ');
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [customerId]);

  return { addresses, loading, error };
};

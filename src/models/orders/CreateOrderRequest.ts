// Item được thêm vào đơn hàng
export interface OrderItem {
  variantId: number; // ID của ProductVariant
  productVariantOptionId: number; // ID của ProductVariantOption (tương ứng với SKU)
  sku: string; // SKU để tìm promotion
  quantity: number;
  price: number; // Giá hiện tại (có thể khác với giá gốc)
  promotionId?: number; // ID promotion nếu có
  discountAmount?: number; // Số tiền được giảm
}

// Yêu cầu tạo đơn hàng
export interface CreateOrderRequest {
  customerId: number; 
  userId?: number; // ID nhân viên CMS tạo đơn (optional)
  items: OrderItem[];
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD' | 'E_WALLET'; // Các phương thức thanh toán
  notes?: string;
  shippingAddress?: string;
  totalAmount?: number; // Tổng tiền (tính toán lại ở BE)
}

// Response khi tạo đơn hàng thành công
export interface CreateOrderResponse {
  id: string;
  customerId: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  paymentMethod: string;
  notes?: string;
}

// Dùng để hiển thị trong form (kết hợp với promotion info)
export interface OrderItemDisplay extends OrderItem {
  productName?: string;
  variantName?: string;
  optionValue?: string;
  promotionName?: string;
  originalPrice?: number;
}

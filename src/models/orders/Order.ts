export interface OrderItem {
  variantId: number;
  productVariantOptionId: number;
  sku: string;
  quantity: number;
  price: number;
  promotionId?: number;
  discountAmount?: number;
}

export interface OrderReadableDTO {
  id: number;
  orderCode: string;
  customerName: string;
  total: number;
  status: 'PROCESSING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
  createdAt: string;
  items?: OrderItem[];
  paymentMethod?: string;
  notes?: string;
  shippingAddress?: string;
}

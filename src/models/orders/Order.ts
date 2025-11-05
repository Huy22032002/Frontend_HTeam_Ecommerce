export interface OrderItem {
  variantId: number;
  productVariantOptionId: number;
  sku: string;
  productName?: string;  // Tên sản phẩm
  quantity: number;
  price: number;
  promotionId?: number;
  discountAmount?: number;
}

export interface Transaction {
  id: number;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transactionDate: string;
  paymentType: 'CASH' | 'CARD' | 'TRANSFER' | 'E_WALLET';
  details?: string;
}

export interface Invoice {
  id: number;
  invoiceCode: string;
  customerName?: string;
  total?: number;
  status: string;
  createdAt?: string;
}

export interface OrderReadableDTO {
  id: number;
  orderCode: string;
  customerId?: number;  // ID khách hàng
  customerName: string;
  total: number;
  totalDiscount?: number;  // Tổng tiền giảm từ promotions
  status: 'PROCESSING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
  createdAt: string;
  items?: OrderItem[];
  deposits?: Transaction[];
  invoices?: Invoice[];  // Danh sách hoá đơn liên quan
  notes?: string;
  shippingAddress?: string;
  receiverName?: string;  // Tên người nhận từ delivery
  receiverPhoneNumber?: string;
}


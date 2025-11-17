export interface OrderItem {
  variantId: number;
  productVariantOptionId: number;
  sku: string;
  productName?: string; // Tên sản phẩm
  quantity: number;
  price: number;
  promotionId?: number;
  discountAmount?: number;
}

export interface Delivery {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  ward?: string;
  province?: string;
  postcode?: string;
  deliveryNote?: string;
  deliveryMethod?: string;
  carrier?: string;
  deliveryStatus?: string;
}

export interface Transaction {
  id: number;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  transactionDate: string;
  paymentType: "CASH" | "CARD" | "TRANSFER" | "E_WALLET";
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
  customerId?: number; // ID khách hàng
  customerName: string;
  total: number;
  totalDiscount?: number; // Tổng tiền giảm từ promotions
  status:
    | "PENDING"
    | "APPROVED"
    | "PROCESSING"
    | "SHIPPING"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED"
    | "PARTIALLY_REFUNDED";
  createdAt: string;
  items?: OrderItem[];
  deposits?: Transaction[];
  invoices?: Invoice[]; // Danh sách hoá đơn liên quan
  notes?: string;
  shippingAddress?: string;
  receiverName?: string; // Tên người nhận từ delivery
  receiverPhoneNumber?: string;
  delivery?: Delivery; // Delivery information including carrier
  voucherCode?: string;
  voucherDiscount?: number;
}

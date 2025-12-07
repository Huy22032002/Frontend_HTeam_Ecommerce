export interface Transaction {
  id: number;
  amount: number;
  status: string; // PENDING, SUCCESS, FAILED
  transactionDate: string;
  paymentType: string; // CASH, MOMO, BANK_TRANSFER, etc.
  details?: string;
}

export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string; // ISO date
}

export interface OrderReadableDTO {
  id: number;
  orderCode: string;
  customerId?: number;
  customerName: string;
  total: number;
  totalDiscount?: number;
  status: string;
  createdAt: string;
  items?: any[];
  deposits?: Transaction[];
  invoices?: any[];
  notes?: string;
  shippingAddress?: string;
  receiverName?: string;
  receiverPhoneNumber?: string;
  voucherCode?: string;
  voucherDiscount?: number;
}

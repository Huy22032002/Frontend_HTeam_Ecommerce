export interface PaymentReadableDTO {
  id: number;
  paymentCode: string;
  invoiceCode: string;
  orderCode: string;      // Mã đơn hàng (deposit)
  customerName: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string | Date;  // ISO 8601 format hoặc Date object
}

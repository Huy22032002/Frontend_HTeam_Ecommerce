export interface PaymentReadableDTO {
  id: number;
  paymentCode: string;
  invoiceCode: string;
  customerName: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

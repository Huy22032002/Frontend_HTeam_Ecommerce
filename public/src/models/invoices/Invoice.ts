export interface InvoiceReadableDTO {
  id: number;
  invoiceCode: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

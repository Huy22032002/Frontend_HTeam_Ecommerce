export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string; // ISO date
}

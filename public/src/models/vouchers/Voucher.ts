export interface Voucher {
  code: string;
  value: number;
  minOrder: number;
  status: "ACTIVE" | "USED" | "EXPIRED";
  startDate: string;
  endDate: string;
}

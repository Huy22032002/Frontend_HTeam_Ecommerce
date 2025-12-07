import type { FlashSaleItemDTO } from "./FlashSaleItemDTO";

export interface FlashSaleDTO {
  id: number;
  name: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
  items: FlashSaleItemDTO[];
}

import type { FlashSaleItemDTO } from "./FlashSaleItemDTO";

export interface CreateFlashSaleDTO {
  name: string;
  description: string;
  status: string; // "ACTIVE" | "UPCOMING" | ...
  startTime: string;
  endTime: string;
  items: FlashSaleItemDTO[];
}

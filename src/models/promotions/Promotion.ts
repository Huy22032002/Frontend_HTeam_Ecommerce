export interface PromotionReadableDTO {
  id: number;
  promotionCode: string;
  promotionName: string;
  type: string;
  value: number;
  status: string;
  startDate: string;
  endDate: string;
  appliedCount?: number;
}

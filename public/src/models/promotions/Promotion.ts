export interface PromotionReadableDTO {
  id: number;
  code: string;
  description: string;
  discountPercentage?: number;
  discountAmount?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  applicableProductOptions?: ProductOptionDTO[];
}

export interface ProductOptionDTO {
  id: number;
  sku: string;
  code: string;
  name: string;
  value: string;
}

export interface CreatePromotionRequest {
  code: string;
  description: string;
  discountPercentage?: number;
  discountAmount?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  applicableProductOptionIds?: number[];
  applicableProductOptionSkus?: string[];
}

export interface UpdatePromotionRequest {
  id: number;
  description: string;
  discountPercentage?: number;
  discountAmount?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  applicableProductOptionIds?: number[];
  applicableProductOptionSkus?: string[];
}

import type { Category } from './Category';

export interface ProductDimensions {
  // Định nghĩa các trường dimensions nếu cần
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
}

export interface Product {
  id: number;
  productName: string;
  dimensions?: ProductDimensions;
  listRelationships?: any[];
  listCategories?: Category[];
  productType?: string;
  variants?: any[];
  dateAvailable?: string;
  available?: boolean;
  preOrder?: boolean;
  manufacturer?: any;
  taxClass?: any;
  productReviewAvg?: number;
  productReviewCount?: number;
  productOrdered?: number;
  sortOrder?: number;
  // Có thể bổ sung các trường khác nếu cần
}

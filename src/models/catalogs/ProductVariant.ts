export interface ProductVariant {
  id: number;
  product?: any; // Có thể là Product hoặc chỉ id
  code?: string;
  sku: string;
  options?: any[];
  defaultSelection?: boolean;
  sortOrder?: number;
  specs?: string;
  specsTransient?: Record<string, any>;
}

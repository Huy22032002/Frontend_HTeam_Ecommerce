export interface CreateProduct {
  productName: string;
  productDescription?: string;
  categoryIds: number[];
  manufacturerId: number;
  taxClassId: number;
  variants: Variant[];
}

export interface Variant {
  name: string; // VD: DareU ESP100 - Small
  code: string; // VD: dareu-esp100-small
  options: Option[]; // danh sách màu
  specifications?: any;
}

export interface Option {
  sku: string; // Mã SKU riêng cho option
  code: string; // Loại thuộc tính (color)
  value: string; // Giá trị thuộc tính (Đỏ, Đen)
  images?: ProductImage[]; // Danh sách hình ảnh
  availability: Availability;
}

export interface Availability {
  regularPrice: number;
  salePrice: number;
  quantity: number;
}

export interface ProductImage {
  files?: File[]; //preview
  productImageUrl: string;
  altTag?: string;
  sortOrder?: number;
}

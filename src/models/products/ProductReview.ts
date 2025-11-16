export interface CreateReviewDto {
  customerId: number | null;
  sku: string;
  comment?: string;
  rating: number;
  images?: string[] | null;
  files?: File[]; //chi dung o frontend
}

export interface ReadableProductReview {
  id: number;
  reviewRating: number;
  likeCount?: number | null;
  reviewDate?: string;
  status?: number | null;
  comment?: string | null;
  imageUrls?: string[];
  customerId?: number | null;
  customerName?: string | null;
  productVariantOptionId?: number | null;
  productVariantOptionName?: string | null;
  orderItemId?: number | null;
  productVariantId?: number | null;
}

export interface Category {
  id: number;
  name: string;
  code: string;
  sortOrder: number;
  visible: boolean;
  featured: boolean;
  imageUrl?: string;
  parentCode?: string;
  parentName?: string;
  categoryImage?: string;
  Category?: [];
}

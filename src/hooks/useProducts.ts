import { useEffect, useState } from 'react';
import type { Product } from '../models/catalogs/Product';
import { ProductApi } from '../api/product/ProductApi';

export function useProducts(page = 0, size = 20) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    ProductApi.getAll(page, size)
      .then(res => {
        // Nếu backend trả về Page<Product>
        if (res.data && res.data.content) {
          setProducts(res.data.content);
        } else if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [page, size]);

  return { products, loading, error };
}

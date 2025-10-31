import { useEffect, useState, useRef } from 'react';
import type { Product } from '../models/catalogs/Product';
import { ProductApi } from '../api/product/ProductApi';

export function useProducts(page = 0, size = 20) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  
  // Use ref to prevent double-loading in React StrictMode (dev only)
  const hasLoadedRef = useRef(false);
  const prevParamsRef = useRef({ page, size });

  useEffect(() => {
    // Check if params changed
    const paramsChanged = prevParamsRef.current.page !== page || prevParamsRef.current.size !== size;
    
    // In StrictMode (dev), useEffect runs twice. Prevent double API calls.
    if (hasLoadedRef.current && !paramsChanged) {
      console.log("🔄 Skipping duplicate products fetch due to StrictMode");
      return;
    }
    
    hasLoadedRef.current = true;
    prevParamsRef.current = { page, size };
    
    console.log(`📦 Loading products (page: ${page}, size: ${size})...`);
    setLoading(true);
    
    ProductApi.getAll(page, size)
      .then(res => {
        console.log("✅ Products loaded:", res.data?.content?.length || res.data?.length || 0, "items");
        // Nếu backend trả về Page<Product>
        if (res.data && res.data.content) {
          setProducts(res.data.content);
        } else if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      })
      .catch(e => {
        console.error("❌ Products error:", e);
        setError(e);
      })
      .finally(() => setLoading(false));
  }, [page, size]);

  return { products, loading, error };
}


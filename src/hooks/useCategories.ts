import { useEffect, useState, useRef } from 'react';
import type { Category } from '../models/catalogs/Category';
import { CategoryApi } from '../api/catalog/CategoryApi';

export function useCategories(page = 0, size = 100) { // Default size to 100 for categories
  const [categories, setCategories] = useState<Category[]>([]);
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
      console.log("🔄 Skipping duplicate categories fetch due to StrictMode");
      return;
    }
    
    hasLoadedRef.current = true;
    prevParamsRef.current = { page, size };
    
    console.log(`📦 Loading categories (page: ${page}, size: ${size})...`);
    setLoading(true);
    
    CategoryApi.getAll(page, size)
      .then(res => {
        console.log("✅ Categories loaded:", res.data?.length || 0, "items");
        // Handle Spring Boot's Page object
        if (res.data && res.data.content) {
          setCategories(res.data.content);
        } else if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          setCategories([]);
        }
      })
      .catch(e => {
        console.error("❌ Categories error:", e);
        setError(e);
      })
      .finally(() => setLoading(false));
  }, [page, size]);

  return { categories, loading, error };
}


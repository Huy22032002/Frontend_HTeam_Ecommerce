import { useEffect, useState } from 'react';
import type { Category } from '../models/catalogs/Category';
import { CategoryApi } from '../api/catalog/CategoryApi';

export function useCategories(page = 0, size = 100) { // Default size to 100 for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    CategoryApi.getAll(page, size)
      .then(res => {
        // Handle Spring Boot's Page object
        if (res.data && res.data.content) {
          setCategories(res.data.content);
        } else if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
            setCategories([]);
        }
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [page, size]);

  return { categories, loading, error };
}

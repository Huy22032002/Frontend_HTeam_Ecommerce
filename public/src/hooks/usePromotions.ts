import { useEffect, useState } from 'react';
import type { PromotionReadableDTO } from '../models/promotions/Promotion';
import { PromotionApi, type PromotionFilters } from '../api/promotion/PromotionApi';

export function usePromotions(initialFilters: PromotionFilters = {}) {
  const [promotions, setPromotions] = useState<PromotionReadableDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const refetch = async () => {
    setLoading(true);
    try {
      const res = await PromotionApi.getAll(initialFilters);
      if (res.data && res.data.content) {
        setPromotions(res.data.content);
      } else if (Array.isArray(res.data)) {
        setPromotions(res.data);
      } else {
        setPromotions([]);
      }
      setError(null);
    } catch (err) {
      setError(err);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [initialFilters.page, initialFilters.size]);

  return { promotions, loading, error, refetch };
}

// Hook lấy khuyến mãi theo trạng thái active
export function usePromotionsByActive(active: boolean) {
  const [promotions, setPromotions] = useState<PromotionReadableDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    
    // Dùng endpoint công khai để lấy active promotions
    PromotionApi.getAllActive({})
      .then(res => {
        let data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        
        console.log('[usePromotionsByActive] Raw data:', data);
        console.log('[usePromotionsByActive] Data count:', data.length);
        
        setPromotions(data);
        setError(null);
      })
      .catch(err => {
        console.error('[usePromotionsByActive] Error:', err);
        setError(err);
        setPromotions([]);
      })
      .finally(() => setLoading(false));
  }, [active]);

  return { promotions, loading, error };
}

// Hook lấy khuyến mãi theo SKU sản phẩm
export function usePromotionsByProductSku(sku: string) {
  const [promotions, setPromotions] = useState<PromotionReadableDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!sku) {
      setPromotions([]);
      return;
    }

    setLoading(true);
    PromotionApi.getByProductSku(sku)
      .then(res => {
        if (Array.isArray(res.data)) {
          setPromotions(res.data);
        } else if (res.data && res.data.content) {
          setPromotions(res.data.content);
        } else {
          setPromotions([]);
        }
        setError(null);
      })
      .catch(err => {
        setError(err);
        setPromotions([]);
      })
      .finally(() => setLoading(false));
  }, [sku]);

  return { promotions, loading, error };
}

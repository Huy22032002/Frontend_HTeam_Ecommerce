import { useEffect, useState } from 'react';
import type { PromotionReadableDTO } from '../models/promotions/Promotion';
import { PromotionApi, type PromotionFilters } from '../api/promotion/PromotionApi';

export function usePromotions(initialFilters: PromotionFilters = {}) {
  const [promotions, setPromotions] = useState<PromotionReadableDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    PromotionApi.getAll(initialFilters)
      .then(res => {
        if (res.data && res.data.content) {
          setPromotions(res.data.content);
        } else if (Array.isArray(res.data)) {
          setPromotions(res.data);
        } else {
          setPromotions([]);
        }
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { promotions, loading, error };
}

// Hook lấy khuyến mãi theo trạng thái active
export function usePromotionsByActive(active: boolean) {
  const [promotions, setPromotions] = useState<PromotionReadableDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    PromotionApi.getByActive(active)
      .then(res => {
        if (Array.isArray(res.data)) {
          setPromotions(res.data);
        } else if (res.data && res.data.content) {
          setPromotions(res.data.content);
        } else {
          setPromotions([]);
        }
      })
      .catch(setError)
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
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [sku]);

  return { promotions, loading, error };
}

import { useEffect, useState } from 'react';
import type { WarehouseReadableDTO } from '../models/warehouses/Warehouse';
import { WarehouseApi, type WarehouseFilters } from '../api/warehouse/WarehouseApi';

export function useWarehouses(initialFilters: WarehouseFilters = {}) {
  const [warehouses, setWarehouses] = useState<WarehouseReadableDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    WarehouseApi.getAll(initialFilters)
      .then(res => {
        if (res.data && res.data.content) {
          setWarehouses(res.data.content);
        } else if (Array.isArray(res.data)) {
          setWarehouses(res.data);
        } else {
          setWarehouses([]);
        }
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { warehouses, loading, error };
}

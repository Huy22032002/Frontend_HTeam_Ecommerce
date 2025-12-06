import { useEffect, useState } from "react";
import type { FlashSaleDTO } from "../../../models/flashSale/FlashSaleDTO";
import { FlashSaleApi } from "../../../api/flashsale/FlashSaleApi";

const useFlashSale = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [flashSales, setFlashSales] = useState<FlashSaleDTO[]>([]);
  const getAllFlashSales = async () => {
    try {
      const data = await FlashSaleApi.getAll(0, 10);
      if (data && Array.isArray(data.content)) {
        setFlashSales(data.content);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllFlashSales();
  }, []);

  return { flashSales, error, loading };
};

export default useFlashSale;

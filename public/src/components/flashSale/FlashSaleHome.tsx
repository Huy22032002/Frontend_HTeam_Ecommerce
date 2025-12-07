import { useEffect, useState } from "react";
import { FlashSaleApi } from "../../api/flashsale/FlashSaleApi";
import type { FlashSaleItemDTO } from "../../models/flashSale/FlashSaleItemDTO";
import FlashSaleUI from "./FlashSaleUI";

const FlashSaleHome = () => {
  const [items, setItems] = useState<FlashSaleItemDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    FlashSaleApi.getActiveFlashSale(0, 20)
      .then((res) => {
        setItems(res.content);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading Flash Sale...</p>;
  if (!items.length) return <></>;

  return <FlashSaleUI items={items} />;
};

export default FlashSaleHome;

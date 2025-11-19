import { useState } from "react";
import type { CreateFlashSaleDTO } from "../../../models/flashSale/CreateFlashSaleDTO";
import { FlashSaleApi } from "../../../api/flashsale/FlashSaleApi";
import type { FlashSaleItemDTO } from "../../../models/flashSale/FlashSaleItemDTO";
import { useNavigate } from "react-router-dom";

const useCreateFlashSale = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  //state tao FlashSale
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("UPCOMING");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [items, setItems] = useState<FlashSaleItemDTO[]>([]);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorApi(null);
    setLoading(true);

    try {
      await createFlashSale({
        name,
        description,
        status,
        startTime,
        endTime,
        items,
      });

      navigate("/admin/flash-sale");
    } catch (err: any) {
      console.error(err.message);
      setErrorApi(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createFlashSale = async (data: CreateFlashSaleDTO) => {
    try {
      setLoading(true);
      setErrorApi(null);
      await FlashSaleApi.createFlashSale(data);
      alert("Tạo Flash Sale thành công!");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.errorMessage ||
        err?.message ||
        "Lỗi khi tạo flash sale";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    errorApi,
    setErrorApi,
    createFlashSale,
    name,
    setName,
    description,
    setDescription,
    status,
    setStatus,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    items,
    setItems,
    handleSubmit,
  };
};
export default useCreateFlashSale;

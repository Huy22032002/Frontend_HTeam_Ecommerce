import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { VoucherApi } from "../../../api/voucher/VoucherApi";
import { useState } from "react";
import type { Voucher } from "../../../models/vouchers/Voucher";

const useVoucher = () => {
  const customer = useSelector(
    (state: RootState) => state.customerAuth.customer
  );

  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const getVouchersByCustomerId = async () => {
    if (!customer) return;
    try {
      setLoading(true);
      const data = await VoucherApi.getByCustomerId(customer.id);
      if (data) setVouchers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Đã copy voucher: ${code}`);
  };

  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "USED" | "EXPIRED">(
    "ALL"
  );
  const filteredVouchers =
    filter === "ALL" ? vouchers : vouchers.filter((v) => v.status === filter);

  return {
    vouchers,
    getVouchersByCustomerId,
    customer,
    loading,
    handleCopy,
    filter,
    setFilter,
    filteredVouchers,
  };
};

export default useVoucher;

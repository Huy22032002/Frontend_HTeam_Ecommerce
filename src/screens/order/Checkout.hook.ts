import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { OrderApi } from "../../api/order/OrderApi";
import type { CreateOrderRequest } from "../../models/orders/CreateOrderRequest";
import {
  VIETNAM_PROVINCES,
  getDistrictsByProvince,
} from "../../utils/vietnamAddresses";

export const useCheckout = () => {
  const cart = useSelector((state: RootState) => state.cart.cart);
  const customer = useSelector(
    (state: RootState) => state.customerAuth?.customer
  );

  // Form state
  const [formData, setFormData] = useState({
    receiverName: "",
    receiverPhoneNumber: "",
    shippingAddress: "",
    notes: "",
    paymentMethod: "CASH" as "CASH" | "TRANSFER" | "CARD" | "E_WALLET",
  });

  // Address states
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState("");

  const availableDistricts = useMemo(
    () => (selectedProvince ? getDistrictsByProvince(selectedProvince) : []),
    [selectedProvince]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Init form data
  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({ ...prev, receiverName: customer.name || "" }));
    }
  }, [customer]);

  // Input handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: e.target.value as
        | "CASH"
        | "TRANSFER"
        | "CARD"
        | "E_WALLET",
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.receiverName.trim())
      return setErrorAndReturn("Vui lòng nhập họ và tên");
    if (!formData.receiverPhoneNumber.trim())
      return setErrorAndReturn("Vui lòng nhập số điện thoại");
    if (!selectedProvince)
      return setErrorAndReturn("Vui lòng chọn Tỉnh/Thành phố");
    if (!selectedDistrict) return setErrorAndReturn("Vui lòng chọn Quận/Huyện");
    if (!streetAddress.trim())
      return setErrorAndReturn("Vui lòng nhập số nhà, đường phố");
    if (!cart?.items || cart.items.length === 0)
      return setErrorAndReturn("Giỏ hàng trống");
    return true;
  };

  const setErrorAndReturn = (msg: string) => {
    setError(msg);
    return false;
  };

  const subtotal = useMemo(
    () =>
      cart?.items?.reduce(
        (sum, item) => sum + item.currentPrice * item.quantity,
        0
      ) || 0,
    [cart]
  );

  const handleSubmitOrder = async (
    customerId: string,
    onSuccess?: () => void
  ) => {
    if (!validateForm()) return;
    if (!customerId) return setError("Vui lòng đăng nhập để tiếp tục");

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const provinceName =
        VIETNAM_PROVINCES.find((p) => p.id === selectedProvince)?.name || "";
      const districtName =
        availableDistricts.find((d) => d.id === selectedDistrict)?.name || "";

      const fullAddress = [streetAddress, districtName, provinceName]
        .filter(Boolean)
        .join(", ");

      const items = (cart?.items || []).map((item) => ({
        variantId: item.optionId,
        productVariantOptionId: item.optionId,
        sku: item.sku,
        quantity: item.quantity,
        price: item.currentPrice,
      }));

      const orderRequest: CreateOrderRequest = {
        customerId,
        items,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || "",
        shippingAddress: fullAddress,
        receiverPhoneNumber: formData.receiverPhoneNumber,
        totalAmount: subtotal,
        customerCartCode: cart?.cartCode || "",
      };

      const response = await OrderApi.createByCustomer(orderRequest as any);
      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("✅ Tạo đơn hàng thành công!");
        onSuccess?.();
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra khi tạo đơn hàng";
      setError(errorMessage);
      console.error("Checkout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cart,
    customer,
    formData,
    handleInputChange,
    handlePaymentMethodChange,
    selectedProvince,
    setSelectedProvince,
    selectedDistrict,
    setSelectedDistrict,
    streetAddress,
    setStreetAddress,
    availableDistricts,
    isLoading,
    error,
    successMessage,
    subtotal,
    handleSubmitOrder,
    setError,
    setSuccessMessage,
  };
};

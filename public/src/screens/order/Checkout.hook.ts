import { useEffect, useState } from "react";
import { CustomerDeliveryApi } from "../../api/customer/CustomerDeliveryApi";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useLocation, useNavigate } from "react-router-dom";
import type { ReadableCustomerDelivery } from "../../models/customer/ReadablerCustomerDelivery";
import type { CreateOrderRequest } from "../../models/orders/CreateOrderRequest";
import { OrderApi } from "../../api/order/OrderApi";
import { clearCart } from "../../store/cartSlice";
import { MomoApi } from "../../api/MomoApi";
import type { CreateCustomerDelivery } from "../../models/customer/CreateCustomerDelivery";
import type { Voucher } from "../../models/vouchers/Voucher";
import { VoucherApi } from "../../api/voucher/VoucherApi";

const useCheckout = () => {
  //voucher
  const [vouchers, setVoucher] = useState<Voucher[]>([]);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const getAvailableVouchers = async () => {
    if (!customer) return;
    const data = await VoucherApi.getByCustomerId(customer.id);
    if (data) {
      setVoucher(
        data.filter(
          (voucher) =>
            voucher.minOrder <= finalTotal && voucher.status === "ACTIVE"
        )
      );
    }
  };
  const voucherDiscount = selectedVoucher?.value ? selectedVoucher.value : 0;

  //----------------

  const [error, setError] = useState<string | null>(null);
  const [errorApi, setErrorApi] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [qrCode, setQrCode] = useState("");
  const [orderId, setOrderId] = useState(null);

  // Address states
  const [openForm, setOpenForm] = useState(false);

  //getListDelivery of Customer
  const customer = useSelector(
    (state: RootState) => state.customerAuth?.customer
  );
  const [listAddress, setListAddress] = useState<ReadableCustomerDelivery[]>(
    []
  );

  const addAddress = async (data: CreateCustomerDelivery) => {
    if (!customer?.id) return;

    console.log("add delivery: ", data);

    await CustomerDeliveryApi.add(customer.id, data);
    await getAllAddress();
    setOpenForm(false);
  };

  const getAllAddress = async () => {
    if (!customer?.id) return;
    const res = await CustomerDeliveryApi.getList(customer.id);
    setListAddress(res.data);
  };
  const [showListAddresses, setShowListAddresses] = useState(false);

  const handleSelecteAddress = (addr: ReadableCustomerDelivery) => {
    setFormData((prev) => ({
      ...prev,
      receiverName: addr.recipientName || "",
      receiverPhoneNumber: addr.phone || "",
      shippingAddress: addr.fullAddress || "",
    }));
    // setStreetAddress(addr.fullAddress || "");
    setShowListAddresses(false);
  };

  //lay ra address ban đầu mặc định
  useEffect(() => {
    if (listAddress.length > 0) {
      // Lấy địa chỉ mặc định
      const defaultAddr = listAddress.find((addr) => addr.isDefault);
      if (defaultAddr) {
        setFormData((prev) => ({
          ...prev,
          receiverName: defaultAddr.recipientName || "",
          receiverPhoneNumber: defaultAddr.phone || "",
          shippingAddress: defaultAddr.fullAddress || "",
        }));
        // setStreetAddress(defaultAddr.fullAddress || "");
      }
    }
  }, [listAddress]);

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //----------------------------

  // Redux state
  const cart = useSelector((state: RootState) => state.cart.cart);

  const itemPromotionsRedux = useSelector(
    (state: RootState) => state.cart.itemPromotions
  );

  // Lấy sản phẩm từ "Mua ngay"
  const directProduct = (location.state as any)?.directProduct;

  // Form state
  const [formData, setFormData] = useState({
    receiverName: "",
    receiverPhoneNumber: "",
    shippingAddress: "",
    notes: "",
    paymentMethod: "CASH" as "CASH" | "TRANSFER" | "CARD" | "MOMO",
  });

  //tên + sdt + địa chỉ + note
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitOrder = async () => {
    if (!customer?.id) {
      setError("Vui lòng đăng nhập để tiếp tục");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Chuyển đổi cart items thành order items hoặc sử dụng sản phẩm từ "Mua ngay"
      let items;
      let totalAmount;

      if (directProduct) {
        // Từ "Mua ngay" - không gửi customerCartCode
        const directProductPromotion =
          itemPromotionsRedux[directProduct.optionId];
        const orderItem: any = {
          variantId: directProduct.optionId,
          productVariantOptionId: directProduct.optionId,
          sku: directProduct.sku,
          productName: directProduct.name,
          quantity: directProduct.quantity,
          price: directProduct.currentPrice,
        };

        // Add promotion info if exists
        if (directProductPromotion) {
          orderItem.promotionId = directProductPromotion.id;
          const itemTotal = directProduct.currentPrice * directProduct.quantity;
          if (directProductPromotion.discountPercentage) {
            orderItem.discountAmount =
              (itemTotal * directProductPromotion.discountPercentage) / 100;
          } else if (directProductPromotion.discountAmount) {
            orderItem.discountAmount = directProductPromotion.discountAmount;
          }
        }

        items = [orderItem];
        totalAmount = finalTotal; // Use final total after discount
      } else {
        // Từ giỏ hàng
        items = (cart?.items || []).map((item) => {
          const promotion = itemPromotionsRedux[item.id!];
          const orderItem: any = {
            variantId: item.optionId,
            productVariantOptionId: item.optionId,
            sku: item.sku,
            productName: item.productName,
            quantity: item.quantity,
            price: item.currentPrice,
          };

          // Add promotion info if exists
          if (promotion) {
            orderItem.promotionId = promotion.id;
            const itemTotal = item.currentPrice * item.quantity;
            if (promotion.discountPercentage) {
              orderItem.discountAmount =
                (itemTotal * promotion.discountPercentage) / 100;
            } else if (promotion.discountAmount) {
              orderItem.discountAmount = promotion.discountAmount;
            }
          }

          return orderItem;
        });
        totalAmount = finalTotal; // Use final total after discount
      }

      const orderRequest: CreateOrderRequest = {
        customerId: customer.id,
        items,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || "",
        shippingAddress: formData.shippingAddress,
        receiverName: formData.receiverName,
        receiverPhoneNumber: formData.receiverPhoneNumber,
        voucherCode: selectedVoucher?.code,
        totalAmount,
        ...(directProduct ? {} : { customerCartCode: cart?.cartCode || "" }),
      };

      console.log(
        "📤 Order request gửi lên:",
        JSON.stringify(orderRequest, null, 2)
      );

      const response = await OrderApi.createByCustomer(orderRequest as any);

      //qr code
      if (formData.paymentMethod === "MOMO") {
        console.log(formData.paymentMethod);

        console.log("order vừa tạo: ", response.data);

        try {
          // Gọi API tạo thanh toán MoMo
          const data = {
            amount: response.data.total,
            orderId: response.data.id,
            orderInfo: `Thanh toán đơn hàng #${response.data.id}`,
          };

          const qrCodeResponse = await MomoApi.createQRCode(
            data.amount,
            data.orderId,
            data.orderInfo
          );
          if (qrCodeResponse) {
            setQrCode(qrCodeResponse);
            setOrderId(data.orderId);
            setSuccessMessage("✅ Tạo QR code thành công! Vui lòng quét để thanh toán.");
            console.log("qr code: ", qrCodeResponse);
            return;
          }
        } catch (error) {
          console.error("MoMo payment error:", error);
          setError("Có lỗi khi khởi tạo thanh toán MoMo.");
        }
      }

      console.log(formData.paymentMethod);

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("✅ Tạo đơn hàng thành công!");

        // Xoá cart items từ Redux nếu checkout từ giỏ hàng
        if (!directProduct && cart?.cartCode) {
          dispatch(clearCart());
        }

        // Chuyển hướng sau 2 giây
        setTimeout(() => {
          navigate("/customer/orders-history", { replace: true });
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage =
        typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.message || "Lỗi khi tạo order";
      setErrorApi(errorMessage);
      setIsLoading(false);
    }
  };

  // Tính tổng tiền
  const subtotal = directProduct
    ? directProduct.currentPrice * directProduct.quantity
    : cart?.items?.reduce(
        (sum, item) => sum + item.currentPrice * item.quantity,
        0
      ) || 0;

  // Calculate discount from promotions
  const calculateTotalDiscount = () => {
    let totalDiscount = 0;

    // Kiểm tra promotion cho "Mua ngay"
    if (directProduct) {
      const directProductPromotion =
        itemPromotionsRedux[directProduct.optionId];
      if (directProductPromotion) {
        const itemTotal = directProduct.currentPrice * directProduct.quantity;
        if (directProductPromotion.discountPercentage) {
          totalDiscount +=
            (itemTotal * directProductPromotion.discountPercentage) / 100;
        } else if (directProductPromotion.discountAmount) {
          totalDiscount += directProductPromotion.discountAmount;
        }
      }
    } else if (cart?.items) {
      // Kiểm tra promotion cho giỏ hàng
      cart.items.forEach((item) => {
        const promotion = itemPromotionsRedux[item.id!];
        if (promotion) {
          const itemTotal = item.currentPrice * item.quantity;
          if (promotion.discountPercentage) {
            totalDiscount += (itemTotal * promotion.discountPercentage) / 100;
          } else if (promotion.discountAmount) {
            totalDiscount += promotion.discountAmount;
          }
        }
      });
    }
    return totalDiscount;
  };

  const discount = calculateTotalDiscount();
  const finalTotal = subtotal - discount - voucherDiscount;

  useEffect(() => {
    getAllAddress();
    getAvailableVouchers();
  }, []);

  // Polling: Kiểm tra trạng thái đơn hàng mỗi 3s
  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        const response = await OrderApi.getByIdOfCustomer(orderId);
        const order = response.data;
        console.log("Order status:", order.status);
        if (order.status === "APPROVED") {
          clearInterval(interval);
          alert("Thanh toán thành công!");
          navigate(`/customer/orders-history`);
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra trạng thái đơn hàng:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, navigate]);

  return {
    //qrcode
    qrCode,
    orderId,
    customer,
    //state address
    showListAddresses,
    setShowListAddresses,
    listAddress,
    // streetAddress,
    // setStreetAddress,
    //handle
    handleSelecteAddress,
    handleInputChange,
    handleSubmitOrder,
    //form data
    formData,
    setFormData,
    //error
    errorApi,
    setErrorApi,
    successMessage,
    setSuccessMessage,
    isLoading,
    error,
    setError,
    //direct product & cart
    directProduct,
    cart,
    //subtotal discount
    discount,
    subtotal,
    finalTotal,
    addAddress,
    setOpenForm,
    openForm,
    //voucher
    vouchers,
    getAvailableVouchers,
    selectedVoucher,
    setSelectedVoucher,
    voucherModalOpen,
    setVoucherModalOpen,
  };
};

export default useCheckout;

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

const useCheckout = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [qrCode, setQrCode] = useState("");
  const [orderId, setOrderId] = useState(null);

  // Address states
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  //getListDelivery of Customer
  const customer = useSelector(
    (state: RootState) => state.customerAuth?.customer
  );
  const [listAddress, setListAddress] = useState<ReadableCustomerDelivery[]>(
    []
  );

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
    setStreetAddress(addr.fullAddress || "");
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
        setStreetAddress(defaultAddr.fullAddress || "");
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
          navigate("/order-history", { replace: true });
        }, 2000);
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
  const finalTotal = subtotal - discount;

  useEffect(() => {
    getAllAddress();
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
    customer,
    //state address
    showListAddresses,
    setShowListAddresses,
    listAddress,
    streetAddress,
    setStreetAddress,
    //handle
    handleSelecteAddress,
    handleInputChange,
    handleSubmitOrder,
    //form data
    formData,
    setFormData,
    //error
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
  };
};

export default useCheckout;

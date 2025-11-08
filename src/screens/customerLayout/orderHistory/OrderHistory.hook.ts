import { useState } from "react";
import type { OrderReadableDTO } from "../../../models/orders/Order";

const useOrderHistoryy = () => {
  // Dialog state
  const [selectedOrder, setSelectedOrder] = useState<OrderReadableDTO | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [openCancelRestrictionDialog, setOpenCancelRestrictionDialog] =
    useState(false);
  const [cancelRestrictionMessage, setCancelRestrictionMessage] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  //-------------------

  //render
  const getStatusColor = (
    status: string
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "info"
    | "success" => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "APPROVED":
        return "info";
      case "PROCESSING":
        return "info";
      case "SHIPPING":
        return "warning";
      case "DELIVERED":
        return "success";
      case "PAID":
        return "success";
      case "CANCELLED":
        return "error";
      case "REFUNDED":
        return "error";
      case "PARTIALLY_REFUNDED":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "APPROVED":
        return "Đã xác nhận";
      case "PROCESSING":
        return "Đang xử lý";
      case "SHIPPING":
        return "Đang giao";
      case "DELIVERED":
        return "Đã giao";
      case "PAID":
        return "Đã thanh toán";
      case "CANCELLED":
        return "Đã hủy";
      case "REFUNDED":
        return "Hoàn tiền";
      case "PARTIALLY_REFUNDED":
        return "Hoàn một phần";
      default:
        return status;
    }
  };

  //------------------------

  return {
    selectedOrder,
    setSelectedOrder,
    openDialog,
    setOpenDialog,
    cancelLoading,
    setCancelLoading,
    cancelRestrictionMessage,
    setCancelRestrictionMessage,
    openCancelRestrictionDialog,
    setOpenCancelRestrictionDialog,
    snackbar,
    setSnackbar,
    //color/label render
    getStatusColor,
    getStatusLabel,
  };
};

export default useOrderHistoryy;

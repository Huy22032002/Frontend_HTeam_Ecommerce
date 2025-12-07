import { useState } from "react";
import { CustomerDeliveryApi } from "../../../api/customer/CustomerDeliveryApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import type { CreateCustomerDelivery } from "../../../models/customer/CreateCustomerDelivery";
import type { ReadableCustomerDelivery } from "../../../models/customer/ReadablerCustomerDelivery";

const useListAddress = () => {
  const customer = useSelector((s: RootState) => s.customerAuth.customer);

  const [listAddress, setListAddress] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState<ReadableCustomerDelivery | null>(null);

  const getAllAddress = async () => {
    if (!customer?.id) return;
    const res = await CustomerDeliveryApi.getList(customer.id);
    setListAddress(res.data);
  };

  const addAddress = async (data: CreateCustomerDelivery) => {
    if (!customer?.id) return;

    console.log("add delivery: ", data);

    await CustomerDeliveryApi.add(customer.id, data);
    await getAllAddress();
    setOpenForm(false);
  };

  const removeAddress = async (deliveryId: number) => {
    if (!customer?.id) return;
    await CustomerDeliveryApi.remove(customer.id, deliveryId);
    await getAllAddress();
  };

  const updateAddress = async (
    deliveryId: number,
    delivery: CreateCustomerDelivery
  ) => {
    if (!customer?.id) return;

    await CustomerDeliveryApi.update(customer.id, deliveryId, delivery);
    await getAllAddress();
  };

  return {
    getAllAddress,
    listAddress,
    openForm,
    setOpenForm,
    addAddress,
    removeAddress,
    editingAddress,
    setEditingAddress,
    updateAddress,
  };
};

export default useListAddress;

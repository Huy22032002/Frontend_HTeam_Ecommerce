const backendEndpoint = import.meta.env.VITE_BASE_URL;

import axios from "axios";
import type { CreateCustomerDelivery } from "../../models/customer/CreateCustomerDelivery";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const CustomerDeliveryApi = {
  getList(customerId: number) {
    return axios.get(
      `${backendEndpoint}/api/customers/${customerId}/deliveries`,
      { headers: getAuthHeader() }
    );
  },
  add(customerId: number, data: CreateCustomerDelivery) {
    return axios.post(
      `${backendEndpoint}/api/customers/${customerId}/deliveries`,
      data,
      { headers: getAuthHeader() }
    );
  },
  update(customerId: number, deliveryId: number, data: CreateCustomerDelivery) {
    return axios.put(
      `${backendEndpoint}/api/customers/${customerId}/deliveries/${deliveryId}`,
      data,
      { headers: getAuthHeader() }
    );
  },

  remove(customerId: number, deliveryId: number) {
    return axios.delete(
      `${backendEndpoint}/api/customers/${customerId}/deliveries/${deliveryId}`,
      { headers: getAuthHeader() }
    );
  },
  getProvince() {
    return axios.get(`${backendEndpoint}/api/public/location/provinces`);
  },
};

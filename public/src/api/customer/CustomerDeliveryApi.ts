const backendEndpoint = import.meta.env.VITE_BASE_URL;

import axios from "axios";
import { getCustomerToken } from "../../utils/tokenUtils";
import type { CreateCustomerDelivery } from "../../models/customer/CreateCustomerDelivery";

export const CustomerDeliveryApi = {
  getList(customerId: number) {
    return axios.get(
      `${backendEndpoint}/api/customers/${customerId}/deliveries`,
      { headers: { Authorization: `Bearer ${getCustomerToken()}` } }
    );
  },
  add(customerId: number, data: CreateCustomerDelivery) {
    return axios.post(
      `${backendEndpoint}/api/customers/${customerId}/deliveries`,
      data,
      { headers: { Authorization: `Bearer ${getCustomerToken()}` } }
    );
  },
  update(customerId: number, deliveryId: number, data: CreateCustomerDelivery) {
    return axios.put(
      `${backendEndpoint}/api/customers/${customerId}/deliveries/${deliveryId}`,
      data,
      { headers: { Authorization: `Bearer ${getCustomerToken()}` } }
    );
  },

  remove(customerId: number, deliveryId: number) {
    return axios.delete(
      `${backendEndpoint}/api/customers/${customerId}/deliveries/${deliveryId}`,
      { headers: { Authorization: `Bearer ${getCustomerToken()}` } }
    );
  },
  getProvince() {
    return axios.get(`${backendEndpoint}/api/public/location/provinces`);
  },
};

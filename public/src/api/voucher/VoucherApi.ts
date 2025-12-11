const backendEndpoint = import.meta.env.VITE_BASE_URL;
import axios from "axios";
import { getCustomerToken } from "../../utils/tokenUtils";
import type { Voucher } from "../../models/vouchers/Voucher";

function getAuthHeader() {
  const token = getCustomerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const VoucherApi = {
  // GET CUSTOMER'S REVIEWS
  getByCustomerId: async (customerId: number): Promise<Voucher[]> => {
    const response = await axios.get(
      `${backendEndpoint}/api/customers/${customerId}/vouchers`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
};

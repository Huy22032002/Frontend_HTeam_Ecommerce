import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";

import { ColorModeContext, useMode } from "./theme/theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { CmsLayout } from "./components/cms/CmsLayout";

//screens
import AdminLoginScreen from "./screens/admin/AdminLoginScreen";
import DashboardScreen from "./screens/dashboard/DashboardScreen";
import ActivityLogScreen from "./screens/activity/ActivityLogScreen";
import ReportsScreen from "./screens/reports/ReportsScreen";
import UserManagementScreen from "./screens/users/UserManagementScreen";
import ProductListScreen from "./screens/products/ProductListScreen";
import CreateProductScreen from "./screens/admin/products/CreateProductScreen";

import ProductVariantListScreen from "./screens/products/ProductVariantListScreen";
import CategoryListScreen from "./screens/products/CategoryListScreen";
import OrderListScreen from "./screens/transactions/OrderListScreen";
import OrderDetailScreen from "./screens/transactions/OrderDetailScreen";
import InvoiceDetailScreen from "./screens/transactions/InvoiceDetailScreen";
import ShipmentListScreen from "./screens/transactions/ShipmentListScreen";
import ReturnListScreen from "./screens/transactions/ReturnListScreen";
import WarehouseScreen from "./screens/warehouse/WarehouseScreen";
import PartnerListScreen from "./screens/partners/PartnerListScreen";
import WarrantyScreen from "./screens/warranty/WarrantyScreen";
import PageListScreen from "./screens/pages/PageListScreen";
import PromotionListScreen from "./screens/promotions/PromotionListScreen";
import InvoiceListScreen from "./screens/transactions/InvoiceListScreen";
import PaymentListScreen from "./screens/transactions/PaymentListScreen";
import CreateOrderScreen from "./screens/admin/CreateOrderScreen";

function AdminAppContent() {
  return (
    <Routes>
      {/* Login route */}
      <Route path="/admin/login" element={<AdminLoginScreen />} />

      {/* Admin routes with CmsLayout */}
      <Route
        path="/admin/*"
        element={
          <CmsLayout>
            <Routes>
              <Route path="dashboard" element={<DashboardScreen />} />
              <Route path="activity-log" element={<ActivityLogScreen />} />
              <Route path="reports" element={<ReportsScreen />} />
              <Route path="users" element={<UserManagementScreen />} />
              <Route path="products" element={<ProductListScreen />} />
<<<<<<< feature/createProductScreen
              <Route path="create-product" element={<CreateProductScreen />} />
=======
              <Route path="product-variants" element={<ProductVariantListScreen />} />
>>>>>>> dev
              <Route path="categories" element={<CategoryListScreen />} />
              <Route path="orders" element={<OrderListScreen />} />
              <Route path="orders/create" element={<CreateOrderScreen />} />
              <Route path="orders/:orderId" element={<OrderDetailScreen />} />
              <Route path="invoices" element={<InvoiceListScreen />} />
              <Route
                path="invoices/:invoiceId"
                element={<InvoiceDetailScreen />}
              />
              <Route path="payments" element={<PaymentListScreen />} />
              <Route path="shipments" element={<ShipmentListScreen />} />
              <Route path="returns" element={<ReturnListScreen />} />
              <Route path="warehouse" element={<WarehouseScreen />} />
              <Route path="partners" element={<PartnerListScreen />} />
              <Route path="warranty" element={<WarrantyScreen />} />
              <Route path="pages" element={<PageListScreen />} />
              <Route path="promotions" element={<PromotionListScreen />} />
              {/* Redirect root /admin to dashboard */}
              <Route path="*" element={<DashboardScreen />} />
            </Routes>
          </CmsLayout>
        }
      />
    </Routes>
  );
}

function AdminApp() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AdminAppContent />
          </Router>
        </ThemeProvider>
      </Provider>
    </ColorModeContext.Provider>
  );
}

export default AdminApp;

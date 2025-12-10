import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";

import { ColorModeContext, useMode } from "./theme/theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { CmsLayout } from "./components/cms/CmsLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

//screens
import AdminLoginScreen from "./screens/admin/AdminLoginScreen";
import DashboardScreen from "./screens/dashboard/DashboardScreen";
import AnalyticsScreen from "./screens/analytics/AnalyticsScreen";
import ActivityLogScreen from "./screens/admin/ActivityLogScreen";
import ReportsScreen from "./screens/reports/ReportsScreen";
import UserManagementScreen from "./screens/users/UserManagementScreen";
import ProductListScreen from "./screens/products/ProductListScreen";
import CreateProductScreen from "./screens/admin/products/CreateProductScreen";
import EditProductScreen from "./screens/admin/products/EditProductScreen";

import ProductVariantListScreen from "./screens/products/ProductVariantListScreen";
import CategoryListScreen from "./screens/products/CategoryListScreen";
import ManufacturerListScreen from "./screens/manufacturer/ManufacturerListScreen";
import CreateManufacturerScreen from "./screens/manufacturer/CreateManufacturerScreen";
import EditManufacturerScreen from "./screens/manufacturer/EditManufacturerScreen";
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
import FlashSaleScreen from "./screens/admin/flashsale/FlashSaleScreen";
import CreateFlashSaleScreen from "./screens/admin/flashsale/CreateFlashSaleScreen";
import AdminChatScreen from "./screens/admin/AdminChatScreen";

function AdminAppContent() {
  return (
    <Routes>
      {/* Login route */}
      <Route path="/admin/login" element={<AdminLoginScreen />} />

      {/* Admin routes with CmsLayout - Protected */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <CmsLayout>
              <Routes>
              <Route path="dashboard" element={<DashboardScreen />} />
              <Route path="analytics" element={<AnalyticsScreen />} />
              <Route path="activity-log" element={<ActivityLogScreen />} />
              <Route path="reports" element={<ReportsScreen />} />
              <Route path="users" element={<UserManagementScreen />} />
              <Route path="products" element={<ProductListScreen />} />
              <Route path="create-product" element={<CreateProductScreen />} />
              <Route path="products/:id/edit" element={<EditProductScreen />} />
              <Route
                path="product-variants"
                element={<ProductVariantListScreen />}
              />
              <Route
                path="manufacturers"
                element={<ManufacturerListScreen />}
              />
              <Route
                path="manufacturers/create"
                element={<CreateManufacturerScreen />}
              />
              <Route
                path="manufacturers/:id/edit"
                element={<EditManufacturerScreen />}
              />
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
              <Route path="flash-sale" element={<FlashSaleScreen />} />
              <Route
                path="flash-sale/create"
                element={<CreateFlashSaleScreen />}
              />
              <Route path="chat" element={<AdminChatScreen />} />

              {/* Redirect root /admin to dashboard */}
              <Route path="*" element={<DashboardScreen />} />
            </Routes>
            </CmsLayout>
          </ProtectedRoute>
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

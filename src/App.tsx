import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";

import { ColorModeContext, useMode } from "./theme/theme";
import { CssBaseline, ThemeProvider } from "@mui/material";

import Topbar from "./components/Topbar";

//screens
import LoginScreen from "./screens/login/LoginScreen";
import SignupScreen from "./screens/signup/SignupScreen";
import HomeScreen from "./screens/home/HomeScreen";
import DashboardScreen from "./screens/dashboard/DashboardScreen";
import ActivityLogScreen from "./screens/activity/ActivityLogScreen";
import ReportsScreen from "./screens/reports/ReportsScreen";
import UserManagementScreen from "./screens/users/UserManagementScreen";
import ProductListScreen from "./screens/products/ProductListScreen";
import CategoryListScreen from "./screens/products/CategoryListScreen";
import OrderListScreen from "./screens/transactions/OrderListScreen";
import ShipmentListScreen from "./screens/transactions/ShipmentListScreen";
import ReturnListScreen from "./screens/transactions/ReturnListScreen";
import WarehouseScreen from "./screens/warehouse/WarehouseScreen";
import PartnerListScreen from "./screens/partners/PartnerListScreen";
import WarrantyScreen from "./screens/warranty/WarrantyScreen";
import PageListScreen from "./screens/pages/PageListScreen";
import PromotionListScreen from "./screens/promotions/PromotionListScreen";
import InvoiceListScreen from "./screens/transactions/InvoiceListScreen";
import PaymentListScreen from "./screens/transactions/PaymentListScreen";

function AppContent() {
  const location = useLocation();
  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
  location.pathname === "/forget-password" || 
  location.pathname.startsWith("/dashboard") ||
  location.pathname.startsWith("/activity-log") ||
  location.pathname.startsWith("/reports") ||
  location.pathname.startsWith("/users") ||
  location.pathname.startsWith("/products") ||
  location.pathname.startsWith("/categories") ||
  location.pathname.startsWith("/orders") ||
  location.pathname.startsWith("/invoices") ||
  location.pathname.startsWith("/payments") ||
  location.pathname.startsWith("/shipments") ||
  location.pathname.startsWith("/returns") ||
  location.pathname.startsWith("/warehouse") ||
  location.pathname.startsWith("/partners") ||
  location.pathname.startsWith("/warranty") ||
  location.pathname.startsWith("/pages") ||
  location.pathname.startsWith("/promotions");


  return (
    <div className="app">
      <main className="content">
        {!hideLayout && <Topbar />}
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/" element={<HomeScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/activity-log" element={<ActivityLogScreen />} />
          <Route path="/reports" element={<ReportsScreen />} />
          <Route path="/users" element={<UserManagementScreen />} />
          <Route path="/products" element={<ProductListScreen />} />
          <Route path="/categories" element={<CategoryListScreen />} />
          <Route path="/orders" element={<OrderListScreen />} />
          <Route path="/invoices" element={<InvoiceListScreen />} />
          <Route path="/payments" element={<PaymentListScreen />} />
          <Route path="/shipments" element={<ShipmentListScreen />} />
          <Route path="/returns" element={<ReturnListScreen />} />
          <Route path="/warehouse" element={<WarehouseScreen />} />
          <Route path="/partners" element={<PartnerListScreen />} />
          <Route path="/warranty" element={<WarrantyScreen />} />
          <Route path="/pages" element={<PageListScreen />} />
          <Route path="/promotions" element={<PromotionListScreen />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AppContent />
          </Router>
        </ThemeProvider>
      </Provider>
    </ColorModeContext.Provider>
  );
}

export default App;
